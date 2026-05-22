import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[Manager Product Detail] Starting request');
    
    // Проверка авторизации
    const payload = await verifyAuth(request);
    console.log('[Manager Product Detail] User:', payload?.userId, payload?.role);

    if (!payload || payload.role !== 'manager') {
      console.log('[Manager Product Detail] Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем ID товара
    const { id } = await params;
    console.log('[Manager Product Detail] Product ID:', id);

    const prisma = getPrismaClient();

    // Получаем филиал менеджера
    const branchUser = await prisma.branch_users.findFirst({
      where: { user_id: payload.userId },
      select: { branch_id: true },
    });
    console.log('[Manager Product Detail] Branch:', branchUser?.branch_id);

    if (!branchUser) {
      console.log('[Manager Product Detail] Branch not found');
      return NextResponse.json({ error: 'Филиал не найден' }, { status: 404 });
    }

    // Получаем товар
    console.log('[Manager Product Detail] Fetching product...');
    const product = await prisma.products.findUnique({
      where: { id },
      include: {
        product_translations: true,
        product_images: true,
        categories: {
          include: { category_translations: true },
        },
      },
    });

    console.log('[Manager Product Detail] Product found:', !!product);

    if (!product) {
      console.log('[Manager Product Detail] Product not found');
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }

    if (product.status === 'deleted') {
      console.log('[Manager Product Detail] Product is deleted');
      return NextResponse.json({ error: 'Товар удалён' }, { status: 404 });
    }

    // Получаем остаток товара для филиала менеджера
    console.log('[Manager Product Detail] Fetching inventory...');
    const inventory = await prisma.branch_inventory.findFirst({
      where: { branch_id: branchUser.branch_id, product_id: product.id },
      select: { quantity: true },
    });
    console.log('[Manager Product Detail] Inventory:', inventory?.quantity || 0);

    // Формируем ответ с camelCase полями
    const productWithInventory = {
      id: product.id,
      sku: product.sku,
      categoryId: product.category_id,
      brand: product.brand,
      price: Number(product.price),
      status: product.status,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
      translations: product.product_translations.map((t) => ({
        id: t.id,
        locale: t.locale,
        name: t.name,
        description: t.description,
      })),
      images: product.product_images.map((img) => ({
        id: img.id,
        imageUrl: img.image_url,
        status: img.status,
      })),
      category: product.categories ? {
        id: product.categories.id,
        translations: product.categories.category_translations.map((t) => ({
          id: t.id,
          locale: t.locale,
          name: t.name,
        })),
      } : null,
      inventory: { quantity: inventory?.quantity || 0 },
      _count: { reviews: 0 },
    };

    console.log('[Manager Product Detail] Success, returning data');
    return NextResponse.json(productWithInventory);
  } catch (error) {
    console.error('[Manager Product Detail] Error:', error);
    console.error('[Manager Product Detail] Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('[Manager Product Detail] Error message:', error instanceof Error ? error.message : String(error));
    
    return NextResponse.json(
      { 
        error: 'Не удалось загрузить товар',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
