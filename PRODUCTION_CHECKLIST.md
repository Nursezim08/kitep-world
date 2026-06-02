# Чеклист для Production (Timeweb)

## 1. Переменные окружения на Timeweb

Убедитесь, что следующие переменные настроены в панели Timeweb:

### Обязательные переменные:
```env
# Database (ваша production БД)
DATABASE_URL="postgresql://..."

# JWT Secret (используйте другой в production!)
JWT_SECRET="другой-секретный-ключ-для-production"

# SMTP Settings
SMTP_USER="nursezim416@gmail.com"
SMTP_PASS="mjaf ndbg eavp eriz"

# S3
S3_URL="https://s3.twcstorage.ru"
BUCKET_NAME="nur-kitep"
S3_ACCESS_KEY="PDWGHDSN3439V5P7UESV"
S3_SECRET_ACCESS_KEY="J9T6ks1NPsfJlRr1fVHaIrbkPXg0SALFPSWSihrq"

# OpenAI
OPENAI_API_KEY="sk-proj-..."

# Finik
FINIK_ENV="prod"
FINIK_API_KEY="..."
FINIK_ACCOUNT_ID="..."
FINIK_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----"

# Telegram
TELEGRAM_BOT_TOKEN="8702705019:AAEYsoOu1wGe8PdTLhxBPH7DqCpnIo-jajM"
TELEGRAM_ADMIN_USER_ID="1434922404"

# Google OAuth (опционально)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Google Maps (опционально)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="..."

# Next.js (должен быть ваш домен!)
NEXT_PUBLIC_APP_URL="https://nursezim08-kitep-world-31f1.twc1.net/"
```

## 2. Проверка SMTP на production

### Способ 1: Через логи сервера
После деплоя попробуйте войти как менеджер и проверьте логи:
- Должно быть: `✅ Manager login email sent successfully`
- Если ошибка: проверьте код в логах (fallback режим)

### Способ 2: Создать тестовую страницу
Создайте endpoint для теста SMTP на production:

```typescript
// app/api/test/email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sendManagerLoginEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');
  
  if (!email) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
  }

  const code = "123456";
  const sent = await sendManagerLoginEmail(email, code);

  return NextResponse.json({
    success: sent,
    message: sent ? 'Email sent successfully' : 'Failed to send email (check logs)',
    timestamp: new Date().toISOString(),
  });
}
```

Затем откройте: `https://ваш-домен.ru/api/test/email?email=nursezim416@gmail.com`

## 3. Возможные проблемы на Timeweb

### Проблема 1: Gmail блокирует доступ
**Решение:**
- Проверьте письма безопасности от Google
- Убедитесь что App Password активен
- Проверьте "Небезопасные приложения" в настройках Gmail

### Проблема 2: Таймауты на Timeweb
**Решение:**
- Наши таймауты (7 секунд) должны работать
- Проверьте логи Timeweb на ошибки
- Возможно нужно увеличить таймаут до 10 секунд

### Проблема 3: Порты заблокированы
**Решение:**
- Timeweb может блокировать порт 587
- Попробуйте порт 465 (SSL):
  ```typescript
  {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL
    auth: { ... }
  }
  ```

### Проблема 4: Переменные окружения не загружены
**Решение:**
- Проверьте что все переменные добавлены в панели Timeweb
- Перезапустите приложение после добавления переменных

## 4. Тестирование на production

1. **Вход менеджера:**
   - Перейдите: `https://ваш-домен.ru/manager/login`
   - Введите email и пароль менеджера
   - Должно быть перенаправление на `/manager/verify`
   - Проверьте почту менеджера

2. **Регистрация пользователя:**
   - Перейдите: `https://ваш-домен.ru/register`
   - Зарегистрируйтесь
   - Проверьте почту для верификации

3. **Сброс пароля:**
   - Перейдите: `https://ваш-домен.ru/forgot-password`
   - Введите email
   - Проверьте почту

## 5. Мониторинг

После деплоя следите за:
- Логами Timeweb
- Временем отклика (должно быть < 7 секунд)
- Успешной доставкой email

## 6. Безопасность

⚠️ **ВАЖНО:**
- Измените `JWT_SECRET` на production
- Не коммитьте `.env` в git
- Проверьте что SMTP пароль не виден в логах
- Используйте HTTPS (должен быть включен на Timeweb)

## 7. Альтернативные решения

Если Gmail не работает на production:

### Вариант 1: Resend.com (рекомендуется)
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@yourdomain.com',
  to: email,
  subject: 'Код входа',
  html: template,
});
```

### Вариант 2: SendGrid
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  from: 'noreply@yourdomain.com',
  to: email,
  subject: 'Код входа',
  html: template,
});
```

### Вариант 3: Яндекс.Почта (для .ru доменов)
```typescript
{
  host: 'smtp.yandex.ru',
  port: 465,
  secure: true,
  auth: {
    user: process.env.YANDEX_USER,
    pass: process.env.YANDEX_PASS,
  }
}
```

## Проверка деплоя

После загрузки на Timeweb выполните:

1. ✅ Открыть сайт
2. ✅ Проверить логи
3. ✅ Войти как менеджер
4. ✅ Проверить email
5. ✅ Проверить все функции

Если возникнут проблемы, проверьте логи в панели Timeweb!
