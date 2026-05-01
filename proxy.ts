import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Пропускаем статические файлы и API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/public') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Получаем токен из cookies
  const token = request.cookies.get('auth_token')?.value;

  // Проверяем токен
  let user = null;
  if (token) {
    user = await verifyToken(token);
  }

  // ============================================
  // ЗАЩИТА АДМИНСКИХ МАРШРУТОВ
  // ============================================
  if (pathname.startsWith('/admin')) {
    // Разрешаем доступ к страницам входа без авторизации
    if (pathname === '/admin/login' || pathname === '/admin/verify') {
      // Если админ уже авторизован, перенаправляем в dashboard
      if (user && user.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // Для всех остальных админских страниц требуется авторизация
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Проверяем роль администратора
    if (user.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  }

  // ============================================
  // ЗАЩИТА ПОЛЬЗОВАТЕЛЬСКИХ МАРШРУТОВ
  // ============================================
  if (pathname.startsWith('/profile')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Админы не могут заходить на пользовательские страницы
    if (user.role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    return NextResponse.next();
  }

  // ============================================
  // ЗАЩИТА СТРАНИЦ АВТОРИЗАЦИИ
  // ============================================
  if (pathname === '/login' || pathname === '/register' || pathname === '/verify-email') {
    if (user) {
      // Админы идут в админку, обычные пользователи в профиль
      if (user.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/profile', request.url));
    }
    return NextResponse.next();
  }

  // ============================================
  // ЗАЩИТА ГЛАВНОЙ СТРАНИЦЫ ДЛЯ АДМИНОВ
  // ============================================
  if (pathname === '/') {
    if (user && user.role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};