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
        reviews: {
          select: {
            rating: true,
          },
        },
        orderItems: {
          select: {
            quantity: true,
          },
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

    // Рассчитываем средний рейтинг и количество проданных для каждого товара
    const productsWithRating = products.map((product) => {
      const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = product.reviews.length > 0 
        ? Number((totalRating / product.reviews.length).toFixed(1))
        : 0;

      // Подсчитываем общее количество проданных товаров
      const totalSold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0);

      // Убираем reviews и orderItems из ответа
      const { reviews, orderItems, ...productWithoutReviews } = product;

      return {
        ...productWithoutReviews,
        averageRating,
        totalSold,
      };
    });

    return NextResponse.json(productsWithRating);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить товары' },
      { status: 500 }
    );
  }
}
