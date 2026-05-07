# Руководство по входу менеджеров

## Быстрый старт

### 1. Создание менеджера (для администратора)

1. Войдите в админ-панель: `/admin/login`
2. Перейдите в раздел "Менеджеры": `/admin/managers`
3. Нажмите "Добавить менеджера"
4. Заполните форму:
   - ФИО
   - Email (будет использоваться для входа)
   - Телефон
   - Пароль (передайте менеджеру)
5. Сохраните менеджера

### 2. Назначение менеджера на филиал

1. Перейдите в раздел "Филиалы": `/admin/branches`
2. Выберите филиал или создайте новый
3. В форме филиала добавьте менеджера в секции "Менеджеры"
4. Сохраните изменения

### 3. Вход менеджера

1. Откройте страницу входа: `/manager/login`
2. Введите email и пароль
3. Нажмите "Войти"
4. Проверьте email - придет письмо с 6-значным кодом
5. Введите код на странице `/manager/verify`
6. Нажмите "Подтвердить"
7. Вы будете перенаправлены на страницу филиала

## Структура файлов

```
app/
├── manager/
│   ├── login/
│   │   └── page.tsx              # Страница входа
│   ├── verify/
│   │   └── page.tsx              # Страница ввода кода
│   └── branch/
│       └── [id]/
│           ├── page.tsx          # Server component
│           └── BranchManagerClient.tsx  # Client component
│
└── api/
    └── manager/
        ├── login/
        │   └── route.ts          # POST - вход и отправка кода
        ├── verify-code/
        │   └── route.ts          # POST - проверка кода
        └── resend-code/
            └── route.ts          # POST - повторная отправка кода

lib/
└── email.ts                      # Функция sendManagerLoginEmail()
```

## API Endpoints

### POST /api/manager/login

**Описание:** Вход менеджера с отправкой кода на email

**Request:**
```json
{
  "email": "manager@example.com",
  "password": "password123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "userId": "uuid",
  "branchId": "uuid",
  "message": "Код отправлен на email"
}
```

**Response (Error - 401/403):**
```json
{
  "error": "invalidCredentials" | "notManager" | "noBranchAssigned" | "accountBlocked" | "accountInactive"
}
```

### POST /api/manager/verify-code

**Описание:** Проверка кода и создание сессии

**Request:**
```json
{
  "userId": "uuid",
  "code": "123456"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "branchId": "uuid",
  "user": {
    "id": "uuid",
    "fullName": "Иван Иванов",
    "email": "manager@example.com",
    "role": "manager"
  }
}
```

**Response (Error - 401/403):**
```json
{
  "error": "invalidCode" | "codeExpired" | "notManager" | "noBranchAssigned"
}
```

### POST /api/manager/resend-code

**Описание:** Повторная отправка кода

**Request:**
```json
{
  "userId": "uuid"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Код отправлен повторно"
}
```

## Тестирование

### В режиме разработки (без SMTP)

1. Запустите dev сервер: `npm run dev`
2. Откройте `/manager/login`
3. Введите email и пароль менеджера
4. **Код будет выведен в консоль сервера** (терминал где запущен `npm run dev`)
5. Скопируйте код из консоли
6. Введите код на странице `/manager/verify`

**Пример вывода в консоль:**
```
==================================================
📧 MANAGER LOGIN CODE (Development Mode)
==================================================
To: manager@example.com
Code: 123456
==================================================
```

### В production (с настроенным SMTP)

1. Настройте переменные окружения в `.env`:
   ```
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```
2. Код будет отправлен на реальный email
3. Проверьте почту и введите код

## Безопасность

### Проверки при входе

1. **Email и пароль**: Проверка учетных данных
2. **Роль**: Должна быть `manager`
3. **Привязка к филиалу**: Менеджер должен быть назначен хотя бы на один филиал
4. **Статус аккаунта**: Должен быть `active`

### Защита кода

- Код действителен **10 минут**
- Код хранится в таблице `email_verifications`
- После использования код помечается как `verified: true`
- Старые неиспользованные коды автоматически удаляются

### JWT токены

- Токен хранится в httpOnly cookie
- Срок действия: 7 дней
- Содержит: userId, email, role

## Возможные ошибки

### "Неверный email или пароль"
- Проверьте правильность email
- Проверьте правильность пароля
- Убедитесь, что пользователь существует

### "У вас нет прав менеджера"
- Роль пользователя должна быть `manager`
- Проверьте роль в админ-панели

### "Вы не привязаны ни к одному филиалу"
- Менеджер должен быть назначен на филиал
- Назначьте менеджера через админ-панель

### "Ваш аккаунт заблокирован"
- Статус аккаунта `blocked`
- Разблокируйте через админ-панель

### "Неверный код подтверждения"
- Проверьте правильность ввода кода
- Код чувствителен к регистру (только цифры)

### "Код подтверждения истек"
- Код действителен 10 минут
- Запросите новый код кнопкой "Отправить код повторно"

## Дизайн

### Цветовая схема

**Менеджер (синий):**
- Primary: `#3b82f6` (blue-500)
- Secondary: `#2563eb` (blue-600)
- Background: `from-blue-900 via-blue-800 to-blue-900`

**Админ (фиолетовый):**
- Primary: `#8b5cf6` (violet-500)
- Secondary: `#7c3aed` (violet-600)
- Background: `from-slate-900 via-slate-800 to-slate-900`

### Иконки

- Вход: `FiUser` (пользователь)
- Email: `FiMail` (письмо)
- Филиал: `FiPackage` (пакет)
- Выход: `FiLogOut` (выход)

## Расширение функционала

### Добавление новых функций в панель менеджера

Отредактируйте файл `app/manager/branch/[id]/BranchManagerClient.tsx`:

```tsx
// Добавьте новую секцию после существующих
<div className="mt-6 bg-white rounded-xl shadow-lg p-6">
  <h2 className="text-xl font-bold text-gray-900 mb-4">
    Новая функция
  </h2>
  {/* Ваш контент */}
</div>
```

### Добавление новых API endpoints

Создайте новый файл в `app/api/manager/`:

```typescript
// app/api/manager/new-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user || user.role !== 'manager') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Ваша логика
}
```

## Поддержка

При возникновении проблем:

1. Проверьте логи в консоли сервера
2. Проверьте настройки SMTP в `.env`
3. Убедитесь, что менеджер создан и назначен на филиал
4. Проверьте статус аккаунта в админ-панели
