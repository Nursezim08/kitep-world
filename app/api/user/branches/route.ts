import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Проверка авторизации
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Проверка роли
    if (authResult.user.role !== 'user') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Получаем все активные филиалы из таблицы branches
    const branchesRaw = await prisma.branch.findMany({
      where: {
        status: 'active',
      },
      orderBy: {
        code: 'asc',
      },
    });

    // Форматируем данные для клиента
    const branches = branchesRaw.map((branch) => ({
      id: branch.id,
      code: branch.code,
      city: branch.city,
      district: branch.district,
      address: branch.address,
      phone: branch.phone,
      email: branch.email,
      workDays: branch.workDays,
      // Форматируем время в строку HH:MM
      openTime: branch.openTime
        ? new Date(branch.openTime).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '09:00',
      closeTime: branch.closeTime
        ? new Date(branch.closeTime).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '18:00',
    }));

    return NextResponse.json({ branches });
  } catch (error) {
    console.error('Error fetching branches:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
