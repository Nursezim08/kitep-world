import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/reports - Получение данных для отчетов
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request, ['admin']);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const branchId = searchParams.get('branchId');

    // Построение фильтра по датам
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    const where: any = {};
    if (Object.keys(dateFilter).length > 0) {
      where.createdAt = dateFilter;
    }
    if (branchId && branchId !== 'all') {
      where.branchId = branchId;
    }

    switch (type) {
      case 'overview': {
        // Общая статистика
        const [
          totalOrders,
          totalRevenue,
          totalUsers,
          totalProducts,
          ordersByStatus,
          revenueByBranch,
        ] = await Promise.all([
          prisma.order.count({ where }),
          prisma.order.aggregate({
            where: { ...where, orderStatus: { not: 'cancelled' } },
            _sum: { total: true },
          }),
          prisma.user.count({ where: { role: 'user', status: 'active' } }),
          prisma.product.count({ where: { status: 'active' } }),
          prisma.order.groupBy({
            by: ['orderStatus'],
            where,
            _count: true,
          }),
          prisma.order.groupBy({
            by: ['branchId'],
            where: { ...where, orderStatus: { not: 'cancelled' } },
            _sum: { total: true },
            _count: true,
          }),
        ]);

        // Получение названий филиалов
        const branchIds = revenueByBranch.map((b) => b.branchId);
        const branches = await prisma.branch.findMany({
          where: { id: { in: branchIds } },
          select: { id: true, name: true, city: true },
        });

        const revenueByBranchWithNames = revenueByBranch.map((item) => {
          const branch = branches.find((b) => b.id === item.branchId);
          return {
            branchId: item.branchId,
            branchName: branch?.name || 'Неизвестно',
            city: branch?.city || '',
            revenue: item._sum.total || 0,
            orders: item._count,
          };
        });

        return NextResponse.json({
          totalOrders,
          totalRevenue: totalRevenue._sum.total || 0,
          totalUsers,
          totalProducts,
          ordersByStatus,
          revenueByBranch: revenueByBranchWithNames,
        });
      }

      case 'sales': {
        // Отчет по продажам
        const salesData = await prisma.orderItem.groupBy({
          by: ['productId'],
          where: {
            order: where,
          },
          _sum: {
            quantity: true,
            total: true,
          },
          _count: true,
          orderBy: {
            _sum: {
              total: 'desc',
            },
          },
          take: 20,
        });

        // Получение информации о товарах
        const productIds = salesData.map((item) => item.productId);
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          include: {
            translations: {
              where: { locale: 'ru' },
            },
            images: {
              where: { status: 'active' },
              take: 1,
            },
          },
        });

        const salesWithProducts = salesData.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          return {
            productId: item.productId,
            productName: product?.translations[0]?.name || 'Неизвестно',
            sku: product?.sku || '',
            image: product?.images[0]?.imageUrl || null,
            quantity: item._sum.quantity || 0,
            revenue: item._sum.total || 0,
            orders: item._count,
          };
        });

        return NextResponse.json({ sales: salesWithProducts });
      }

      case 'customers': {
        // Отчет по клиентам
        const topCustomers = await prisma.order.groupBy({
          by: ['userId'],
          where: { ...where, orderStatus: { not: 'cancelled' } },
          _sum: {
            total: true,
          },
          _count: true,
          orderBy: {
            _sum: {
              total: 'desc',
            },
          },
          take: 20,
        });

        // Получение информации о пользователях
        const userIds = topCustomers.map((item) => item.userId);
        const users = await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatar: true,
          },
        });

        const customersWithInfo = topCustomers.map((item) => {
          const user = users.find((u) => u.id === item.userId);
          return {
            userId: item.userId,
            fullName: user?.fullName || 'Неизвестно',
            email: user?.email || '',
            phone: user?.phone || '',
            avatar: user?.avatar || null,
            totalSpent: item._sum.total || 0,
            orders: item._count,
          };
        });

        return NextResponse.json({ customers: customersWithInfo });
      }

      case 'inventory': {
        // Отчет по остаткам
        const inventory = await prisma.branchInventory.findMany({
          where: branchId && branchId !== 'all' ? { branchId } : {},
          include: {
            product: {
              include: {
                translations: {
                  where: { locale: 'ru' },
                },
                images: {
                  where: { status: 'active' },
                  take: 1,
                },
              },
            },
            branch: {
              select: {
                id: true,
                name: true,
                city: true,
              },
            },
          },
          orderBy: {
            quantity: 'asc',
          },
        });

        const inventoryData = inventory.map((item) => ({
          branchId: item.branchId,
          branchName: item.branch.name,
          city: item.branch.city,
          productId: item.productId,
          productName: item.product.translations[0]?.name || 'Неизвестно',
          sku: item.product.sku,
          image: item.product.images[0]?.imageUrl || null,
          quantity: item.quantity,
          price: item.product.price,
          totalValue: Number(item.product.price) * item.quantity,
        }));

        return NextResponse.json({ inventory: inventoryData });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
