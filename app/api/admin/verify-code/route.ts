import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json();

    if (!userId || !code) {
      return NextResponse.json(
        { error: 'userId и code обязательны' },
        { status: 400 }
      );
    }

    // Находим код верификации
    const verification = await prisma.adminVerification.findFirst({
      where: {
        userId,
        code,
        verified: false,
      },
      include: {
        user: true,
      },
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'invalidCode' },
        { status: 401 }
      );
    }

    // Проверяем срок действия кода
    if (new Date() > verification.expiresAt) {
      return NextResponse.json(
        { error: 'codeExpired' },
        { status: 401 }
      );
    }

    // Помечаем код как использованный
    await prisma.adminVerification.update({
      where: { id: verification.id },
      data: { verified: true },
    });

    // Создаем JWT токен
    const token = await createToken({
      userId: verification.user.id,
      email: verification.user.email,
      role: verification.user.role,
    });

    // Устанавливаем cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: verification.user.id,
        fullName: verification.user.fullName,
        email: verification.user.email,
        role: verification.user.role,
      },
    });
  } catch (error) {
    console.error('Admin verify code error:', error);
    return NextResponse.json(
      { error: 'serverError' },
      { status: 500 }
    );
  }
}
