# Деплой на Timeweb - Инструкция

## Шаг 1: Подготовка к деплою

### 1.1. Проверьте файлы
```bash
# Убедитесь что все изменения закоммичены
git status

# Если есть изменения - закоммитьте
git add .
git commit -m "Fix: SMTP timeouts for email delivery"
git push
```

### 1.2. Проверьте package.json
Убедитесь что есть build скрипты:
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "dev": "next dev"
  }
}
```

## Шаг 2: Загрузка на Timeweb

### Через Git (рекомендуется):
1. Зайдите в панель Timeweb
2. Найдите раздел с вашим приложением
3. Обновите код через Git pull
4. Или загрузите через FTP/панель управления

### Через панель Timeweb:
1. Зайдите в панель управления
2. Загрузите файлы проекта
3. Убедитесь что `.next` папка пересоздастся при билде

## Шаг 3: Настройка переменных окружения

### В панели Timeweb добавьте переменные:

```env
# 1. База данных (обязательно!)
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"

# 2. JWT Secret (измените для production!)
JWT_SECRET="НОВЫЙ-СЕКРЕТНЫЙ-КЛЮЧ-ДЛЯ-PRODUCTION-МИНИМУМ-32-СИМВОЛА"

# 3. SMTP (копируйте из локального .env)
SMTP_USER="nursezim416@gmail.com"
SMTP_PASS="mjaf ndbg eavp eriz"

# 4. S3
S3_URL="https://s3.twcstorage.ru"
BUCKET_NAME="nur-kitep"
S3_ACCESS_KEY="PDWGHDSN3439V5P7UESV"
S3_SECRET_ACCESS_KEY="J9T6ks1NPsfJlRr1fVHaIrbkPXg0SALFPSWSihrq"

# 5. OpenAI
OPENAI_API_KEY="sk-proj-ваш-ключ-openai"

# 6. Finik
FINIK_ENV="prod"
FINIK_API_KEY="maVcCLpRnC8O7JBOdiD9yiEJptleypM4GDriQfgj"
FINIK_ACCOUNT_ID="26d32b48-24da-4807-bff9-457cae8b3e38"
FINIK_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCk1nR1dq2RTOSd
B87iJhpZQz1xTcdQFXZF3poIIvquvHQHGPyKMfMzbu2WDNW4+XMkXHOnRZNYRYUJ
yaxslyp+oqBqZxI6ayDEdIXU+fwSnjU0Bv+FCSIPMGG+DVlqrVsbZP/30b47G05C
Xn2oNdEWM6ZRNaY8FxFTMjapc2sdB4WEfVOikRAKWWuV48yQZied7c+ZHo2e0MVQ
43fuQ3j2S9W3pYT1At7GcrQJvMOPbs/Jw5jhzp30EKuEkSszWYsMKPYEsn0z+FPn
GeIgaGVw4BzPEchw3vGo4wRF9Czk9zHVa266Hnv0R6biVpGd7BisPQl9O/rqLvX7
G1Bje94NAgMBAAECggEACsody92FjWv4z92FuXBQi7S2xh6W9AM/n2Grd+pgOcVM
m/VS/HG6D00MwKRc7fNoCcKCcHnBpAbC50nb3yzC45CeCvDttMSz26Ab7X2idg6E
gYAOxCS9pbxfPXsuteicfM3O4mgIeWJ3bCk2tOa25ariUVD/bVH+OJGiGdPb+EWd
nuCdOZaWExQgabA7oJjTAP9LG7TrDDKlYnRkvibIwa9Qt6RipKyuVUnpMB77mlEL
ndu+ej0rItWR9+xwceJM5iPLQmraxzJ38b3+qFNPUz/GgTPxYKMylpQCIebYF+nZ
aGLdFKD2YZyti4tur3DDK4LHuXEwo2ydaOiMsSb+YQKBgQDQM9C8P0/SnmE5pdei
u0xIEPlgHJbMfmc4iPkBet2Bv235y9+sJBDDJvQFPvdIEUL0h0BLYUFyts4D02oB
1nSBAahEDuzNuSKN0O5WlNrzOHiZkOFu35WoC6zO42t2fykfuCB8tufJ+jg8rpvL
s3Xrj+rQRb58JTafXcl9dCgHrQKBgQDKrhHfTS+BkC540LkmCcTfP3nlqX7VGLtz
rkDGHfgH7P85c9hy/Q7AodKXGS1OqE84G7dWCXjPwQuGb/JAL1x+948CPjakgtT9
UfSPAJEAvaCnPpR0FtbX2mADxMs5E0KOaGj62GC45RhXlZ3JQB3JrBYdVZKWFNkE
isrUCrF74QKBgBe8AGylTwU0luLKfBWKAn0oqjUBrVMsibnRK4m2pu+2kePrENl/
1wVYOHMspWXqydY0YOj28k4QdtXK0QfambdnJ/ZyOR6On1jJW5I1L+yQIHdpI7nO
9TGN+youlL6Sam66P8HX2/6TbrvEL/B9ydCLvHn3qWpfl6V9PI33ouSVAoGAf8uw
Mzes66no037wL17bhtS0XK457c2xbGiEKSd+XCkAaM51vVN4uNeQPHvAiKcxhDRd
rl88kOqtBLCTdAso7FnWD1kBBUwFVlEVvhFiXLA0mx+nZWd9Qg9MmTO93Bgb0EVf
ZEOJASxa4+bP3bSS07WxH//z9LPifq2w5HB1pqECgYEAtaijXGjulRVgsrOAOOSS
5OmTrPKr4DN6SPk+fsifwxnTnDM67G7qnDETt9TmiRBPbMOSTm6xc4MQSyWOGsxX
Ui9ljmPpIoVh/WRFO7NRWFXnxGGsRkxAjaBF+3RodrifTlcM7badDTbZL6O3EExe
zQyBxT4mIPjnSgzERxSo1Lk=
-----END PRIVATE KEY-----"

# 7. Telegram
TELEGRAM_BOT_TOKEN="8702705019:AAEYsoOu1wGe8PdTLhxBPH7DqCpnIo-jajM"
TELEGRAM_ADMIN_USER_ID="1434922404"

# 8. URL (ваш домен!)
NEXT_PUBLIC_APP_URL="https://nursezim08-kitep-world-31f1.twc1.net/"
```

⚠️ **ВАЖНО:** 
- Для многострочных переменных (FINIK_PRIVATE_KEY) Timeweb может требовать экранирование
- Если не работает, попробуйте сделать одной строкой с `\n`

## Шаг 4: Билд и запуск

### Через SSH (если есть доступ):
```bash
# 1. Зайдите по SSH
ssh user@your-server

# 2. Перейдите в папку проекта
cd /path/to/your/project

# 3. Установите зависимости
npm install

# 4. Запустите миграции БД
npx prisma migrate deploy

# 5. Билд проекта
npm run build

# 6. Запуск
npm start
```

### Через панель Timeweb:
1. Найдите раздел "Команды" или "Скрипты"
2. Запустите `npm install`
3. Запустите `npm run build`
4. Перезапустите приложение

## Шаг 5: Проверка email на production

### 5.1. Тест через API endpoint
Откройте в браузере:
```
https://nursezim08-kitep-world-31f1.twc1.net/api/test/email?email=nursezim416@gmail.com&type=manager&secret=test123
```

Должен вернуться JSON:
```json
{
  "success": true,
  "message": "Email sent successfully! Check your inbox.",
  "email": "nursezim416@gmail.com",
  "type": "manager",
  "code": "123456",
  "timestamp": "2026-05-10T...",
  "environment": {
    "smtp_configured": true,
    "smtp_user": "nursezim416@gmail.com"
  }
}
```

### 5.2. Проверьте почту
- Должно прийти письмо с кодом 123456
- Если не пришло - проверьте спам
- Если не пришло - проверьте логи Timeweb

### 5.3. Реальный тест входа менеджера
1. Откройте: `https://nursezim08-kitep-world-31f1.twc1.net/manager/login`
2. Введите email и пароль менеджера
3. Нажмите "Войти"
4. Проверьте почту менеджера
5. Введите код на странице верификации

## Шаг 6: Проверка логов

### В панели Timeweb:
1. Найдите раздел "Логи" или "Журналы"
2. Смотрите на:
   - `✅ Manager login email sent successfully` - успех
   - `❌ Error sending manager login email` - ошибка
   - `📧 MANAGER LOGIN CODE (Fallback)` - код в консоли (если email не отправлен)

## Возможные проблемы

### Проблема 1: "Invalid login credentials" в логах
**Причина:** Gmail блокирует App Password с нового IP

**Решение:**
1. Зайдите в Gmail → Безопасность
2. Проверьте "Недавние события безопасности"
3. Разрешите доступ с нового устройства
4. Или создайте новый App Password

### Проблема 2: Таймаут при отправке
**Причина:** Timeweb блокирует порт 587

**Решение:** Измените в `lib/email.ts`:
```typescript
{
  host: 'smtp.gmail.com',
  port: 465,        // Вместо 587
  secure: true,     // Вместо false
  auth: { ... }
}
```

### Проблема 3: Переменные окружения не загружаются
**Причина:** Неправильный формат в панели Timeweb

**Решение:**
- Убедитесь что нет лишних пробелов
- Многострочные переменные (FINIK_PRIVATE_KEY) экранируйте с `\n`
- Перезапустите приложение после добавления переменных

### Проблема 4: "SMTP not configured" в ответе API
**Причина:** `SMTP_USER` или `SMTP_PASS` не добавлены

**Решение:**
1. Проверьте переменные в панели Timeweb
2. Перезапустите приложение
3. Проверьте ещё раз через `/api/test/email`

## Шаг 7: После успешного теста

⚠️ **Удалите тестовый endpoint:**
```bash
# Удалите файл
rm app/api/test/email/route.ts

# Закоммитьте
git add .
git commit -m "Remove test email endpoint"
git push
```

Или защитите его паролем в production!

## Мониторинг

### Проверяйте регулярно:
- ✅ Логи отправки email
- ✅ Время отклика (< 7 секунд)
- ✅ Успешность доставки
- ✅ Gmail не блокирует аккаунт

### Альтернатива Gmail для production:
Если Gmail не подходит, рекомендую **Resend.com**:
- Бесплатно 3000 писем/месяц
- Простая интеграция
- Отличная доставляемость
- Подробная статистика

## Готово! 🎉

После всех шагов email должен работать на production.

Если возникнут проблемы:
1. Проверьте логи в панели Timeweb
2. Откройте `/api/test/email` для диагностики
3. Проверьте настройки безопасности Gmail
