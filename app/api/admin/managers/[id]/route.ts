import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';

// PATCH - обновить менеджера
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
    const { fullName, email, phone, password, status, branchId } = body;

    // Проверяем существование менеджера
    const existingManager = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingManager || existingManager.role !== 'manager') {
      return NextResponse.json(
        { error: 'Manager not found' },
        { status: 404 }
      );
    }

    // Проверка email на уникальность (если изменился)
    if (email && email !== existingManager.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    // Проверка телефона на уникальность (если изменился)
    if (phone && phone !== existingManager.phone) {
      const phoneExists = await prisma.user.findUnique({
        where: { phone },
      });

      if (phoneExists) {
        return NextResponse.json(
          { error: 'Phone already exists' },
          { status: 400 }
        );
      }
    }

    // Подготовка данных для обновления
    const updateData: any = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone || null;
    if (status) updateData.status = status;
    if (password) {
      updateData.passwordHash = await hashPassword(password);
    }

    // Обновляем менеджера
    const updatedManager = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Обновляем привязку к филиалу (если указан)
    if (branchId !== undefined) {
      // Удаляем старые привязки
      await prisma.branchUser.deleteMany({
        where: { userId: id },
      });

      // Создаем новую привязку (если branchId не null)
      if (branchId) {
        await prisma.branchUser.create({
          data: {
            userId: id,
            branchId,
          },
        });
      }
    }

    return NextResponse.json({
      message: 'Manager updated successfully',
      manager: {
        id: updatedManager.id,
        fullName: updatedManager.fullName,
        email: updatedManager.email,
        phone: updatedManager.phone,
        status: updatedManager.status,
      },
    });
  } catch (error) {
    console.error('Update manager error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - удалить менеджера
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

    // Проверяем существование менеджера
    const existingManager = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingManager || existingManager.role !== 'manager') {
      return NextResponse.json(
        { error: 'Manager not found' },
        { status: 404 }
      );
    }

    // Удаляем менеджера (каскадно удалятся связи с филиалами)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Manager deleted successfully',
    });
  } catch (error) {
    console.error('Delete manager error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
