import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { createToken, setAuthCookie } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import crypto from "crypto";

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

export async function GET(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=google_auth_failed`,
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=no_code`,
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=config_error`,
      );
    }

    // Обмен кода на токен
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=token_exchange_failed`,
      );
    }

    const tokenData: GoogleTokenResponse = await tokenResponse.json();

    // Получение информации о пользователе
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      },
    );

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=user_info_failed`,
      );
    }

    const googleUser: GoogleUserInfo = await userInfoResponse.json();

    // Поиск или создание пользователя
    let user = await prisma.users.findFirst({
      where: {
        OR: [{ google_id: googleUser.id }, { email: googleUser.email }],
      },
    });

    if (user) {
      // Обновление Google ID если его нет
      if (!user.google_id) {
        user = await prisma.users.update({
          where: { id: user.id },
          data: { google_id: googleUser.id, updated_at: new Date() },
        });
      }

      // Проверка статуса
      if (user.status === "blocked") {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/login?error=account_blocked`,
        );
      }

      if (user.status === "inactive") {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/login?error=account_inactive`,
        );
      }
    } else {
      // Создание нового пользователя
      const randomPassword = Math.random().toString(36).slice(-12);
      const passwordHash = await hashPassword(randomPassword);

      user = await prisma.users.create({
        data: {
          id: crypto.randomUUID(),
          full_name: googleUser.name,
          email: googleUser.email,
          password_hash: passwordHash,
          google_id: googleUser.id,
          avatar: googleUser.picture,
          role: "user",
          status: "active",
          updated_at: new Date(),
        },
      });
    }

    // Создание токена и установка cookie
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      loginType: 'user',
    });

    await setAuthCookie(token);

    // Редирект на главную страницу пользователя
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/home`);
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=server_error`,
    );
  }
}
