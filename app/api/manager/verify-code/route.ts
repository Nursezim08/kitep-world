import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json();

    console.log('[Manager Verify] Verification attempt for userId:', userId);

    if (!userId || !code) {
      return NextResponse.json(
        { error: 'userId и code обязательны' },
        { status: 400 }
      );
    }

    // Находим код верификации
    const verification = await prisma.emailVerification.findFirst({
      where: {
        userId,
        code,
        verified: false,
      },
      include: {
        user: {
          include: {
            branchUsers: {
              include: {
                branch: true,
              },
            },
          },
        },
      },
    });

    if (!verification) {
      console.log('[Manager Verify] ERROR: Invalid code');
      return NextResponse.json(
        { error: 'invalidCode' },
        { status: 401 }
      );
    }

    // Проверяем срок действия кода
    if (new Date() > verification.expiresAt) {
      console.log('[Manager Verify] ERROR: Code expired');
      return NextResponse.json(
        { error: 'codeExpired' },
        { status: 401 }
      );
    }

    // Проверяем, что пользователь - менеджер
    if (verification.user.role !== 'manager') {
      console.log('[Manager Verify] ERROR: User is not a manager');
      return NextResponse.json(
        { error: 'notManager' },
        { status: 403 }
      );
    }

    // Проверяем, что менеджер привязан к филиалу
    if (!verification.user.branchUsers || verification.user.branchUsers.length === 0) {
      console.log('[Manager Verify] ERROR: Manager not assigned to any branch');
      return NextResponse.json(
        { error: 'noBranchAssigned' },
        { status: 403 }
      );
    }

    // Помечаем код как использованный
    await prisma.emailVerification.update({
      where: { id: verification.id },
      data: { verified: true },
    });

    console.log('[Manager Verify] Code verified successfully');

    // Создаем JWT токен
    const token = await createToken({
      userId: verification.user.id,
      email: verification.user.email,
      role: verification.user.role,
    });

    // Устанавливаем cookie
    await setAuthCookie(token);

    console.log('[Manager Verify] SUCCESS: Token created and cookie set');

    return NextResponse.json({
      success: true,
      branchId: verification.user.branchUsers[0].branchId,
      user: {
        id: verification.user.id,
        fullName: verification.user.fullName,
        email: verification.user.email,
        role: verification.user.role,
      },
    });
  } catch (error) {
    console.error('[Manager Verify] EXCEPTION:', error);
    return NextResponse.json(
      { error: 'serverError' },
      { status: 500 }
    );
  }
}
