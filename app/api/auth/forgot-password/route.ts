import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateVerificationCode, sendPasswordResetEmail } from '@/lib/email';
import { validateEmail } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Валидация email
    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { error: 'Некорректный email' },
        { status: 400 }
      );
    }

    // Проверка существования пользователя
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Эта почта не зарегистрирована на нашем сайте' },
        { status: 404 }
      );
    }

    // Проверка, что это не Google аккаунт
    if (user.googleId) {
      return NextResponse.json(
        { error: 'Этот аккаунт зарегистрирован через Google. Используйте вход через Google.' },
        { status: 400 }
      );
    }

    // Генерация кода
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    // Удаление старых неиспользованных кодов для этого email
    await prisma.passwordReset.deleteMany({
      where: {
        email: email.toLowerCase(),
        used: false,
      },
    });

    // Создание нового кода
    await prisma.passwordReset.create({
      data: {
        email: email.toLowerCase(),
        code,
        expiresAt,
      },
    });

    // Отправка email
    await sendPasswordResetEmail(email, code);

    return NextResponse.json({
      success: true,
      message: 'Код для сброса пароля отправлен на вашу почту',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
