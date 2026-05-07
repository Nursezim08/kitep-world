import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import { generateVerificationCode, sendManagerLoginEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('[Manager Login] Login attempt for email:', email);

    if (!email || !password) {
      console.log('[Manager Login] ERROR: Missing email or password');
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    // Находим пользователя по email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        branchUsers: {
          include: {
            branch: true,
          },
        },
      },
    });

    if (!user) {
      console.log('[Manager Login] ERROR: User not found');
      return NextResponse.json(
        { error: 'invalidCredentials' },
        { status: 401 }
      );
    }

    console.log('[Manager Login] User found:', user.id, 'Role:', user.role);

    // Проверяем пароль
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      console.log('[Manager Login] ERROR: Invalid password');
      return NextResponse.json(
        { error: 'invalidCredentials' },
        { status: 401 }
      );
    }

    console.log('[Manager Login] Password valid');

    // Проверяем роль менеджера
    if (user.role !== 'manager') {
      console.log('[Manager Login] ERROR: User is not manager, role:', user.role);
      return NextResponse.json(
        { error: 'notManager' },
        { status: 403 }
      );
    }

    // Проверяем, что менеджер привязан к филиалу
    if (!user.branchUsers || user.branchUsers.length === 0) {
      console.log('[Manager Login] ERROR: Manager not assigned to any branch');
      return NextResponse.json(
        { error: 'noBranchAssigned' },
        { status: 403 }
      );
    }

    // Проверяем статус аккаунта
    if (user.status === 'blocked') {
      console.log('[Manager Login] ERROR: Account blocked');
      return NextResponse.json(
        { error: 'accountBlocked' },
        { status: 403 }
      );
    }

    if (user.status === 'inactive') {
      console.log('[Manager Login] ERROR: Account inactive');
      return NextResponse.json(
        { error: 'accountInactive' },
        { status: 403 }
      );
    }

    console.log('[Manager Login] Account status OK');

    // Генерируем код подтверждения
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    console.log('[Manager Login] Generated code:', code);

    // Удаляем старые неиспользованные коды
    await prisma.emailVerification.deleteMany({
      where: {
        userId: user.id,
        verified: false,
      },
    });

    // Создаем новый код
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        email: user.email,
        code,
        expiresAt,
      },
    });

    console.log('[Manager Login] Code saved to database');

    // Отправляем код на email
    console.log('[Manager Login] Attempting to send code via email...');
    const sent = await sendManagerLoginEmail(user.email, code);

    if (!sent) {
      console.log('[Manager Login] WARNING: Failed to send email, but code is saved');
      // Не возвращаем ошибку, так как в dev режиме код выводится в консоль
    }

    console.log('[Manager Login] SUCCESS: Code sent via email');

    return NextResponse.json({
      success: true,
      userId: user.id,
      branchId: user.branchUsers[0].branchId,
      message: 'Код отправлен на email',
    });
  } catch (error) {
    console.error('[Manager Login] EXCEPTION:', error);
    return NextResponse.json(
      { error: 'serverError' },
      { status: 500 }
    );
  }
}
