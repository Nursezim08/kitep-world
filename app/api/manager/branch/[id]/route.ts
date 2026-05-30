import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    console.log('[Manager Branch] Request for branch:', id);
    console.log('[Manager Branch] Current user:', user?.id, user?.role);

    // Проверяем авторизацию
    if (!user) {
      console.log('[Manager Branch] ERROR: User not authenticated');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Проверяем роль менеджера
    if (user.role !== 'manager') {
      console.log('[Manager Branch] ERROR: User is not a manager');
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Проверяем, что менеджер имеет доступ к этому филиалу
    const branchUser = await prisma.branch_users.findFirst({
      where: {
        branch_id: id,
        user_id: user.id,
      },
    });

    if (!branchUser) {
      console.log('[Manager Branch] ERROR: Manager does not have access to this branch');
      return NextResponse.json(
        { error: 'Access denied to this branch' },
        { status: 403 }
      );
    }

    // Получаем данные филиала
    const branch = await prisma.branches.findUnique({
      where: { id },
      include: {
        branch_users: {
          include: {
            users: {
              select: {
                id: true,
                full_name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!branch) {
      console.log('[Manager Branch] ERROR: Branch not found');
      return NextResponse.json(
        { error: 'Branch not found' },
        { status: 404 }
      );
    }

    console.log('[Manager Branch] SUCCESS: Branch data retrieved');

    return NextResponse.json({
      branch: {
        id: branch.id,
        name: branch.name,
        code: branch.code,
        city: branch.city,
        district: branch.district,
        address: branch.address,
        phone: branch.phone,
        email: branch.email,
        openTime: branch.open_time,
        closeTime: branch.close_time,
        workDays: branch.work_days,
        status: branch.status,
        branchUsers: branch.branch_users.map((bu) => ({
          user: {
            id: bu.users.id,
            fullName: bu.users.full_name,
            email: bu.users.email,
            avatar: bu.users.avatar,
          },
        })),
      },
    });
  } catch (error) {
    console.error('[Manager Branch] EXCEPTION:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
