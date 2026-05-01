import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { validateEmail, validatePassword } from '@/lib/validation';
import { generateVerificationCode, sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, password, phone } = body;

    // Валидация
    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Некорректный email адрес' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Проверка существования пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Если пользователь зарегистрирован через Google
      if (existingUser.googleId) {
        return NextResponse.json(
          { 
            error: 'Пользователь с таким email уже существует',
            useGoogleAuth: true 
          },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 409 }
      );
    }

    // Проверка телефона если указан
    if (phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone },
      });

      if (existingPhone) {
        return NextResponse.json(
          { error: 'Пользователь с таким телефоном уже существует' },
          { status: 409 }
        );
      }
    }

    // Создание пользователя (НЕ верифицированного)
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        phone: phone || null,
        role: 'user',
        status: 'active',
        emailVerified: false,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        status: true,
        emailVerified: true,
      },
    });

    // Генерация и отправка кода верификации
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
        message: 'Регистрация успешна. Проверьте email для верификации.',
        userId: user.id,
        email: user.email,
        requiresVerification: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Ошибка при регистрации' },
      { status: 500 }
    );
  }
}
