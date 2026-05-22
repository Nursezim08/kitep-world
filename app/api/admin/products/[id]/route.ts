import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { uploadImageToS3, deleteImageFromS3, isBase64Image, isS3Image } from '@/lib/s3';
import crypto from 'crypto';

const mapProduct = (p: any) => ({
  id: p.id,
  sku: p.sku,
  categoryId: p.category_id,
  brand: p.brand,
  price: p.price,
  status: p.status,
  createdAt: p.created_at,
  updatedAt: p.updated_at,
  translations: (p.product_translations || []).map((t: any) => ({
    id: t.id,
    locale: t.locale,
    name: t.name,
    description: t.description,
  })),
  images: (p.product_images || []).map((img: any) => ({
    id: img.id,
    imageUrl: img.image_url,
    status: img.status,
  })),
  attributes: (p.product_attributes || []).map((a: any) => ({
    id: a.id,
    name: a.name,
    value: a.value,
  })),
  category: p.categories ? {
    id: p.categories.id,
    translations: (p.categories.category_translations || []).map((t: any) => ({
      id: t.id,
      locale: t.locale,
      name: t.name,
    })),
  } : null,
  _count: p._count,
});

// GET /api/admin/products/[id] - Получить товар по ID
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

    const product = await prisma.products.findUnique({
      where: { id, status: { not: 'deleted' } },
      include: {
        product_translations: true,
        product_images: { where: { status: 'active' } },
        categories: {
          include: { category_translations: true },
        },
        product_attributes: true,
        _count: { select: { reviews: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(mapProduct(product));
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
  const prisma = getPrismaClient();
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { sku, categoryId, brand, price, status, translations, existingImageIds, newImages } = body;

    if (!sku || !categoryId || !price) {
      return NextResponse.json({ error: 'SKU, category and price are required' }, { status: 400 });
    }
    if (!translations?.ru?.name || !translations?.kg?.name) {
      return NextResponse.json({ error: 'Product name is required for both languages' }, { status: 400 });
    }

    const existingProduct = await prisma.products.findUnique({
      where: { id },
      include: { product_images: true },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (sku !== existingProduct.sku) {
      const skuExists = await prisma.products.findUnique({ where: { sku } });
      if (skuExists) {
        return NextResponse.json({ error: 'Product with this SKU already exists' }, { status: 400 });
      }
    }

    // Удаляем убранные изображения
    const imagesToDelete = existingProduct.product_images.filter(
      (img) => !(existingImageIds || []).includes(img.id)
    );
    for (const image of imagesToDelete) {
      if (isS3Image(image.image_url)) await deleteImageFromS3(image.image_url);
      await prisma.product_images.update({ where: { id: image.id }, data: { status: 'deleted' } });
    }

    // Загружаем новые изображения
    const uploadedNewImages = await Promise.all(
      (newImages || []).map(async (image: string) =>
        isBase64Image(image) ? await uploadImageToS3(image, 'products') : image
      )
    );

    // Обновляем основные данные
    await prisma.products.update({
      where: { id },
      data: {
        sku,
        category_id: categoryId,
        brand: brand || null,
        price: parseFloat(price),
        status,
        updated_at: new Date(),
      },
    });

    // Обновляем переводы
    await prisma.product_translations.deleteMany({ where: { product_id: id } });
    await prisma.product_translations.createMany({
      data: [
        { id: crypto.randomUUID(), product_id: id, locale: 'ru', name: translations.ru.name, description: translations.ru.description || null },
        { id: crypto.randomUUID(), product_id: id, locale: 'kg', name: translations.kg.name, description: translations.kg.description || null },
      ],
    });

    // Добавляем новые изображения
    if (uploadedNewImages.length > 0) {
      await prisma.product_images.createMany({
        data: uploadedNewImages.map((imageUrl) => ({
          id: crypto.randomUUID(),
          product_id: id,
          image_url: imageUrl,
          status: 'active' as const,
        })),
      });
    }

    const product = await prisma.products.findUnique({
      where: { id },
      include: {
        product_translations: true,
        product_images: { where: { status: 'active' } },
        categories: { include: { category_translations: true } },
        _count: { select: { reviews: true } },
      },
    });

    return NextResponse.json(mapProduct(product));
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id] - Удалить товар (мягкое удаление)
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

    const product = await prisma.products.findUnique({
      where: { id },
      include: { product_images: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    for (const image of product.product_images) {
      if (isS3Image(image.image_url)) await deleteImageFromS3(image.image_url);
    }

    await prisma.products.update({
      where: { id },
      data: { status: 'deleted', updated_at: new Date() },
    });
    await prisma.product_images.updateMany({
      where: { product_id: id },
      data: { status: 'deleted' },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
