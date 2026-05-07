import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Получить филиал по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const branch = await prisma.branch.findUnique({
      where: { id },
      include: {
        branchUsers: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
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
            orderNumber: true,
            total: true,
            orderStatus: true,
            paymentStatus: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            branchUsers: true,
            orders: true,
            inventory: true,
          },
        },
      },
    });

    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ branch });
  } catch (error) {
    console.error('Error fetching branch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    
    // Логирование для отладки
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
    } = body;

    // Проверка существования филиала
    const existingBranch = await prisma.branch.findUnique({
      where: { id },
    });

    if (!existingBranch) {
      return NextResponse.json(
        { error: 'Branch not found' },
        { status: 404 }
      );
    }

    // Проверка уникальности кода (если код изменился)
    if (code && code !== existingBranch.code) {
      const branchWithCode = await prisma.branch.findUnique({
        where: { code },
      });

      if (branchWithCode) {
        return NextResponse.json(
          { error: 'Филиал с таким кодом уже существует' },
          { status: 400 }
        );
      }
    }

    // Если указаны менеджеры, проверяем что они существуют и являются менеджерами
    if (managerIds && Array.isArray(managerIds) && managerIds.length > 0) {
      const managers = await prisma.user.findMany({
        where: {
          id: { in: managerIds },
          role: 'manager',
        },
        include: {
          branchUsers: {
            select: {
              branchId: true,
            },
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
        const otherBranches = manager.branchUsers.filter(bu => bu.branchId !== id);
        if (otherBranches.length > 0) {
          return NextResponse.json(
            { error: `Менеджер ${manager.fullName} уже назначен в другой филиал` },
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
        .filter(([_, dayData]: [string, any]) => dayData.isWorking)
        .map(([day, _]) => day);

      // Берем время работы из первого рабочего дня (для совместимости со старой схемой)
      const firstWorkingDay = Object.values(schedule).find((dayData: any) => dayData.isWorking);
      if (firstWorkingDay && typeof firstWorkingDay === 'object') {
        const openTimeStr = (firstWorkingDay as any).openTime;
        const closeTimeStr = (firstWorkingDay as any).closeTime;
        openTime = openTimeStr ? new Date(`1970-01-01T${openTimeStr}:00`) : null;
        closeTime = closeTimeStr ? new Date(`1970-01-01T${closeTimeStr}:00`) : null;
      } else {
        openTime = null;
        closeTime = null;
      }
    }

    // Обновление филиала
    const updatedBranch = await prisma.branch.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(city && { city }),
        ...(district && { district }),
        ...(address && { address }),
        ...(phone && { phone }),
        ...(email && { email }),
        ...(latitude !== undefined && { latitude: latitude !== null ? latitude : null }),
        ...(longitude !== undefined && { longitude: longitude !== null ? longitude : null }),
        ...(openTime !== undefined && { openTime }),
        ...(closeTime !== undefined && { closeTime }),
        ...(workDays !== undefined && { workDays }),
        ...(status && { status }),
      },
    });

    // Обновляем менеджеров если указаны
    if (managerIds !== undefined) {
      console.log('Updating managers for branch:', id, 'managerIds:', managerIds);
      
      // Удаляем старые связи
      const deletedRelations = await prisma.branchUser.deleteMany({
        where: { branchId: id },
      });
      
      console.log('Deleted old branch-user relations:', deletedRelations.count);

      // Создаем новые связи
      if (Array.isArray(managerIds) && managerIds.length > 0) {
        const newRelations = await prisma.branchUser.createMany({
          data: managerIds.map((managerId) => ({
            branchId: id,
            userId: managerId,
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
    const branchWithManagers = await prisma.branch.findUnique({
      where: { id },
      include: {
        branchUsers: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ branch: branchWithManagers });
  } catch (error) {
    console.error('Error updating branch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Проверка существования филиала
    const branch = await prisma.branch.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            branchUsers: true,
            orders: true,
          },
        },
      },
    });

    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found' },
        { status: 404 }
      );
    }

    // Проверка на наличие связанных данных
    if (branch._count.branchUsers > 0) {
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
    await prisma.branch.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('Error deleting branch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
