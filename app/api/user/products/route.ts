import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const popular = searchParams.get('popular') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const categoryId = searchParams.get('categoryId');

    const where: any = {
      status: 'active',
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Получаем товары
    const products = await prisma.product.findMany({
      where,
      include: {
        translations: {
          select: {
            locale: true,
            name: true,
            description: true,
          },
        },
        images: {
          where: {
            status: 'active',
          },
          select: {
            imageUrl: true,
          },
          take: 1,
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: popular
        ? {
            reviews: {
              _count: 'desc',
            },
          }
        : {
            createdAt: 'desc',
          },
      take: limit,
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить товары' },
      { status: 500 }
    );
  }
}
