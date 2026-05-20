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
    console.log('[MIDDLEWARE] User from token:', { 
      userId: user?.userId, 
      role: user?.role, 
      loginType: user?.loginType,
      pathname 
    });
  } else {
    console.log('[MIDDLEWARE] No token found for path:', pathname);
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
  const userRoutes = [
    '/home',
    '/catalog',
    '/cart',
    '/checkout',
    '/orders',
    '/profile',
    '/ai-chat',
    '/search',
    '/product',
  ];

  if (userRoutes.some(route => pathname.startsWith(route))) {
    console.log('[MIDDLEWARE] User route detected:', pathname, 'User:', user);
    
    if (!user) {
      console.log('[MIDDLEWARE] No user, redirecting to /login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Админы не могут заходить на пользовательские страницы
    if (user.role === 'admin') {
      console.log('[MIDDLEWARE] Admin detected, redirecting to /admin/dashboard');
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    
    // Менеджеры могут заходить только если вошли через /manager/login
    // ВАЖНО: если loginType отсутствует (старый токен), считаем что это user
    if (user.role === 'manager' && user.loginType === 'manager') {
      console.log('[MIDDLEWARE] Manager with loginType=manager, redirecting to /manager/dashboard');
      return NextResponse.redirect(new URL('/manager/dashboard', request.url));
    }

    console.log('[MIDDLEWARE] Allowing access to user route');
    return NextResponse.next();
  }

  // ============================================
  // ЗАЩИТА СТРАНИЦ АВТОРИЗАЦИИ И ВОССТАНОВЛЕНИЯ ПАРОЛЯ
  // ============================================
  const authPages = [
    '/login',
    '/register',
    '/verify-email',
    '/forgot-password',
    '/reset-password/verify',
    '/reset-password/new',
  ];

  if (authPages.some(page => pathname.startsWith(page))) {
    if (user) {
      // Админы идут в админку
      if (user.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      // Менеджеры идут в панель менеджера только если вошли через /manager/login
      if (user.role === 'manager' && user.loginType === 'manager') {
        return NextResponse.redirect(new URL('/manager/dashboard', request.url));
      }
      // Все остальные идут на главную пользователя
      return NextResponse.redirect(new URL('/home', request.url));
    }
    return NextResponse.next();
  }

  // ============================================
  // ЗАЩИТА ГЛАВНОЙ СТРАНИЦЫ (LANDING PAGE)
  // ============================================
  if (pathname === '/') {
    console.log('[MIDDLEWARE] Root path detected, user:', user);
    
    if (user) {
      // Админы идут в админку
      if (user.role === 'admin') {
        console.log('[MIDDLEWARE] Admin on root, redirecting to /admin/dashboard');
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      // Менеджеры идут в панель менеджера только если вошли через /manager/login
      if (user.role === 'manager' && user.loginType === 'manager') {
        console.log('[MIDDLEWARE] Manager with loginType=manager on root, redirecting to /manager/dashboard');
        return NextResponse.redirect(new URL('/manager/dashboard', request.url));
      }
      // Все остальные (включая менеджеров, вошедших через /login) идут на главную пользователя
      console.log('[MIDDLEWARE] Regular user on root, redirecting to /home');
      return NextResponse.redirect(new URL('/home', request.url));
    }
    console.log('[MIDDLEWARE] No user on root, showing landing page');
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};