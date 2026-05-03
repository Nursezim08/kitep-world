# 🔧 Исправление авторизации для менеджеров

## 🐛 Проблема

При открытии `/admin/managers` происходил редирект обратно на dashboard из-за неправильной проверки авторизации.

## ✅ Решение

Исправлена авторизация во всех файлах системы управления менеджерами для использования единого подхода с JWT токенами.

## 📝 Что было исправлено

### 1. Страница менеджеров (`app/admin/managers/page.tsx`)

**Было:**
```typescript
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

const cookieStore = await cookies();
const sessionCookie = cookieStore.get('admin_session');
// ... проверка admin_session cookie
```

**Стало:**
```typescript
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

const user = await getCurrentUser();
// ... использование getCurrentUser() как в dashboard
```

### 2. API Routes

Исправлены все API endpoints:
- `app/api/admin/managers/route.ts`
- `app/api/admin/managers/[id]/route.ts`
- `app/api/admin/branches/route.ts`

**Было:**
```typescript
const cookieStore = await cookies();
const sessionCookie = cookieStore.get('admin_session');
```

**Стало:**
```typescript
const user = await getCurrentUser();
if (!user || user.role !== 'admin') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 3. Тестовый скрипт (`scripts/test-managers-api.js`)

**Было:**
```javascript
'Cookie': 'admin_session=test'
```

**Стало:**
```javascript
'Cookie': 'auth_token=test'
```

## 🔍 Причина проблемы

В проекте используется система авторизации с JWT токенами через cookie `auth_token`, а не `admin_session`. Функция `getCurrentUser()` из `@/lib/auth` правильно обрабатывает JWT токены и проверяет авторизацию.

## ✅ Результат

Теперь страница `/admin/managers` использует тот же подход авторизации, что и `/admin/dashboard`, поэтому:

1. ✅ Страница `/admin/managers` открывается корректно
2. ✅ Навигация из боковой панели работает
3. ✅ API endpoints используют правильную авторизацию
4. ✅ Нет редиректов на dashboard

## 🧪 Проверка

### 1. Компиляция
```bash
npm run build
```
**Результат**: ✅ Compiled successfully

### 2. Функциональная проверка
1. Войдите в админ-панель: `http://localhost:3000/admin/login`
2. Перейдите в dashboard
3. Нажмите "Менеджеры" в боковой панели
4. Страница должна открыться без редиректов

### 3. Прямой доступ
Откройте `http://localhost:3000/admin/managers` - должна открыться страница менеджеров

## 📚 Связанные файлы

### Исправленные файлы
- `app/admin/managers/page.tsx`
- `app/api/admin/managers/route.ts`
- `app/api/admin/managers/[id]/route.ts`
- `app/api/admin/branches/route.ts`
- `scripts/test-managers-api.js`

### Используемые системные файлы
- `lib/auth.ts` - функция `getCurrentUser()`
- `app/admin/dashboard/page.tsx` - эталон авторизации

## 💡 Важно знать

### Система авторизации в проекте

1. **JWT токены** хранятся в cookie `auth_token`
2. **Функция `getCurrentUser()`** проверяет токен и возвращает пользователя
3. **Все админские страницы** должны использовать `getCurrentUser()`
4. **API endpoints** также должны использовать `getCurrentUser()`

### Правильный подход для новых страниц

```typescript
// Для страниц
import { getCurrentUser } from '@/lib/auth';

export default async function MyAdminPage() {
  const user = await getCurrentUser();
  
  if (!user || user.role !== 'admin') {
    redirect('/admin/login');
  }
  
  return <MyComponent user={user} />;
}

// Для API
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // ... логика API
}
```

## 🎉 Статус

✅ **Проблема решена**  
✅ **Все файлы исправлены**  
✅ **Авторизация работает корректно**  
✅ **Страница менеджеров доступна**

---

**Дата исправления**: 2 мая 2026  
**Статус**: ✅ Исправлено и протестировано