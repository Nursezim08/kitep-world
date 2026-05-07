import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadImageToS3, deleteImageFromS3, isBase64Image, isS3Image } from '@/lib/s3';

// GET /api/admin/products/[id] - Получить товар по ID
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

    const product = await prisma.product.findUnique({
      where: {
        id,
        status: { not: 'deleted' },
      },
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
        attributes: true,
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/products/[id] - Обновить товар
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
    const { sku, categoryId, brand, price, status, translations, existingImageIds, newImages } = body;

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

    // Проверка существования товара
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Проверка уникальности SKU (если изменился)
    if (sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku },
      });

      if (skuExists) {
        return NextResponse.json(
          { error: 'Product with this SKU already exists' },
          { status: 400 }
        );
      }
    }

    // Обработка изображений
    // 1. Удаляем изображения, которые больше не нужны
    const imagesToDelete = existingProduct.images.filter(
      (img) => !existingImageIds.includes(img.id)
    );

    for (const image of imagesToDelete) {
      // Удаляем из S3
      if (isS3Image(image.imageUrl)) {
        await deleteImageFromS3(image.imageUrl);
      }
      // Помечаем как удаленное в БД
      await prisma.productImage.update({
        where: { id: image.id },
        data: { status: 'deleted' },
      });
    }

    // 2. Загружаем новые изображения в S3
    const uploadedNewImages = await Promise.all(
      (newImages || []).map(async (image: string) => {
        if (isBase64Image(image)) {
          return await uploadImageToS3(image, 'products');
        }
        return image;
      })
    );

    // Обновление товара
    const product = await prisma.product.update({
      where: { id },
      data: {
        sku,
        categoryId,
        brand: brand || null,
        price: parseFloat(price),
        status,
        translations: {
          deleteMany: {},
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
          create: uploadedNewImages.map((imageUrl) => ({
            imageUrl,
            status: 'active',
          })),
        },
      },
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
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id] - Удалить товар (мягкое удаление)
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

    // Проверка существования товара
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Удаляем изображения из S3
    for (const image of product.images) {
      if (isS3Image(image.imageUrl)) {
        await deleteImageFromS3(image.imageUrl);
      }
    }

    // Мягкое удаление товара
    await prisma.product.update({
      where: { id },
      data: {
        status: 'deleted',
        images: {
          updateMany: {
            where: {},
            data: { status: 'deleted' },
          },
        },
      },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
