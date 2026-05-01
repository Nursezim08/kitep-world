import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, code } = body;

    if (!userId || !code) {
      return NextResponse.json(
        { error: 'Необходимо указать userId и код верификации' },
        { status: 400 }
      );
    }

    // Проверка кода верификации
    const verification = await prisma.emailVerification.findFirst({
      where: {
        userId,
        code,
        verified: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Неверный или истекший код верификации' },
        { status: 400 }
      );
    }

    // Обновление статуса верификации
    await prisma.$transaction([
      prisma.emailVerification.update({
        where: { id: verification.id },
        data: { verified: true },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { emailVerified: true },
      }),
    ]);

    // Создание токена и установка cookie
    const token = await createToken({
      userId: verification.user.id,
      email: verification.user.email,
      role: verification.user.role,
    });

    await setAuthCookie(token);

    return NextResponse.json(
      {
        message: 'Email успешно верифицирован',
        user: {
          id: verification.user.id,
          fullName: verification.user.fullName,
          email: verification.user.email,
          role: verification.user.role,
          phone: verification.user.phone,
          avatar: verification.user.avatar,
          status: verification.user.status,
          emailVerified: true,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Ошибка при верификации email' },
      { status: 500 }
    );
  }
}
