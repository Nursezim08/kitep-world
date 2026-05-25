import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';

// GET /api/admin/banners/[id] - Получение баннера по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const prisma = getPrismaClient();
    const banner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      return NextResponse.json({ error: 'Баннер не найден' }, { status: 404 });
    }

    return NextResponse.json({ banner });
  } catch (error) {
    console.error('Error fetching banner:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/banners/[id] - Обновление баннера
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, desktopImage, mobileImage, url, status } = body;

    const prisma = getPrismaClient();

    // Проверка существования баннера
    const existingBanner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!existingBanner) {
      return NextResponse.json({ error: 'Баннер не найден' }, { status: 404 });
    }

    // Валидация
    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Название обязательно' }, { status: 400 });
    }

    if (!desktopImage) {
      return NextResponse.json({ error: 'Изображение для десктопа обязательно' }, { status: 400 });
    }

    if (!mobileImage) {
      return NextResponse.json({ error: 'Изображение для мобильных обязательно' }, { status: 400 });
    }

    if (!['active', 'inactive'].includes(status)) {
      return NextResponse.json({ error: 'Неверный статус' }, { status: 400 });
    }

    // Обновление баннера
    const banner = await prisma.banner.update({
      where: { id },
      data: {
        desktopImage,
        mobileImage,
        url: url?.trim() || null,
        status,
        translations: {
          upsert: [
            {
              where: { bannerId_locale: { bannerId: id, locale: 'ru' } },
              create: { locale: 'ru', title: title.trim() },
              update: { title: title.trim() },
            },
          ],
        },
      },
      include: { translations: true },
    });

    return NextResponse.json({ banner });
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/banners/[id] - Удаление баннера
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const prisma = getPrismaClient();

    // Проверка существования баннера
    const existingBanner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!existingBanner) {
      return NextResponse.json({ error: 'Баннер не найден' }, { status: 404 });
    }

    // Удаление баннера
    await prisma.banner.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Баннер успешно удален' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
