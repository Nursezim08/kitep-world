import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateVerificationCode, sendManagerLoginEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    console.log('[Manager Resend] Resend code request for userId:', userId);

    if (!userId) {
      return NextResponse.json(
        { error: 'userId обязателен' },
        { status: 400 }
      );
    }

    // Находим пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log('[Manager Resend] ERROR: User not found');
      return NextResponse.json(
        { error: 'userNotFound' },
        { status: 404 }
      );
    }

    // Проверяем роль менеджера
    if (user.role !== 'manager') {
      console.log('[Manager Resend] ERROR: User is not manager');
      return NextResponse.json(
        { error: 'notManager' },
        { status: 403 }
      );
    }

    // Генерируем новый код
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    console.log('[Manager Resend] Generated new code:', code);

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

    console.log('[Manager Resend] New code saved to database');

    // Отправляем код на email
    console.log('[Manager Resend] Attempting to send code via email...');
    const sent = await sendManagerLoginEmail(user.email, code);

    if (!sent) {
      console.log('[Manager Resend] WARNING: Failed to send email, but code is saved');
      // Не возвращаем ошибку, так как в dev режиме код выводится в консоль
    }

    console.log('[Manager Resend] SUCCESS: Code sent via email');

    return NextResponse.json({
      success: true,
      message: 'Код отправлен повторно',
    });
  } catch (error) {
    console.error('[Manager Resend] EXCEPTION:', error);
    return NextResponse.json(
      { error: 'serverError' },
      { status: 500 }
    );
  }
}
