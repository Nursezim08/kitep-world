import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { getPrismaClient } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production",
);

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  loginType?: "user" | "manager" | "admin"; // Тип входа
}

export async function createToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
      loginType: payload.loginType as "user" | "manager" | "admin" | undefined,
    };
  } catch (error) {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
}

// Функция для проверки авторизации из запроса
export async function verifyAuth(request: Request): Promise<JWTPayload | null> {
  try {
    const token = request.headers
      .get("cookie")
      ?.split("auth_token=")[1]
      ?.split(";")[0];

    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token");
  return token?.value || null;
}

export async function getCurrentUser() {
  const token = await getAuthToken();
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  try {
    // Используем готовый клиент из lib/prisma.ts
    const prisma = getPrismaClient();

    const user = await prisma.users.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        status: true,
      },
    });

    if (!user) return null;

    // Преобразуем snake_case в camelCase для клиента
    return {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      status: user.status,
    };
  } catch (error) {
    console.error("[AUTH] Error in getCurrentUser:", error);
    return null;
  }
}

// Проверка доступа к пользовательским страницам
export async function checkUserAccess() {
  const user = await getCurrentUser();

  if (!user) {
    return { allowed: false, redirectTo: "/login" };
  }

  // Получаем токен для проверки loginType
  const token = await getAuthToken();
  const payload = token ? await verifyToken(token) : null;

  // Админы не могут заходить на пользовательские страницы
  if (user.role === "admin") {
    return { allowed: false, redirectTo: "/admin/dashboard" };
  }

  // Менеджеры могут заходить только если вошли через /login (loginType !== 'manager')
  if (user.role === "manager" && payload?.loginType === "manager") {
    return { allowed: false, redirectTo: "/manager/dashboard" };
  }

  return { allowed: true, user };
}
