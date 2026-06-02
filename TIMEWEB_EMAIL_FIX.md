# Исправление: Email не отправляется на Timeweb

## Проблема
На локальном сервере email приходит на почту, но на Timeweb код попадает только в логи.

## Причина
SMTP переменные окружения (`SMTP_USER` и/или `SMTP_PASS`) не загружены на production, поэтому срабатывает fallback режим.

## Диагностика

### Шаг 1: Проверьте конфигурацию
Откройте в браузере:
```
https://nursezim08-kitep-world-31f1.twc1.net/api/debug/config?secret=debug123
```

Посмотрите на секцию `smtp`:
```json
"smtp": {
  "configured": false,  // ← Должно быть true!
  "user": "NOT SET",    // ← Должен быть email
  "pass": "NOT SET",    // ← Должен быть ****xxxx
  "passLength": 0       // ← Должно быть ~16
}
```

Если `"configured": false` - переменные не загружены!

### Шаг 2: Добавьте переменные в Timeweb

#### Через панель управления Timeweb:

1. **Войдите в панель Timeweb**
2. **Найдите ваше приложение**
3. **Откройте раздел "Переменные окружения"** или "Environment Variables"
4. **Добавьте переменные:**

```
Имя: SMTP_USER
Значение: nursezim416@gmail.com
```

```
Имя: SMTP_PASS
Значение: mjaf ndbg eavp eriz
```

⚠️ **ВАЖНО:** 
- Убедитесь что нет лишних пробелов!
- Копируйте пароль точно как есть (с пробелами между группами)
- Пароль должен быть App Password из Gmail (16 символов)

5. **Сохраните изменения**
6. **Перезапустите приложение**

#### Если используете файл .env на сервере:

```bash
# Подключитесь по SSH
ssh user@your-server

# Перейдите в папку проекта
cd /path/to/your/project

# Отредактируйте .env
nano .env

# Добавьте строки:
SMTP_USER="nursezim416@gmail.com"
SMTP_PASS="mjaf ndbg eavp eriz"

# Сохраните (Ctrl+O, Enter, Ctrl+X)

# Перезапустите приложение
pm2 restart all
# или
npm start
```

### Шаг 3: Проверьте после добавления

1. **Подождите 1-2 минуты** (пока Timeweb применит изменения)

2. **Проверьте конфигурацию снова:**
   ```
   https://nursezim08-kitep-world-31f1.twc1.net/api/debug/config?secret=debug123
   ```

   Должно быть:
   ```json
   "smtp": {
     "configured": true,          // ✅
     "user": "nursezim416@gmail.com",  // ✅
     "pass": "****eriz",          // ✅
     "passLength": 19             // ✅
   }
   ```

3. **Проверьте отправку email:**
   ```
   https://nursezim08-kitep-world-31f1.twc1.net/api/test/email?email=nursezim416@gmail.com&type=manager&secret=test123
   ```

   Должен вернуться:
   ```json
   {
     "success": true,
     "message": "Email sent successfully! Check your inbox.",
     ...
   }
   ```

4. **Проверьте почту** - должно прийти письмо с кодом 123456

5. **Реальный тест:**
   - Откройте `/manager/login`
   - Войдите с реальными данными
   - Проверьте почту менеджера

## Возможные проблемы

### Проблема 1: "configured": true, но email не приходит

**Причина:** Gmail блокирует отправку с нового IP (Timeweb)

**Решение 1:** Проверьте Gmail безопасность
1. Зайдите в https://myaccount.google.com/security
2. Откройте "Недавние события безопасности"
3. Найдите попытку входа с нового устройства
4. Разрешите доступ

**Решение 2:** Создайте новый App Password
1. Откройте https://myaccount.google.com/apppasswords
2. Создайте новый пароль приложения
3. Скопируйте новый пароль (16 символов с пробелами)
4. Обновите `SMTP_PASS` в Timeweb
5. Перезапустите приложение

**Решение 3:** Попробуйте порт 465 (SSL)
Отредактируйте `lib/email.ts`:
```typescript
function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,        // Вместо 587
    secure: true,     // Вместо false
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });
}
```

### Проблема 2: passLength = 19, но должно быть ~16

**Причина:** App Password имеет пробелы, они тоже считаются

**Это нормально!** Gmail App Password: `mjaf ndbg eavp eriz`
- Без пробелов: 16 символов
- С пробелами: 19 символов

Nodemailer автоматически обработает пробелы.

### Проблема 3: Variables не применяются

**Решение:**
1. Проверьте формат имён переменных (без префиксов)
2. Убедитесь что нет опечаток: `SMTP_USER` (не `SMTP_USERNAME`)
3. Перезапустите приложение через панель
4. Подождите 2-3 минуты
5. Проверьте через `/api/debug/config`

### Проблема 4: Timeweb блокирует SMTP порты

**Решение:** Используйте внешний сервис email

#### Вариант А: Resend.com (рекомендуется)

1. Зарегистрируйтесь на https://resend.com
2. Получите API ключ
3. Установите пакет:
   ```bash
   npm install resend
   ```

4. Создайте новый файл `lib/email-resend.ts`:
   ```typescript
   import { Resend } from 'resend';
   
   const resend = new Resend(process.env.RESEND_API_KEY);
   
   export async function sendManagerLoginEmail(email: string, code: string) {
     try {
       await resend.emails.send({
         from: 'noreply@yourdomain.com',
         to: email,
         subject: 'Код входа для менеджера Nur-Kitep',
         html: getManagerLoginEmailTemplate(code),
       });
       return true;
     } catch (error) {
       console.error('Resend error:', error);
       return false;
     }
   }
   ```

5. Обновите импорты в API routes

#### Вариант Б: SendGrid

1. Зарегистрируйтесь на https://sendgrid.com
2. Получите API ключ
3. Установите пакет:
   ```bash
   npm install @sendgrid/mail
   ```

4. Аналогично создайте wrapper функцию

## После успешного исправления

### 1. Удалите debug endpoint:
```bash
rm app/api/debug/config/route.ts
git add .
git commit -m "Remove debug config endpoint"
git push origin main
```

### 2. Удалите test endpoint:
```bash
rm app/api/test/email/route.ts
git add .
git commit -m "Remove test email endpoint"
git push origin main
```

### 3. Проверьте что всё работает:
- ✅ Вход менеджера
- ✅ Регистрация пользователя
- ✅ Сброс пароля
- ✅ Верификация email

## Мониторинг

После исправления следите за:
- Логами отправки email в Timeweb
- Успешностью доставки писем
- Gmail не блокирует аккаунт

## Контрольный чеклист

- [ ] Переменные `SMTP_USER` и `SMTP_PASS` добавлены в Timeweb
- [ ] Приложение перезапущено
- [ ] `/api/debug/config` показывает `"configured": true`
- [ ] `/api/test/email` успешно отправляет email
- [ ] Реальный вход менеджера работает
- [ ] Email приходит на почту (не в логи)
- [ ] Debug и test endpoints удалены после проверки

## Готово! ✅

Email должен работать на production.
