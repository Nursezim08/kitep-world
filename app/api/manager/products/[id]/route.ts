import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[Manager Product Detail] Starting request');
    
    // Проверка авторизации
    const user = await verifyAuth(request);
    console.log('[Manager Product Detail] User:', user?.id, user?.role);

    if (!user || user.role !== 'manager') {
      console.log('[Manager Product Detail] Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем ID товара
    const { id } = await params;
    console.log('[Manager Product Detail] Product ID:', id);

    // Получаем филиал менеджера
    const branchUser = await prisma.branchUser.findFirst({
      where: { userId: user.id as string },
      select: { branchId: true },
    });
    console.log('[Manager Product Detail] Branch:', branchUser?.branchId);

    if (!branchUser) {
      console.log('[Manager Product Detail] Branch not found');
      return NextResponse.json({ error: 'Филиал не найден' }, { status: 404 });
    }

    // Получаем товар (упрощённый запрос)
    console.log('[Manager Product Detail] Fetching product...');
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        translations: true,
        images: true,
        category: {
          include: {
            translations: true,
          },
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
    const inventory = await prisma.branchInventory.findUnique({
      where: {
        branchId_productId: {
          branchId: branchUser.branchId,
          productId: product.id,
        },
      },
      select: { quantity: true },
    });
    console.log('[Manager Product Detail] Inventory:', inventory?.quantity || 0);

    // Формируем ответ
    const productWithInventory = {
      ...product,
      inventory: {
        quantity: inventory?.quantity || 0,
      },
      _count: {
        reviews: 0, // Временно захардкодим
      },
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
