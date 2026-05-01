# Чеклист настройки проекта Nur-Kitep

## ✅ Базовая настройка

- [x] База данных PostgreSQL настроена
- [x] Prisma схема создана
- [x] Миграции применены
- [x] Google OAuth настроен

## 📧 Настройка Email верификации

### Шаг 1: Установка зависимостей (✅ Выполнено)

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

### Шаг 2: Настройка Gmail SMTP

#### 2.1. Включите двухфакторную аутентификацию

1. Перейдите: https://myaccount.google.com/security
2. Найдите "2-Step Verification"
3. Включите двухфакторную аутентификацию

#### 2.2. Создайте App Password

1. Перейдите: https://myaccount.google.com/apppasswords
2. Выберите "Mail" → "Other (Custom name)"
3. Введите название: `Nur-Kitep`
4. Нажмите "Generate"
5. **Скопируйте 16-значный пароль** (уберите пробелы)

#### 2.3. Обновите .env файл

Откройте `.env` и замените:

```env
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

На ваши реальные данные:

```env
SMTP_USER="nurkitep.shop@gmail.com"
SMTP_PASS="abcdefghijklmnop"
```

#### 2.4. Перезапустите сервер

```bash
# Остановите сервер (Ctrl+C)
npm run dev
```

### Шаг 3: Тестирование

1. Откройте: http://localhost:3000/register
2. Заполните форму с **реальным email**
3. Нажмите "Зарегистрироваться"
4. Проверьте:
   - ✅ Консоль сервера: "✅ Email sent successfully"
   - ✅ Ваш почтовый ящик (проверьте "Спам")
5. Введите код на странице верификации
6. Вы должны быть перенаправлены в профиль

## 📚 Документация

- **GMAIL_SMTP_SETUP.md** - Подробная инструкция по настройке Gmail
- **EMAIL_VERIFICATION_SETUP.md** - Техническая документация системы
- **QUICK_START_VERIFICATION.md** - Быстрый старт и тестирование

## 🔍 Проверка настроек

### Проверка переменных окружения

Создайте файл `app/api/check-config/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    database: !!process.env.DATABASE_URL,
    jwt: !!process.env.JWT_SECRET,
    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    smtp: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
  });
}
```

Откройте: http://localhost:3000/api/check-config

Должно быть:
```json
{
  "database": true,
  "jwt": true,
  "google": true,
  "smtp": true
}
```

## 🚨 Возможные проблемы

### Email не отправляется

**Проверьте:**
1. ✅ Переменные `SMTP_USER` и `SMTP_PASS` установлены в `.env`
2. ✅ Используется App Password, а не обычный пароль
3. ✅ Сервер перезапущен после изменения `.env`
4. ✅ Двухфакторная аутентификация включена в Google

**Консоль сервера показывает:**
- ✅ "✅ Email sent successfully" - email отправлен
- ⚠️ "⚠️ SMTP credentials not configured" - SMTP не настроен
- ❌ "❌ Error sending verification email" - ошибка отправки

### Email в папке "Спам"

1. Проверьте папку "Спам"
2. Отметьте письмо как "Не спам"
3. Добавьте отправителя в контакты

### "Invalid login: 535-5.7.8"

**Причина:** Используется обычный пароль вместо App Password

**Решение:**
1. Создайте новый App Password
2. Обновите `SMTP_PASS` в `.env`
3. Перезапустите сервер

## 🎯 Режимы работы

### Development Mode (без SMTP)
- Коды выводятся в консоль
- Email не отправляются
- Удобно для тестирования

### Production Mode (с SMTP)
- Email отправляются реально
- Красивый HTML шаблон
- Логирование в консоль

## 📦 Структура проекта

```
├── app/
│   ├── (auth)/
│   │   ├── register/page.tsx          # Форма регистрации
│   │   └── verify-email/page.tsx      # Ввод кода верификации
│   └── api/
│       └── auth/
│           ├── register/route.ts      # API регистрации
│           ├── verify-email/route.ts  # API верификации
│           └── resend-code/route.ts   # API повторной отправки
├── lib/
│   └── email.ts                       # Gmail SMTP + HTML шаблон
├── prisma/
│   └── schema.prisma                  # Модели User + EmailVerification
└── .env                               # Конфигурация (не коммитить!)
```

## 🔐 Безопасность

- ✅ Коды действительны 10 минут
- ✅ Одноразовое использование
- ✅ Rate limiting (1 запрос/минута)
- ✅ Валидация на сервере
- ✅ App Password вместо обычного пароля
- ⚠️ Никогда не коммитьте `.env` в Git

## 🚀 Готово к продакшену

Перед деплоем:

1. ✅ Настройте SMTP (Gmail или другой провайдер)
2. ✅ Обновите переменные окружения на сервере
3. ✅ Проверьте, что email не попадают в спам
4. ✅ Настройте мониторинг отправки email
5. ✅ Добавьте логирование ошибок

## 📞 Поддержка

Если что-то не работает:

1. Проверьте консоль сервера
2. Проверьте консоль браузера (F12)
3. Прочитайте `GMAIL_SMTP_SETUP.md`
4. Проверьте все переменные в `.env`
