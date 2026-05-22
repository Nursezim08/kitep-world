import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { uploadImageToS3, deleteImageFromS3, isBase64Image, isS3Image } from '@/lib/s3';
import crypto from 'crypto';

const mapCategory = (cat: any): any => ({
  id: cat.id,
  parentId: cat.parent_id,
  image: cat.image,
  status: cat.status,
  createdAt: cat.created_at ?? '',
  updatedAt: cat.updated_at ?? '',
  translations: (cat.category_translations || []).map((t: any) => ({
    id: t.id,
    locale: t.locale,
    name: t.name,
  })),
  children: (cat.other_categories || []).map((child: any) => mapCategory(child)),
  _count: {
    children: cat._count?.other_categories ?? 0,
    products: cat._count?.products ?? 0,
  },
});

// GET /api/admin/categories/[id] - Получить категорию по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = getPrismaClient();
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const category = await prisma.categories.findUnique({
      where: { id },
      include: {
        category_translations: true,
        categories: {
          include: {
            category_translations: true,
          },
        },
        other_categories: {
          where: { status: { not: 'deleted' } },
          include: {
            category_translations: true,
            _count: {
              select: {
                other_categories: true,
                products: true,
              },
            },
          },
        },
        _count: {
          select: {
            other_categories: {
              where: { status: { not: 'deleted' } },
            },
            products: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(mapCategory(category));
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/categories/[id] - Обновить категорию
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = getPrismaClient();
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const body = await request.json();
    const { parentId, image, translations, status } = body;

    // Проверка существования категории
    const existingCategory = await prisma.categories.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Проверка на циклическую зависимость
    if (parentId && parentId !== 'null') {
      let currentParentId = parentId;
      while (currentParentId) {
        if (currentParentId === id) {
          return NextResponse.json(
            { error: 'Cannot set category as its own parent' },
            { status: 400 }
          );
        }
        const parent = await prisma.categories.findUnique({
          where: { id: currentParentId },
          select: { parent_id: true },
        });
        currentParentId = parent?.parent_id || null;
      }
    }

    // Обновление категории
    const updateData: any = {};
    
    if (parentId !== undefined) {
      updateData.parent_id = parentId === 'null' ? null : parentId;
    }
    
    if (image !== undefined) {
      if (isBase64Image(image)) {
        const newImageUrl = await uploadImageToS3(image, 'categories');
        if (existingCategory.image && isS3Image(existingCategory.image)) {
          try {
            await deleteImageFromS3(existingCategory.image);
          } catch (error) {
            console.error('Error deleting old image from S3:', error);
          }
        }
        updateData.image = newImageUrl;
      } else {
        updateData.image = image;
      }
    }
    
    if (status !== undefined) {
      updateData.status = status;
    }

    await prisma.categories.update({
      where: { id },
      data: updateData,
    });

    // Обновление переводов
    if (translations) {
      if (translations.ru) {
        const existingRu = await prisma.category_translations.findFirst({
          where: { category_id: id, locale: 'ru' },
        });
        if (existingRu) {
          await prisma.category_translations.update({
            where: { id: existingRu.id },
            data: { name: translations.ru.name },
          });
        } else {
          await prisma.category_translations.create({
            data: { id: crypto.randomUUID(), category_id: id, locale: 'ru', name: translations.ru.name },
          });
        }
      }
      if (translations.kg) {
        const existingKg = await prisma.category_translations.findFirst({
          where: { category_id: id, locale: 'kg' },
        });
        if (existingKg) {
          await prisma.category_translations.update({
            where: { id: existingKg.id },
            data: { name: translations.kg.name },
          });
        } else {
          await prisma.category_translations.create({
            data: { id: crypto.randomUUID(), category_id: id, locale: 'kg', name: translations.kg.name },
          });
        }
      }
    }

    // Получаем обновленную категорию с переводами
    const updatedCategory = await prisma.categories.findUnique({
      where: { id },
      include: {
        category_translations: true,
        _count: {
          select: {
            other_categories: true,
            products: true,
          },
        },
      },
    });

    return NextResponse.json(mapCategory(updatedCategory));
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories/[id] - Удалить категорию (мягкое удаление)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = getPrismaClient();
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Проверка наличия подкатегорий
    const childrenCount = await prisma.categories.count({
      where: {
        parent_id: id,
        status: { not: 'deleted' },
      },
    });

    if (childrenCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with subcategories' },
        { status: 400 }
      );
    }

    // Проверка наличия товаров
    const productsCount = await prisma.products.count({
      where: {
        category_id: id,
        status: { not: 'deleted' },
      },
    });

    if (productsCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with products' },
        { status: 400 }
      );
    }

    // Получаем категорию для удаления изображения
    const category = await prisma.categories.findUnique({
      where: { id },
      select: { image: true },
    });

    // Мягкое удаление
    await prisma.categories.update({
      where: { id },
      data: { status: 'deleted' },
    });

    // Удаляем изображение из S3, если оно там было
    if (category?.image && isS3Image(category.image)) {
      try {
        await deleteImageFromS3(category.image);
      } catch (error) {
        console.error('Error deleting image from S3:', error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
