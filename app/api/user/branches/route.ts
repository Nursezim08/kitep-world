import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Проверка авторизации
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Проверка роли
    if (user.role !== 'user') {
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
      // workDays уже массив в БД
      workDays: branch.workDays || [],
      // Форматируем время из Time в строку HH:MM
      openTime: branch.openTime
        ? branch.openTime.toString().substring(0, 5) // "09:00:00" -> "09:00"
        : '09:00',
      closeTime: branch.closeTime
        ? branch.closeTime.toString().substring(0, 5) // "18:00:00" -> "18:00"
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
