import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET /api/admin/users/[id] - Получение пользователя по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = getPrismaClient();
  try {
    const user = await verifyAuth(request);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const targetUser = await prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        full_name: true,
        email: true,
        email_verified: true,
        role: true,
        phone: true,
        avatar: true,
        status: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            orders: true,
            branch_users: true,
          },
        },
        orders: {
          take: 10,
          orderBy: {
            created_at: 'desc',
          },
          select: {
            id: true,
            order_number: true,
            total: true,
            order_status: true,
            created_at: true,
          },
        },
        branch_users: {
          select: {
            branches: {
              select: {
                id: true,
                name: true,
                city: true,
              },
            },
          },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: targetUser.id,
        fullName: targetUser.full_name,
        email: targetUser.email,
        emailVerified: targetUser.email_verified,
        role: targetUser.role,
        phone: targetUser.phone,
        avatar: targetUser.avatar,
        status: targetUser.status,
        createdAt: targetUser.created_at,
        updatedAt: targetUser.updated_at,
        _count: {
          orders: targetUser._count.orders,
          branchUsers: targetUser._count.branch_users,
        },
        orders: targetUser.orders.map((o) => ({
          id: o.id,
          orderNumber: o.order_number,
          total: o.total,
          orderStatus: o.order_status,
          createdAt: o.created_at,
        })),
        branchUsers: targetUser.branch_users.map((bu) => ({
          branch: {
            id: bu.branches.id,
            name: bu.branches.name,
            city: bu.branches.city,
          },
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении пользователя' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/[id] - Обновление пользователя
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = getPrismaClient();
  try {
    const user = await verifyAuth(request);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { fullName, email, phone, role, password, status } = body;

    // Проверка существования пользователя
    const existingUser = await prisma.users.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Проверка уникальности email
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.users.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Пользователь с таким email уже существует' },
          { status: 400 }
        );
      }
    }

    // Проверка уникальности телефона
    if (phone && phone !== existingUser.phone) {
      const phoneExists = await prisma.users.findUnique({
        where: { phone },
      });

      if (phoneExists) {
        return NextResponse.json(
          { error: 'Пользователь с таким телефоном уже существует' },
          { status: 400 }
        );
      }
    }

    // Подготовка данных для обновления
    const updateData: any = {
      full_name: fullName,
      email,
      phone: phone || null,
      role,
      status,
      updated_at: new Date(),
    };

    // Обновление пароля, если указан
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    // Обновление пользователя
    const updatedUser = await prisma.users.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        full_name: true,
        email: true,
        email_verified: true,
        role: true,
        phone: true,
        avatar: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        fullName: updatedUser.full_name,
        email: updatedUser.email,
        emailVerified: updatedUser.email_verified,
        role: updatedUser.role,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        status: updatedUser.status,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at,
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении пользователя' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Удаление пользователя (блокировка)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = getPrismaClient();
  try {
    const user = await verifyAuth(request);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Проверка существования пользователя
    const existingUser = await prisma.users.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Нельзя удалить самого себя
    if (id === user.userId) {
      return NextResponse.json(
        { error: 'Нельзя удалить свой аккаунт' },
        { status: 400 }
      );
    }

    // Мягкое удаление (блокировка)
    await prisma.users.update({
      where: { id },
      data: {
        status: 'blocked',
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении пользователя' },
      { status: 500 }
    );
  }
}
