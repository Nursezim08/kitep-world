import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';

// GET - получить всех менеджеров
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Получаем всех менеджеров с их филиалами
    const managers = await prisma.user.findMany({
      where: {
        role: 'manager',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        branchUsers: {
          select: {
            branch: {
              select: {
                id: true,
                name: true,
                city: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ managers });
  } catch (error) {
    console.error('Get managers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - создать нового менеджера
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
    const { fullName, email, phone, password, branchId } = body;

    // Валидация
    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Проверка существования email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Проверка существования телефона (если указан)
    if (phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone },
      });

      if (existingPhone) {
        return NextResponse.json(
          { error: 'Phone already exists' },
          { status: 400 }
        );
      }
    }

    // Хешируем пароль
    const passwordHash = await hashPassword(password);

    // Создаем менеджера
    const manager = await prisma.user.create({
      data: {
        fullName,
        email,
        phone: phone || null,
        passwordHash,
        role: 'manager',
        emailVerified: true, // Менеджеры создаются админом, верификация не нужна
        status: 'active',
      },
    });

    // Если указан филиал, привязываем менеджера к филиалу
    if (branchId) {
      await prisma.branchUser.create({
        data: {
          userId: manager.id,
          branchId,
        },
      });
    }

    return NextResponse.json({
      message: 'Manager created successfully',
      manager: {
        id: manager.id,
        fullName: manager.fullName,
        email: manager.email,
        phone: manager.phone,
        status: manager.status,
      },
    });
  } catch (error) {
    console.error('Create manager error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
