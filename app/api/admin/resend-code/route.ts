import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateVerificationCode, sendTelegramCode } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId обязателен' },
        { status: 400 }
      );
    }

    // Проверяем существование пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'notAdmin' },
        { status: 403 }
      );
    }

    // Генерируем новый код
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 минут

    // Удаляем старые неиспользованные коды
    await prisma.adminVerification.deleteMany({
      where: {
        userId: user.id,
        verified: false,
      },
    });

    // Создаем новый код
    await prisma.adminVerification.create({
      data: {
        userId: user.id,
        code,
        expiresAt,
      },
    });

    // Отправляем код в Telegram
    const sent = await sendTelegramCode(user.id, code);

    if (!sent) {
      return NextResponse.json(
        { error: 'codeNotSent' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Код отправлен повторно',
    });
  } catch (error) {
    console.error('Admin resend code error:', error);
    return NextResponse.json(
      { error: 'serverError' },
      { status: 500 }
    );
  }
}
