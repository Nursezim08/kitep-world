import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getPrismaClient } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY не задан в переменных окружения');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_call_id?: string;
  tool_calls?: any[];
  name?: string;
}

interface ProductCard {
  id: string;
  name: string;
  description: string | null;
  price: number;
  brand: string | null;
  sku: string;
  imageUrl: string | null;
  averageRating: number;
  reviewsCount: number;
  categoryId: string;
  categoryName: string | null;
  inStock: boolean;
}

async function getLocale(): Promise<'ru' | 'kg'> {
  try {
    const cookieStore = await cookies();
    const cookieLang = cookieStore.get('i18next')?.value;
    if (cookieLang === 'kg') return 'kg';
    return 'ru';
  } catch {
    return 'ru';
  }
}

function pickTranslation(translations: { locale: string; name: string; description?: string | null }[], locale: 'ru' | 'kg') {
  const exact = translations.find((t) => t.locale === locale);
  if (exact) return exact;
  return translations.find((t) => t.locale === 'ru') || translations[0] || null;
}

async function formatProduct(product: any, locale: 'ru' | 'kg'): Promise<ProductCard> {
  const translation = pickTranslation(product.product_translations || [], locale);
  const categoryTranslation = pickTranslation(product.categories?.category_translations || [], locale);
  const inventoryTotal = (product.branch_inventory || []).reduce(
    (sum: number, inv: any) => sum + (inv.quantity || 0),
    0,
  );
  const ratings = (product.reviews || []).map((r: any) => r.rating);
  const avg = ratings.length ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;

  return {
    id: product.id,
    name: translation?.name || product.sku,
    description: translation?.description ?? null,
    price: Number(product.price),
    brand: product.brand,
    sku: product.sku,
    imageUrl: product.product_images?.[0]?.image_url ?? null,
    averageRating: Number(avg.toFixed(1)),
    reviewsCount: ratings.length,
    categoryId: product.category_id,
    categoryName: categoryTranslation?.name || null,
    inStock: inventoryTotal > 0,
  };
}

const productInclude = {
  product_translations: { select: { locale: true, name: true, description: true } },
  product_images: {
    where: { status: 'active' as const },
    select: { image_url: true },
    take: 1,
  },
  branch_inventory: { select: { quantity: true } },
  reviews: { select: { rating: true } },
  categories: {
    select: {
      id: true,
      category_translations: { select: { locale: true, name: true } },
    },
  },
};

async function searchProducts(params: {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  limit?: number;
}, locale: 'ru' | 'kg'): Promise<ProductCard[]> {
  const prisma = getPrismaClient();
  const limit = Math.min(Math.max(params.limit || 5, 1), 10);

  const where: any = { status: 'active' };
  if (params.categoryId) where.category_id = params.categoryId;
  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    where.price = {};
    if (params.minPrice !== undefined) where.price.gte = params.minPrice;
    if (params.maxPrice !== undefined) where.price.lte = params.maxPrice;
  }
  if (params.query && params.query.trim().length > 0) {
    const q = params.query.trim();
    where.OR = [
      { product_translations: { some: { name: { contains: q, mode: 'insensitive' } } } },
      { product_translations: { some: { description: { contains: q, mode: 'insensitive' } } } },
      { brand: { contains: q, mode: 'insensitive' } },
      { sku: { contains: q, mode: 'insensitive' } },
    ];
  }

  const products = await prisma.products.findMany({
    where,
    include: productInclude,
    orderBy: { created_at: 'desc' },
    take: limit * 3, // запас, чтобы потом отфильтровать по наличию
  });

  let cards = await Promise.all(products.map((p) => formatProduct(p, locale)));
  if (params.inStockOnly) {
    cards = cards.filter((c) => c.inStock);
  }
  return cards.slice(0, limit);
}

async function findAlternatives(productId: string, limit: number, locale: 'ru' | 'kg'): Promise<ProductCard[]> {
  const prisma = getPrismaClient();
  const target = await prisma.products.findUnique({
    where: { id: productId },
    include: productInclude,
  });
  if (!target) return [];

  const minPrice = Number(target.price) * 0.6;
  const maxPrice = Number(target.price) * 1.6;

  const alternatives = await prisma.products.findMany({
    where: {
      status: 'active',
      id: { not: target.id },
      category_id: target.category_id,
      price: { gte: minPrice, lte: maxPrice },
    },
    include: productInclude,
    orderBy: { created_at: 'desc' },
    take: limit * 3,
  });

  let cards = await Promise.all(alternatives.map((p) => formatProduct(p, locale)));
  cards = cards.filter((c) => c.inStock);

  if (cards.length < limit) {
    // Расширяем поиск без ограничения по наличию, если совсем нет аналогов в наличии
    const fallback = await prisma.products.findMany({
      where: {
        status: 'active',
        id: { not: target.id },
        category_id: target.category_id,
      },
      include: productInclude,
      orderBy: { created_at: 'desc' },
      take: limit * 3,
    });
    const fallbackCards = await Promise.all(fallback.map((p) => formatProduct(p, locale)));
    const seen = new Set(cards.map((c) => c.id));
    for (const c of fallbackCards) {
      if (!seen.has(c.id)) {
        cards.push(c);
        seen.add(c.id);
      }
    }
  }

  return cards.slice(0, limit);
}

async function listCategories(locale: 'ru' | 'kg') {
  const prisma = getPrismaClient();
  const categories = await prisma.categories.findMany({
    where: { status: 'active' },
    include: {
      category_translations: { select: { locale: true, name: true } },
      _count: { select: { products: { where: { status: 'active' } } } },
    },
    orderBy: { id: 'asc' },
  });
  return categories.map((c) => ({
    id: c.id,
    name: pickTranslation(c.category_translations as any, locale)?.name || 'Без названия',
    productsCount: c._count.products,
  }));
}

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_products',
      description:
        'Ищет товары в каталоге магазина Nur-Kitep по ключевому слову, категории и/или диапазону цены. Используй для поиска товаров, которые просит пользователь.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Поисковый запрос: название, бренд, артикул или описание' },
          category_id: { type: 'string', description: 'UUID категории (если известен)' },
          min_price: { type: 'number', description: 'Минимальная цена в KGS' },
          max_price: { type: 'number', description: 'Максимальная цена в KGS' },
          in_stock_only: { type: 'boolean', description: 'Если true — возвращать только товары, которые есть в наличии' },
          limit: { type: 'number', description: 'Максимум результатов (1–10), по умолчанию 5' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'find_alternatives',
      description:
        'Возвращает аналоги (похожие товары) для указанного товара. Используй, когда товар не в наличии или пользователь просит варианты замены.',
      parameters: {
        type: 'object',
        properties: {
          product_id: { type: 'string', description: 'UUID товара, к которому нужны аналоги' },
          limit: { type: 'number', description: 'Сколько аналогов вернуть (1–10), по умолчанию 5' },
        },
        required: ['product_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_categories',
      description: 'Возвращает список активных категорий магазина с количеством товаров.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
];

async function executeTool(name: string, args: any, locale: 'ru' | 'kg'): Promise<any> {
  if (name === 'search_products') {
    const products = await searchProducts(
      {
        query: args.query,
        categoryId: args.category_id,
        minPrice: args.min_price,
        maxPrice: args.max_price,
        inStockOnly: args.in_stock_only,
        limit: args.limit,
      },
      locale,
    );
    return {
      count: products.length,
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        brand: p.brand,
        sku: p.sku,
        category: p.categoryName,
        rating: p.averageRating,
        reviews: p.reviewsCount,
        in_stock: p.inStock,
        description: p.description,
      })),
    };
  }
  if (name === 'find_alternatives') {
    const products = await findAlternatives(args.product_id, args.limit || 5, locale);
    return {
      count: products.length,
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        brand: p.brand,
        sku: p.sku,
        category: p.categoryName,
        rating: p.averageRating,
        reviews: p.reviewsCount,
        in_stock: p.inStock,
        description: p.description,
      })),
    };
  }
  if (name === 'list_categories') {
    return { categories: await listCategories(locale) };
  }
  return { error: `Неизвестный инструмент: ${name}` };
}

function systemPrompt(locale: 'ru' | 'kg', userName: string): string {
  return [
    `Ты — AI-помощник магазина канцелярии Nur-Kitep. Имя пользователя: ${userName}.`,
    `Отвечай ${locale === 'kg' ? 'на кыргызском' : 'на русском'} языке, дружелюбно, кратко и по делу.`,
    'Твоя задача — помочь подобрать товары из каталога магазина.',
    'Правила работы:',
    '1. Когда пользователь спрашивает о товаре — обязательно используй инструмент search_products, чтобы найти его в базе.',
    '2. Если найденный товар не в наличии (in_stock=false) — предложи аналоги через find_alternatives с тем же product_id.',
    '3. Если товар не найден в каталоге — честно скажи об этом и предложи похожие категории через list_categories или альтернативный поиск.',
    '4. В ответе пользователю упоминай только реальные товары из результатов инструментов: их название, цену в сомах (KGS), бренд (если есть), наличие.',
    '5. Не выдумывай товары, цены или характеристики. Если данных нет — так и скажи.',
    '6. Отвечай компактно: 2–6 предложений + список найденных товаров. Не перечисляй UUID и SKU без необходимости.',
    '7. Цены указывай в формате "1 200 KGS" или "1 200 сом".',
    '8. Если пользователь общается не о товарах (приветствие, благодарность) — отвечай естественно, без вызова инструментов.',
  ].join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === 'admin') {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const body = await request.json();
    const history: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
    const newMessage: string = body.message;

    if (!newMessage || typeof newMessage !== 'string' || !newMessage.trim()) {
      return NextResponse.json({ error: 'Пустое сообщение' }, { status: 400 });
    }

    const locale = await getLocale();
    const openai = getOpenAI();

    // Готовим сообщения для OpenAI: только последние 12 пользовательских/ассистентских реплик
    const trimmedHistory = history
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content }));

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt(locale, user.fullName) },
      ...trimmedHistory.map((m) => ({ role: m.role, content: m.content }) as OpenAI.Chat.Completions.ChatCompletionMessageParam),
      { role: 'user', content: newMessage.trim() },
    ];

    const productsForUI: ProductCard[] = [];
    const seenProductIds = new Set<string>();

    // Цикл с поддержкой function calling: до 4 итераций
    for (let i = 0; i < 4; i++) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        tools,
        tool_choice: 'auto',
        temperature: 0.4,
      });

      const choice = completion.choices[0];
      const msg = choice.message;

      if (msg.tool_calls && msg.tool_calls.length > 0) {
        // Добавляем сообщение ассистента с tool_calls
        messages.push({
          role: 'assistant',
          content: msg.content || '',
          tool_calls: msg.tool_calls,
        } as any);

        for (const call of msg.tool_calls) {
          const fnCall = call as any;
          const name = fnCall.function?.name;
          let parsedArgs: any = {};
          try {
            parsedArgs = JSON.parse(fnCall.function?.arguments || '{}');
          } catch {
            parsedArgs = {};
          }

          const result = await executeTool(name, parsedArgs, locale);

          // Сохраняем найденные товары для UI
          if ((name === 'search_products' || name === 'find_alternatives') && Array.isArray(result.products)) {
            for (const p of result.products) {
              if (!seenProductIds.has(p.id)) {
                seenProductIds.add(p.id);
              }
            }
          }

          messages.push({
            role: 'tool',
            tool_call_id: call.id,
            content: JSON.stringify(result),
          } as any);
        }
        continue;
      }

      // Финальный ответ
      const replyText = msg.content || '';

      // Соберём карточки товаров для UI: пройдёмся по последним tool-результатам
      // и достанем полные данные товаров (с картинками)
      const productIds = Array.from(seenProductIds);
      if (productIds.length > 0) {
        const prisma = getPrismaClient();
        const fullProducts = await prisma.products.findMany({
          where: { id: { in: productIds }, status: 'active' },
          include: productInclude,
        });
        const cards = await Promise.all(fullProducts.map((p) => formatProduct(p, locale)));
        // Сохраняем порядок, в котором ИИ их получал
        const order = new Map(productIds.map((id, idx) => [id, idx]));
        cards.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
        productsForUI.push(...cards);
      }

      return NextResponse.json({
        reply: replyText,
        products: productsForUI,
      });
    }

    return NextResponse.json({
      reply: 'Не удалось получить ответ. Попробуйте переформулировать вопрос.',
      products: productsForUI,
    });
  } catch (error: any) {
    console.error('[AI-CHAT] Error:', error);
    return NextResponse.json(
      { error: 'Ошибка AI-помощника', details: error?.message },
      { status: 500 },
    );
  }
}
