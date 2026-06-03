# Устранение проблем с отправкой email

## Проблема: Код не приходит на почту менеджера

### Диагностика

Запустите приложение и попробуйте войти как менеджер. Проверьте логи в консоли:

```bash
npm run dev
```

### Возможные причины и решения

#### 1. SMTP учетные данные не настроены

**Симптомы:**
```
❌ SMTP credentials not configured!
SMTP_USER: NOT SET
SMTP_PASS: NOT SET
```

**Решение:**
Проверьте файл `.env` - должны быть заполнены:
```env
SMTP_USER="nursezim416@gmail.com"
SMTP_PASS="mjaf ndbg eavp eriz"
```

#### 2. Неверный App Password для Gmail

**Симптомы:**
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Решение:**
1. Перейдите на https://myaccount.google.com/apppasswords
2. Создайте новый App Password для "Mail"
3. Скопируйте пароль (формат: `xxxx xxxx xxxx xxxx`)
4. Обновите `SMTP_PASS` в файле `.env`
5. Перезапустите приложение

#### 3. Двухфакторная аутентификация не включена

**Симптомы:**
```
Error: Invalid login: 534-5.7.9 Application-specific password required
```

**Решение:**
1. Включите двухфакторную аутентификацию: https://myaccount.google.com/security
2. Создайте App Password (см. пункт 2)

#### 4. Блокировка SMTP со стороны хостинга

**Симптомы:**
```
Error: connect ETIMEDOUT
Error: connect ECONNREFUSED
```

**Решение:**
1. Свяжитесь с поддержкой Timeweb
2. Запросите разблокировку порта 587 (STARTTLS)
3. Или используйте альтернативный SMTP (например, SendGrid, Mailgun)

#### 5. Таймаут соединения

**Симптомы:**
```
Error: Email timeout after 20 seconds
```

**Решение:**
1. Проверьте интернет-соединение сервера
2. Убедитесь, что порт 587 не заблокирован файрволом
3. Попробуйте использовать порт 465 (SSL):
```typescript
// В lib/email.ts
port: 465,
secure: true, // true для SSL
```

### Проверка отправки email

После настройки попробуйте войти как менеджер и проверьте логи:

**Успешная отправка:**
```
📧 [Manager Login Email] Starting email send...
📧 [Manager Login Email] To: manager@example.com
📧 [Manager Login Email] Creating transporter...
📧 [Manager Login Email] Transporter created successfully
📧 [Manager Login Email] Mail options configured, sending...
✅ Manager login email sent successfully!
📧 Message ID: <xxx@gmail.com>
```

**Неудачная отправка:**
```
❌ Error sending manager login email:
Error type: Error
Error message: Invalid login
```

### Альтернативные решения

#### Использование SendGrid

1. Зарегистрируйтесь на https://sendgrid.com/
2. Получите API ключ
3. Установите: `npm install @sendgrid/mail`
4. Обновите `lib/email.ts`:

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendManagerLoginEmail(email: string, code: string) {
  const msg = {
    to: email,
    from: 'noreply@nur-kitep.kg',
    subject: 'Код входа для менеджера Nur-Kitep',
    html: getManagerLoginEmailTemplate(code),
  };
  
  await sgMail.send(msg);
}
```

#### Использование Mailgun

1. Зарегистрируйтесь на https://www.mailgun.com/
2. Получите SMTP учетные данные
3. Обновите `.env`:

```env
SMTP_USER="postmaster@your-domain.mailgun.org"
SMTP_PASS="your-mailgun-password"
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
```

### Проверка на production (Timeweb)

1. Убедитесь, что переменные окружения установлены на сервере
2. Проверьте логи: `docker logs <container-id>`
3. Проверьте, что порт 587 не заблокирован
4. Свяжитесь с поддержкой Timeweb если проблема сохраняется

### Контакты

Если проблема не решается:
1. Соберите логи ошибок
2. Отправьте их в поддержку: support@nur-kitep.kg
3. Укажите время попытки входа и email менеджера

## Тестовый скрипт

Для быстрой проверки отправки email используйте тестовый скрипт:

```bash
node scripts/test-manager-email.mjs manager@example.com
```

Скрипт:
- ✅ Проверит настройки SMTP
- ✅ Создаст SMTP транспорт
- ✅ Отправит тестовое письмо с кодом
- ✅ Покажет детальные логи
- ✅ Предложит решения при ошибках

**Пример успешной отправки:**
```
🧪 Начало тестирования отправки email...
📋 Проверка конфигурации:
  SMTP_USER: nursezim416@gmail.com
  SMTP_PASS: ✅ Настроен
📧 Создание SMTP транспорта...
✅ Транспорт создан
🔢 Сгенерирован тестовый код: 123456
📨 Отправка письма на: manager@example.com
⏳ Ожидание (максимум 20 секунд)...
✅ УСПЕХ! Письмо отправлено!
📊 Детали отправки:
  Message ID: <xxx@gmail.com>
✨ Проверьте почтовый ящик: manager@example.com
```
