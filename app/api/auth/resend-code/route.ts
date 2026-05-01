import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateVerificationCode, sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Необходимо указать userId' },
        { status: 400 }
      );
    }

    // Получение пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email уже верифицирован' },
        { status: 400 }
      );
    }

    // Проверка на частоту запросов (не более 1 раза в минуту)
    const recentVerification = await prisma.emailVerification.findFirst({
      where: {
        userId,
        createdAt: {
          gt: new Date(Date.now() - 60 * 1000), // 1 минута назад
        },
      },
    });

    if (recentVerification) {
      return NextResponse.json(
        { error: 'Подождите минуту перед повторной отправкой кода' },
        { status: 429 }
      );
    }

    // Генерация нового кода
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        email: user.email,
        code: verificationCode,
        expiresAt,
      },
    });

    // Отправка email с кодом
    await sendVerificationEmail(user.email, verificationCode);

    return NextResponse.json(
      {
        message: 'Код верификации отправлен повторно',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend code error:', error);
    return NextResponse.json(
      { error: 'Ошибка при отправке кода' },
      { status: 500 }
    );
  }
}
