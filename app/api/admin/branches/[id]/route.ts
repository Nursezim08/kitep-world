import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const BRANCH_DETAIL_INCLUDE = Prisma.validator<Prisma.branchesInclude>()({
  branch_users: {
    include: {
      users: {
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          status: true,
        },
      },
    },
  },
  orders: {
    select: {
      id: true,
      order_number: true,
      total: true,
      order_status: true,
      payment_status: true,
      created_at: true,
    },
    orderBy: {
      created_at: 'desc',
    },
    take: 10,
  },
  _count: {
    select: {
      branch_users: true,
      orders: true,
      branch_inventory: true,
    },
  },
});

const BRANCH_WITH_MANAGERS_INCLUDE = Prisma.validator<Prisma.branchesInclude>()({
  branch_users: {
    include: {
      users: {
        select: {
          id: true,
          full_name: true,
          email: true,
        },
      },
    },
  },
});

type BranchDetail = Prisma.branchesGetPayload<{ include: typeof BRANCH_DETAIL_INCLUDE }>;
type BranchWithManagers = Prisma.branchesGetPayload<{ include: typeof BRANCH_WITH_MANAGERS_INCLUDE }>;

function serializeBranchDetail(branch: BranchDetail) {
  return {
    id: branch.id,
    name: branch.name,
    code: branch.code,
    city: branch.city,
    district: branch.district,
    address: branch.address,
    phone: branch.phone,
    email: branch.email,
    latitude: branch.latitude !== null ? branch.latitude.toString() : null,
    longitude: branch.longitude !== null ? branch.longitude.toString() : null,
    openTime: branch.open_time ? branch.open_time.toISOString() : null,
    closeTime: branch.close_time ? branch.close_time.toISOString() : null,
    workDays: branch.work_days,
    status: branch.status,
    createdAt: branch.created_at.toISOString(),
    updatedAt: branch.updated_at.toISOString(),
    branchUsers: branch.branch_users.map((bu) => ({
      user: {
        id: bu.users.id,
        fullName: bu.users.full_name,
        email: bu.users.email,
        phone: bu.users.phone,
        status: bu.users.status,
      },
    })),
    orders: branch.orders.map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      total: order.total.toString(),
      orderStatus: order.order_status,
      paymentStatus: order.payment_status,
      createdAt: order.created_at.toISOString(),
    })),
    _count: {
      branchUsers: branch._count.branch_users,
      orders: branch._count.orders,
      inventory: branch._count.branch_inventory,
    },
  };
}

function serializeBranchWithManagers(branch: BranchWithManagers) {
  return {
    id: branch.id,
    name: branch.name,
    code: branch.code,
    city: branch.city,
    district: branch.district,
    address: branch.address,
    phone: branch.phone,
    email: branch.email,
    latitude: branch.latitude !== null ? branch.latitude.toString() : null,
    longitude: branch.longitude !== null ? branch.longitude.toString() : null,
    openTime: branch.open_time ? branch.open_time.toISOString() : null,
    closeTime: branch.close_time ? branch.close_time.toISOString() : null,
    workDays: branch.work_days,
    status: branch.status,
    branchUsers: branch.branch_users.map((bu) => ({
      user: {
        id: bu.users.id,
        fullName: bu.users.full_name,
        email: bu.users.email,
      },
    })),
  };
}

// GET - Получить филиал по ID
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

    const branch = await prisma.branches.findUnique({
      where: { id },
      include: BRANCH_DETAIL_INCLUDE,
    });

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    return NextResponse.json({ branch: serializeBranchDetail(branch) });
  } catch (error) {
    console.error('Error fetching branch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Обновить филиал
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

    console.log('PATCH /api/admin/branches/[id] - Received data:', {
      id,
      managerIds: body.managerIds,
      bodyKeys: Object.keys(body),
    });

    const {
      name,
      code,
      city,
      district,
      address,
      phone,
      email,
      managerIds, // Массив ID менеджеров
      latitude,
      longitude,
      schedule, // Новый формат расписания по дням
      status,
    } = body as {
      name?: string;
      code?: string;
      city?: string;
      district?: string;
      address?: string;
      phone?: string;
      email?: string;
      managerIds?: string[];
      latitude?: number | string | null;
      longitude?: number | string | null;
      schedule?: Record<string, { isWorking: boolean; openTime?: string; closeTime?: string }>;
      status?: 'active' | 'inactive' | 'deleted';
    };

    // Проверка существования филиала
    const existingBranch = await prisma.branches.findUnique({ where: { id } });

    if (!existingBranch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    // Проверка уникальности кода (если код изменился)
    if (code && code !== existingBranch.code) {
      const branchWithCode = await prisma.branches.findUnique({ where: { code } });

      if (branchWithCode) {
        return NextResponse.json(
          { error: 'Филиал с таким кодом уже существует' },
          { status: 400 }
        );
      }
    }

    // Если указаны менеджеры, проверяем что они существуют и являются менеджерами
    if (managerIds && Array.isArray(managerIds) && managerIds.length > 0) {
      const managers = await prisma.users.findMany({
        where: {
          id: { in: managerIds },
          role: 'manager',
        },
        include: {
          branch_users: {
            select: { branch_id: true },
          },
        },
      });

      if (managers.length !== managerIds.length) {
        return NextResponse.json(
          { error: 'Один или несколько указанных менеджеров не найдены' },
          { status: 400 }
        );
      }

      // Проверяем, что менеджеры не назначены в другие филиалы
      for (const manager of managers) {
        // Менеджер может быть назначен только в текущий редактируемый филиал или не назначен вообще
        const otherBranches = manager.branch_users.filter((bu) => bu.branch_id !== id);
        if (otherBranches.length > 0) {
          return NextResponse.json(
            { error: `Менеджер ${manager.full_name} уже назначен в другой филиал` },
            { status: 400 }
          );
        }
      }
    }

    // Обработка расписания: извлекаем рабочие дни и общее время работы
    let workDays: string[] | undefined;
    let openTime: Date | null | undefined;
    let closeTime: Date | null | undefined;

    if (schedule && typeof schedule === 'object') {
      // Собираем рабочие дни
      workDays = Object.entries(schedule)
        .filter(([, dayData]) => dayData?.isWorking)
        .map(([day]) => day);

      // Берем время работы из первого рабочего дня (для совместимости со старой схемой)
      const firstWorkingDay = Object.values(schedule).find((dayData) => dayData?.isWorking);
      if (firstWorkingDay && typeof firstWorkingDay === 'object') {
        const openTimeStr = firstWorkingDay.openTime;
        const closeTimeStr = firstWorkingDay.closeTime;
        openTime = openTimeStr ? new Date(`1970-01-01T${openTimeStr}:00`) : null;
        closeTime = closeTimeStr ? new Date(`1970-01-01T${closeTimeStr}:00`) : null;
      } else {
        openTime = null;
        closeTime = null;
      }
    }

    // Обновление филиала
    const updateData: Prisma.branchesUpdateInput = {
      updated_at: new Date(),
    };
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (city !== undefined) updateData.city = city;
    if (district !== undefined) updateData.district = district;
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (latitude !== undefined) {
      updateData.latitude =
        latitude === null || latitude === ''
          ? null
          : typeof latitude === 'string'
          ? Number(latitude)
          : latitude;
    }
    if (longitude !== undefined) {
      updateData.longitude =
        longitude === null || longitude === ''
          ? null
          : typeof longitude === 'string'
          ? Number(longitude)
          : longitude;
    }
    if (openTime !== undefined) updateData.open_time = openTime;
    if (closeTime !== undefined) updateData.close_time = closeTime;
    if (workDays !== undefined) updateData.work_days = workDays;
    if (status !== undefined) updateData.status = status;

    await prisma.branches.update({
      where: { id },
      data: updateData,
    });

    // Обновляем менеджеров если указаны
    if (managerIds !== undefined) {
      console.log('Updating managers for branch:', id, 'managerIds:', managerIds);

      // Удаляем старые связи
      const deletedRelations = await prisma.branch_users.deleteMany({
        where: { branch_id: id },
      });

      console.log('Deleted old branch-user relations:', deletedRelations.count);

      // Создаем новые связи
      if (Array.isArray(managerIds) && managerIds.length > 0) {
        const newRelations = await prisma.branch_users.createMany({
          data: managerIds.map((managerId) => ({
            id: crypto.randomUUID(),
            branch_id: id,
            user_id: managerId,
          })),
        });
        console.log('Created new branch-user relations:', newRelations.count);
      } else {
        console.log('No managers to add (empty array or not an array)');
      }
    } else {
      console.log('managerIds is undefined, skipping manager update');
    }

    // Получаем обновленный филиал с менеджерами
    const branchWithManagers = await prisma.branches.findUnique({
      where: { id },
      include: BRANCH_WITH_MANAGERS_INCLUDE,
    });

    if (!branchWithManagers) {
      return NextResponse.json({ error: 'Branch not found after update' }, { status: 404 });
    }

    return NextResponse.json({ branch: serializeBranchWithManagers(branchWithManagers) });
  } catch (error) {
    console.error('Error updating branch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Удалить филиал
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

    // Проверка существования филиала
    const branch = await prisma.branches.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            branch_users: true,
            orders: true,
          },
        },
      },
    });

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    // Проверка на наличие связанных данных
    if (branch._count.branch_users > 0) {
      return NextResponse.json(
        { error: 'Невозможно удалить филиал с назначенными менеджерами' },
        { status: 400 }
      );
    }

    if (branch._count.orders > 0) {
      return NextResponse.json(
        { error: 'Невозможно удалить филиал с существующими заказами' },
        { status: 400 }
      );
    }

    // Удаление филиала
    await prisma.branches.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('Error deleting branch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
