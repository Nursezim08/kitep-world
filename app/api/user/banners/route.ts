import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Получаем только активные баннеры
    const banners = await prisma.banner.findMany({
      where: {
        status: 'active',
      },
      orderBy: {
        id: 'asc',
      },
    });

    return NextResponse.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить баннеры' },
      { status: 500 }
    );
  }
}
