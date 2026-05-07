import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadImageToS3, deleteImageFromS3, isBase64Image, isS3Image } from '@/lib/s3';

// GET /api/admin/categories/[id] - Получить категорию по ID
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

    const category = await prisma.category.findUnique({
      where: { id: id },
      include: {
        translations: true,
        parent: {
          include: {
            translations: true,
          },
        },
        children: {
          where: { status: { not: 'deleted' } },
          include: {
            translations: true,
            _count: {
              select: {
                children: true,
                products: true,
              },
            },
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
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
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
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const body = await request.json();
    const { parentId, image, translations, status } = body;

    // Проверка существования категории
    const existingCategory = await prisma.category.findUnique({
      where: { id: id },
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
        const parent = await prisma.category.findUnique({
          where: { id: currentParentId },
          select: { parentId: true },
        });
        currentParentId = parent?.parentId || null;
      }
    }

    // Обновление категории
    const updateData: any = {};
    
    if (parentId !== undefined) {
      updateData.parentId = parentId === 'null' ? null : parentId;
    }
    
    if (image !== undefined) {
      // Если новое изображение - base64, загружаем в S3
      if (isBase64Image(image)) {
        const newImageUrl = await uploadImageToS3(image, 'categories');
        
        // Удаляем старое изображение из S3, если оно там было
        if (existingCategory.image && isS3Image(existingCategory.image)) {
          try {
            await deleteImageFromS3(existingCategory.image);
          } catch (error) {
            console.error('Error deleting old image from S3:', error);
            // Продолжаем выполнение, даже если не удалось удалить старое изображение
          }
        }
        
        updateData.image = newImageUrl;
      } else {
        // Если это уже URL из S3, просто сохраняем его
        updateData.image = image;
      }
    }
    
    if (status !== undefined) {
      updateData.status = status;
    }

    const category = await prisma.category.update({
      where: { id: id },
      data: updateData,
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

    // Обновление переводов
    if (translations) {
      if (translations.ru) {
        await prisma.categoryTranslation.upsert({
          where: {
            categoryId_locale: {
              categoryId: id,
              locale: 'ru',
            },
          },
          update: {
            name: translations.ru.name,
          },
          create: {
            categoryId: id,
            locale: 'ru',
            name: translations.ru.name,
          },
        });
      }

      if (translations.kg) {
        await prisma.categoryTranslation.upsert({
          where: {
            categoryId_locale: {
              categoryId: id,
              locale: 'kg',
            },
          },
          update: {
            name: translations.kg.name,
          },
          create: {
            categoryId: id,
            locale: 'kg',
            name: translations.kg.name,
          },
        });
      }
    }

    // Получаем обновленную категорию с переводами
    const updatedCategory = await prisma.category.findUnique({
      where: { id: id },
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

    return NextResponse.json(updatedCategory);
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
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Проверка наличия подкатегорий
    const childrenCount = await prisma.category.count({
      where: {
        parentId: id,
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
    const productsCount = await prisma.product.count({
      where: {
        categoryId: id,
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
    const category = await prisma.category.findUnique({
      where: { id: id },
      select: { image: true },
    });

    // Мягкое удаление
    await prisma.category.update({
      where: { id: id },
      data: { status: 'deleted' },
    });

    // Удаляем изображение из S3, если оно там было
    if (category?.image && isS3Image(category.image)) {
      try {
        await deleteImageFromS3(category.image);
      } catch (error) {
        console.error('Error deleting image from S3:', error);
        // Продолжаем выполнение, категория уже помечена как удалённая
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
