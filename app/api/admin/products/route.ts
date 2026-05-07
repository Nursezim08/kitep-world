import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadImageToS3, isBase64Image } from '@/lib/s3';

// GET /api/admin/products - Получить все товары
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId');

    const whereClause: any = {
      status: { not: 'deleted' },
    };

    // Фильтр по категории
    if (categoryId && categoryId !== 'all') {
      whereClause.categoryId = categoryId;
    }

    // Поиск по названию, SKU, бренду
    if (search) {
      whereClause.OR = [
        {
          translations: {
            some: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          sku: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          brand: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        translations: true,
        images: {
          where: { status: 'active' },
        },
        category: {
          include: {
            translations: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Создать товар
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sku, categoryId, brand, price, status, translations, images } = body;

    // Валидация
    if (!sku || !categoryId || !price) {
      return NextResponse.json(
        { error: 'SKU, category and price are required' },
        { status: 400 }
      );
    }

    if (!translations || !translations.ru || !translations.kg) {
      return NextResponse.json(
        { error: 'Translations for both ru and kg are required' },
        { status: 400 }
      );
    }

    if (!translations.ru.name || !translations.kg.name) {
      return NextResponse.json(
        { error: 'Product name is required for both languages' },
        { status: 400 }
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'At least one image is required' },
        { status: 400 }
      );
    }

    // Проверка уникальности SKU
    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this SKU already exists' },
        { status: 400 }
      );
    }

    // Загружаем изображения в S3
    const uploadedImages = await Promise.all(
      images.map(async (image: string) => {
        if (isBase64Image(image)) {
          return await uploadImageToS3(image, 'products');
        }
        return image;
      })
    );

    // Создание товара с переводами и изображениями
    const product = await prisma.product.create({
      data: {
        sku,
        categoryId,
        brand: brand || null,
        price: parseFloat(price),
        status: status || 'active',
        translations: {
          create: [
            {
              locale: 'ru',
              name: translations.ru.name,
              description: translations.ru.description || null,
            },
            {
              locale: 'kg',
              name: translations.kg.name,
              description: translations.kg.description || null,
            },
          ],
        },
        images: {
          create: uploadedImages.map((imageUrl) => ({
            imageUrl,
            status: 'active',
          })),
        },
      },
      include: {
        translations: true,
        images: true,
        category: {
          include: {
            translations: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
