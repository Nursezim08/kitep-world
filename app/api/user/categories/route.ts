import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');

    // Получаем только активные корневые категории
    const categories = await prisma.category.findMany({
      where: {
        parentId: null,
        status: 'active',
      },
      include: {
        translations: {
          select: {
            locale: true,
            name: true,
          },
        },
        _count: {
          select: {
            products: {
              where: {
                status: 'active',
              },
            },
          },
        },
      },
      orderBy: {
        products: {
          _count: 'desc', // Сортировка по количеству товаров (популярности)
        },
      },
      take: limit ? parseInt(limit) : undefined, // Ограничение количества
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить категории' },
      { status: 500 }
    );
  }
}
