import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Получить все филиалы
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const branches = await prisma.branch.findMany({
      orderBy: {
        createdAt: 'desc',
      },
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
        _count: {
          select: {
            branchUsers: true,
            orders: true,
          },
        },
      },
    });

    return NextResponse.json({ branches });
  } catch (error) {
    console.error('Error fetching branches:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Создать новый филиал
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
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
      status = 'active',
    } = body;

    // Валидация обязательных полей
    if (!name || !code || !city || !district || !address || !phone || !email) {
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      );
    }

    // Проверка уникальности кода
    const existingBranch = await prisma.branch.findUnique({
      where: { code },
    });

    if (existingBranch) {
      return NextResponse.json(
        { error: 'Филиал с таким кодом уже существует' },
        { status: 400 }
      );
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
        if (manager.branchUsers.length > 0) {
          return NextResponse.json(
            { error: `Менеджер ${manager.fullName} уже назначен в другой филиал` },
            { status: 400 }
          );
        }
      }
    }

    // Обработка расписания: извлекаем рабочие дни и общее время работы
    let workDays: string[] = [];
    let openTime: string | null = null;
    let closeTime: string | null = null;

    if (schedule && typeof schedule === 'object') {
      // Собираем рабочие дни
      workDays = Object.entries(schedule)
        .filter(([_, dayData]: [string, any]) => dayData.isWorking)
        .map(([day, _]) => day);

      // Берем время работы из первого рабочего дня (для совместимости со старой схемой)
      const firstWorkingDay = Object.values(schedule).find((dayData: any) => dayData.isWorking);
      if (firstWorkingDay && typeof firstWorkingDay === 'object') {
        openTime = (firstWorkingDay as any).openTime || null;
        closeTime = (firstWorkingDay as any).closeTime || null;
      }
    }

    // Создание филиала
    const branch = await prisma.branch.create({
      data: {
        name,
        code,
        city,
        district,
        address,
        phone,
        email,
        latitude: latitude !== null ? latitude : null,
        longitude: longitude !== null ? longitude : null,
        openTime: openTime ? new Date(`1970-01-01T${openTime}:00`) : null,
        closeTime: closeTime ? new Date(`1970-01-01T${closeTime}:00`) : null,
        workDays: workDays,
        status,
      },
    });

    // Привязываем менеджеров к филиалу
    if (managerIds && Array.isArray(managerIds) && managerIds.length > 0) {
      await prisma.branchUser.createMany({
        data: managerIds.map((managerId) => ({
          branchId: branch.id,
          userId: managerId,
        })),
      });
    }

    // Получаем созданный филиал с менеджерами
    const createdBranch = await prisma.branch.findUnique({
      where: { id: branch.id },
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

    return NextResponse.json({ branch: createdBranch }, { status: 201 });
  } catch (error) {
    console.error('Error creating branch:', error);
    
    // Детальное логирование ошибки
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
