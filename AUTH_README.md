# Система аутентификации Kitep World

## Обзор

Реализована полная система регистрации и авторизации с поддержкой:
- ✅ Обычная регистрация с email и паролем
- ✅ Вход с email и паролем
- ✅ OAuth через Google
- ✅ JWT токены в HTTP-only cookies
- ✅ Защита маршрутов через middleware
- ✅ Валидация данных
- ✅ Хеширование паролей (bcrypt)
- ✅ Профиль пользователя

## Структура файлов

```
lib/
├── auth.ts           # JWT токены, cookies, получение текущего пользователя
├── password.ts       # Хеширование и проверка паролей
├── validation.ts     # Валидация email, пароля, телефона
└── prisma.ts         # Prisma Client singleton

app/
├── api/auth/
│   ├── register/route.ts          # POST /api/auth/register
│   ├── login/route.ts             # POST /api/auth/login
│   ├── logout/route.ts            # POST /api/auth/logout
│   ├── me/route.ts                # GET /api/auth/me
│   ├── google/route.ts            # GET /api/auth/google
│   └── google/callback/route.ts   # GET /api/auth/google/callback
├── (auth)/
│   ├── login/page.tsx             # Страница входа
│   ├── register/page.tsx          # Страница регистрации
│   └── layout.tsx                 # Layout для auth страниц
├── profile/
│   ├── page.tsx                   # Страница профиля (server)
│   └── ProfileClient.tsx          # Клиентский компонент профиля
└── components/
    └── AuthButtons.tsx            # Кнопки входа/регистрации или профиль

middleware.ts         # Защита маршрутов
```

## API Endpoints

### POST /api/auth/register
Регистрация нового пользователя

**Body:**
```json
{
  "fullName": "Иван Иванов",
  "email": "ivan@example.com",
  "password": "SecurePass123",
  "phone": "+996555123456" // опционально
}
```

**Response (201):**
```json
{
  "message": "Регистрация успешна",
  "user": {
    "id": "uuid",
    "fullName": "Иван Иванов",
    "email": "ivan@example.com",
    "role": "user",
    "phone": "+996555123456",
    "avatar": null,
    "status": "active"
  }
}
```

### POST /api/auth/login
Вход в систему

**Body:**
```json
{
  "email": "ivan@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "message": "Вход выполнен успешно",
  "user": {
    "id": "uuid",
    "fullName": "Иван Иванов",
    "email": "ivan@example.com",
    "role": "user",
    "phone": "+996555123456",
    "avatar": null,
    "status": "active"
  }
}
```

### POST /api/auth/logout
Выход из системы

**Response (200):**
```json
{
  "message": "Выход выполнен успешно"
}
```

### GET /api/auth/me
Получение текущего пользователя

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "fullName": "Иван Иванов",
    "email": "ivan@example.com",
    "role": "user",
    "phone": "+996555123456",
    "avatar": null,
    "status": "active"
  }
}
```

### GET /api/auth/google
Инициирует OAuth через Google (редирект на Google)

### GET /api/auth/google/callback
Callback для Google OAuth (обрабатывает код авторизации)

## Использование в коде

### Server Components

```typescript
import { getCurrentUser } from '@/lib/auth';

export default async function MyPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return <div>Привет, {user.fullName}!</div>;
}
```

### Client Components

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function MyComponent() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => setUser(data.user))
      .catch(() => setUser(null));
  }, []);
  
  if (!user) return <div>Загрузка...</div>;
  
  return <div>Привет, {user.fullName}!</div>;
}
```

### Logout

```typescript
const handleLogout = async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  router.push('/login');
  router.refresh();
};
```

## Валидация

### Пароль
- Минимум 8 символов
- Хотя бы одна заглавная буква
- Хотя бы одна строчная буква
- Хотя бы одна цифра

### Email
- Стандартная валидация email формата

### Телефон
- Опциональное поле
- Формат: +[код страны][номер]

## Безопасность

### JWT Токены
- Хранятся в HTTP-only cookies
- Срок действия: 7 дней
- Алгоритм: HS256

### Пароли
- Хешируются с помощью bcrypt
- Salt rounds: 12

### Cookies
- `httpOnly: true` - защита от XSS
- `secure: true` в production - только HTTPS
- `sameSite: 'lax'` - защита от CSRF
- `maxAge: 7 days`

### Middleware
- Автоматический редирект авторизованных пользователей с /login и /register
- Можно добавить защиту для других маршрутов

## Настройка Google OAuth

См. файл `GOOGLE_OAUTH_SETUP.md` для подробных инструкций.

Кратко:
1. Создайте проект в Google Cloud Console
2. Настройте OAuth consent screen
3. Создайте OAuth 2.0 Client ID
4. Добавьте credentials в `.env`:
   ```env
   GOOGLE_CLIENT_ID="ваш-client-id"
   GOOGLE_CLIENT_SECRET="ваш-client-secret"
   ```

## Переменные окружения

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kitep-world"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# JWT Secret (обязательно измените в production!)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Запуск

1. Установите зависимости:
```bash
npm install
```

2. Сгенерируйте Prisma Client:
```bash
npx prisma generate
```

3. Примените миграции:
```bash
npx prisma migrate dev
```

4. Запустите сервер:
```bash
npm run dev
```

5. Откройте браузер:
- Регистрация: http://localhost:3000/register
- Вход: http://localhost:3000/login
- Профиль: http://localhost:3000/profile

## Роли пользователей

Из схемы БД поддерживаются 3 роли:
- `user` - обычный пользователь (по умолчанию)
- `manager` - менеджер
- `admin` - администратор

## Статусы пользователей

- `active` - активный (по умолчанию)
- `inactive` - неактивный
- `blocked` - заблокированный

Пользователи со статусом `inactive` или `blocked` не могут войти в систему.

## Интеграция с существующей схемой БД

Система полностью интегрирована с вашей Prisma схемой:
- Использует модель `User` с полями `googleId`, `passwordHash`, `role`, `status`
- Поддерживает все связи (корзина, заказы, отзывы, AI чаты)
- Совместима с существующими enum типами

## Дальнейшее развитие

Возможные улучшения:
- [ ] Восстановление пароля через email
- [ ] Подтверждение email
- [ ] Двухфакторная аутентификация (2FA)
- [ ] OAuth через другие провайдеры (Facebook, Apple)
- [ ] Редактирование профиля
- [ ] Загрузка аватара
- [ ] История входов
- [ ] Rate limiting для защиты от брутфорса
