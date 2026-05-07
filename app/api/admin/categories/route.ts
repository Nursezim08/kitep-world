import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadImageToS3, isBase64Image } from '@/lib/s3';

// GET /api/admin/categories - Получить все категории
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const parentId = searchParams.get('parentId');
    const level = searchParams.get('level'); // 0 = категории, 1 = подкатегории 1 уровня, и т.д.

    // Если указан level, игнорируем parentId и загружаем все категории с вычислением уровня
    if (level !== null && level !== undefined) {
      const levelNum = parseInt(level);
      
      // Загружаем все категории
      const allCategories = await prisma.category.findMany({
        where: {
          status: { not: 'deleted' },
        },
        include: {
          translations: true,
          _count: {
            select: {
              children: {
                where: { status: { not: 'deleted' } },
              },
              products: true,
            },
          },
        },
      });

      // Функция для вычисления уровня категории
      const getCategoryLevel = (categoryId: string, categories: any[]): number => {
        const category = categories.find(c => c.id === categoryId);
        if (!category || !category.parentId) return 0;
        return 1 + getCategoryLevel(category.parentId, categories);
      };

      // Фильтруем по уровню
      let filteredCategories = allCategories.filter(cat => {
        const catLevel = getCategoryLevel(cat.id, allCategories);
        return catLevel === levelNum;
      });

      // Поиск по названию
      if (search) {
        filteredCategories = filteredCategories.filter(cat => {
          const ruName = cat.translations.find((t: any) => t.locale === 'ru')?.name || '';
          const kgName = cat.translations.find((t: any) => t.locale === 'kg')?.name || '';
          return ruName.toLowerCase().includes(search.toLowerCase()) || 
                 kgName.toLowerCase().includes(search.toLowerCase());
        });
      }

      // Добавляем информацию об уровне к каждой категории
      const categoriesWithLevel = filteredCategories.map(cat => ({
        ...cat,
        level: getCategoryLevel(cat.id, allCategories),
      }));

      return NextResponse.json(categoriesWithLevel);
    }

    // Стандартная логика с parentId
    const whereClause: any = {
      status: { not: 'deleted' },
    };

    if (parentId === 'null' || parentId === null) {
      whereClause.parentId = null;
    } else if (parentId) {
      whereClause.parentId = parentId;
    }

    // Поиск по названию
    if (search) {
      whereClause.translations = {
        some: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      };
    }

    const categories = await prisma.category.findMany({
      where: whereClause,
      include: {
        translations: true,
        children: {
          where: { status: { not: 'deleted' } },
          include: {
            translations: true,
          },
        },
        _count: {
          select: {
            children: {
              where: { status: { not: 'deleted' } },
            },
            products: true,
          },
        },
      },
      orderBy: {
        translations: {
          _count: 'desc',
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories - Создать категорию
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { parentId, image, translations, status } = body;

    // Валидация
    if (!translations || !translations.ru || !translations.kg) {
      return NextResponse.json(
        { error: 'Translations for both ru and kg are required' },
        { status: 400 }
      );
    }

    if (!translations.ru.name || !translations.kg.name) {
      return NextResponse.json(
        { error: 'Category name is required for both languages' },
        { status: 400 }
      );
    }

    // Загружаем изображение в S3, если это base64
    let imageUrl = image;
    if (image && isBase64Image(image)) {
      imageUrl = await uploadImageToS3(image, 'categories');
    }

    // Создание категории с переводами
    const category = await prisma.category.create({
      data: {
        parentId: parentId || null,
        image: imageUrl || null,
        status: status || 'active',
        translations: {
          create: [
            {
              locale: 'ru',
              name: translations.ru.name,
            },
            {
              locale: 'kg',
              name: translations.kg.name,
            },
          ],
        },
      },
      include: {
        translations: true,
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
