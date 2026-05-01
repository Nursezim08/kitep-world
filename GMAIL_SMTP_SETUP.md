# Настройка Gmail SMTP для отправки email

## Обзор

Для отправки email через Gmail SMTP необходимо использовать **App Password** (пароль приложения), а не обычный пароль от аккаунта Google.

## Шаг 1: Включите двухфакторную аутентификацию

App Passwords доступны только при включенной двухфакторной аутентификации.

1. Перейдите на страницу: https://myaccount.google.com/security
2. В разделе "Signing in to Google" найдите "2-Step Verification"
3. Нажмите на "2-Step Verification" и следуйте инструкциям для включения

## Шаг 2: Создайте App Password

1. Перейдите на страницу: https://myaccount.google.com/apppasswords
   - Или: Google Account → Security → 2-Step Verification → App passwords

2. Возможно потребуется повторно войти в аккаунт

3. В поле "Select app" выберите "Mail" или "Other (Custom name)"
   - Если выбрали "Other", введите название: `Nur-Kitep`

4. В поле "Select device" выберите "Other (Custom name)"
   - Введите название: `Nur-Kitep Server`

5. Нажмите "Generate"

6. Google покажет 16-значный пароль приложения (например: `abcd efgh ijkl mnop`)
   - **ВАЖНО:** Скопируйте этот пароль сразу, он больше не будет показан!
   - Уберите пробелы: `abcdefghijklmnop`

## Шаг 3: Обновите .env файл

Откройте файл `.env` в корне проекта и обновите следующие переменные:

```env
# SMTP Settings (Gmail)
SMTP_USER="your-email@gmail.com"          # Ваш Gmail адрес
SMTP_PASS="abcdefghijklmnop"              # App Password (без пробелов)
```

### Пример:

```env
SMTP_USER="nurkitep.shop@gmail.com"
SMTP_PASS="xyzw abcd efgh ijkl"
```

## Шаг 4: Перезапустите сервер

После обновления `.env` файла перезапустите сервер разработки:

```bash
# Остановите текущий сервер (Ctrl+C)
# Запустите снова
npm run dev
```

## Шаг 5: Протестируйте отправку email

1. Перейдите на http://localhost:3000/register
2. Заполните форму регистрации с **реальным email адресом**
3. Нажмите "Зарегистрироваться"
4. Проверьте:
   - Консоль сервера на наличие сообщения "✅ Email sent successfully"
   - Ваш почтовый ящик (включая папку "Спам")

## Возможные проблемы и решения

### ❌ "Invalid login: 535-5.7.8 Username and Password not accepted"

**Причина:** Используется обычный пароль вместо App Password

**Решение:**
1. Убедитесь, что включена двухфакторная аутентификация
2. Создайте новый App Password
3. Используйте App Password в `.env` файле

### ❌ "Error: Missing credentials for 'PLAIN'"

**Причина:** Переменные `SMTP_USER` или `SMTP_PASS` не установлены

**Решение:**
1. Проверьте, что переменные добавлены в `.env`
2. Перезапустите сервер после изменения `.env`

### ❌ Email не приходит

**Возможные причины:**

1. **Email в папке "Спам"**
   - Проверьте папку "Спам" в почтовом ящике
   - Отметьте письмо как "Не спам"

2. **Лимиты Gmail**
   - Gmail имеет лимит: 500 писем в день для бесплатных аккаунтов
   - 2000 писем в день для Google Workspace

3. **Блокировка Gmail**
   - Если отправляете много писем быстро, Gmail может временно заблокировать
   - Подождите несколько минут и попробуйте снова

### ⚠️ "Less secure app access"

**Примечание:** Google больше не поддерживает "Less secure app access". Используйте только App Passwords.

## Режим разработки (Fallback)

Если SMTP не настроен, система автоматически переключится в режим разработки:
- Коды верификации будут выводиться в консоль сервера
- Email не будут отправляться
- Это удобно для тестирования без настройки SMTP

## Альтернативные SMTP провайдеры

Если Gmail не подходит, можно использовать:

### 1. **Mailgun** (Рекомендуется для продакшена)
```env
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_USER="postmaster@your-domain.mailgun.org"
SMTP_PASS="your-mailgun-password"
```

### 2. **SendGrid**
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
```

### 3. **Outlook/Hotmail**
```env
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_USER="your-email@outlook.com"
SMTP_PASS="your-password"
```

### 4. **Mail.ru**
```env
SMTP_HOST="smtp.mail.ru"
SMTP_PORT="587"
SMTP_USER="your-email@mail.ru"
SMTP_PASS="your-password"
```

## Безопасность

### ⚠️ Важные правила:

1. **Никогда не коммитьте .env файл в Git**
   - Файл `.env` уже добавлен в `.gitignore`
   - Проверьте перед каждым коммитом

2. **Используйте разные пароли для разработки и продакшена**

3. **Регулярно обновляйте App Passwords**

4. **Для продакшена используйте переменные окружения сервера**
   - Vercel: Settings → Environment Variables
   - Heroku: Config Vars
   - AWS: Systems Manager Parameter Store

## Проверка настроек

### Проверка переменных окружения:

Создайте временный API endpoint для проверки (удалите после проверки):

```typescript
// app/api/test-smtp/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    smtpConfigured: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
    smtpUser: process.env.SMTP_USER ? '✅ Set' : '❌ Not set',
    smtpPass: process.env.SMTP_PASS ? '✅ Set' : '❌ Not set',
  });
}
```

Перейдите на: http://localhost:3000/api/test-smtp

## Мониторинг отправки

В консоли сервера вы увидите:

### ✅ Успешная отправка:
```
✅ Email sent successfully: <message-id@gmail.com>
📧 To: user@example.com
```

### ❌ Ошибка отправки:
```
❌ Error sending verification email: [error details]
==================================================
📧 EMAIL VERIFICATION CODE (Fallback)
==================================================
To: user@example.com
Code: 123456
==================================================
```

## Дополнительные ресурсы

- [Google App Passwords](https://support.google.com/accounts/answer/185833)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail Sending Limits](https://support.google.com/a/answer/166852)

## Поддержка

Если возникли проблемы:
1. Проверьте консоль сервера на наличие ошибок
2. Убедитесь, что App Password создан правильно
3. Проверьте, что переменные в `.env` установлены корректно
4. Перезапустите сервер после изменения `.env`
