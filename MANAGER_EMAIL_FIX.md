# Исправление отправки email для входа менеджера

## Что было исправлено

✅ Код входа менеджера теперь отправляется ТОЛЬКО на email (не в логи)
✅ Добавлена детальная диагностика проблем с отправкой
✅ API возвращает ошибку если email не отправлен
✅ Убран небезопасный fallback вывод кода в консоль

## Быстрая проверка

### 1. Проверьте настройки SMTP в .env

```env
SMTP_USER="nursezim416@gmail.com"
SMTP_PASS="mjaf ndbg eavp eriz"
```

**Важно:** Для Gmail нужен App Password, а не обычный пароль!

### 2. Запустите приложение

```bash
npm run dev
```

### 3. Попробуйте войти как менеджер

Используйте тестового менеджера из базы данных.

### 4. Проверьте логи

**Успешная отправка:**
```
📧 [Manager Login Email] Starting email send...
📧 [Manager Login Email] To: manager@example.com
📧 [Manager Login Email] SMTP User: nursezim416@gmail.com
📧 [Manager Login Email] Creating transporter...
📧 [Manager Login Email] Transporter created successfully
📧 [Manager Login Email] Mail options configured, sending...
✅ Manager login email sent successfully!
📧 Message ID: <xxx@gmail.com>
```

**Если письмо не отправляется:**
```
❌ Error sending manager login email:
Error type: Error
Error message: Invalid login
```

## Частые проблемы

### 1. "Invalid login: 535-5.7.8 Username and Password not accepted"

**Причина:** Неверный App Password для Gmail

**Решение:**
1. Перейдите: https://myaccount.google.com/apppasswords
2. Создайте новый App Password для "Mail"
3. Скопируйте пароль (формат: `xxxx xxxx xxxx xxxx`)
4. Обновите `SMTP_PASS` в `.env`
5. Перезапустите приложение

### 2. "connect ETIMEDOUT" или "connect ECONNREFUSED"

**Причина:** Хостинг Timeweb блокирует порт 587

**Решение:**
1. Свяжитесь с поддержкой Timeweb
2. Запросите разблокировку порта 587 для SMTP
3. Или используйте альтернативный сервис (SendGrid, Mailgun)

### 3. "Email timeout after 20 seconds"

**Причина:** Медленное соединение или файрвол

**Решение:**
1. Проверьте интернет-соединение сервера
2. Убедитесь, что порт 587 не заблокирован файрволом
3. Попробуйте использовать порт 465 (SSL):
```typescript
// В lib/email.ts, функция createTransporter()
port: 465,
secure: true,
```

## Проверка на production (Timeweb)

### Проверка переменных окружения

Убедитесь, что переменные установлены на сервере:
```bash
echo $SMTP_USER
echo $SMTP_PASS
```

### Проверка логов Docker

```bash
docker logs <container-id> | grep "Manager Login Email"
```

### Проверка портов

Проверьте, что порт 587 не заблокирован:
```bash
telnet smtp.gmail.com 587
```

## Альтернативные решения

Если Gmail не работает на хостинге, используйте:

### SendGrid (рекомендуется)
- ✅ Бесплатный план: 100 писем/день
- ✅ Надежная доставка
- ✅ Не блокируется хостингами
- 🔗 https://sendgrid.com/

### Mailgun
- ✅ Бесплатный план: 5000 писем/месяц
- ✅ SMTP и API
- 🔗 https://www.mailgun.com/

## Документация

Подробная инструкция по устранению проблем: `EMAIL_TROUBLESHOOTING.md`

## Контакты поддержки

Если проблема не решается:
- 📧 Email: support@nur-kitep.kg
- 📱 Telegram: @nur_kitep_support
- 🌐 Timeweb Support: https://timeweb.com/ru/help/
