import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
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
