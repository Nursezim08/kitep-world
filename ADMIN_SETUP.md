# Настройка админ-панели с 2FA через Telegram

## Обзор

Админ-панель защищена двухфакторной аутентификацией через Telegram. Процесс входа:
1. Админ вводит email и пароль
2. Система отправляет 6-значный код в Telegram
3. Админ вводит код и получает доступ к панели

## Шаг 1: Создание Telegram бота

1. Откройте Telegram и найдите [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Сохраните полученный **Bot Token** (например: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

## Шаг 2: Получение Telegram User ID

1. Найдите в Telegram бота [@userinfobot](https://t.me/userinfobot)
2. Отправьте ему любое сообщение
3. Бот вернет ваш **User ID** (например: `123456789`)

## Шаг 3: Настройка базы данных

### 3.1 Добавление настроек Telegram

Выполните SQL запрос в вашей базе данных:

```sql
INSERT INTO settings (id, key, value) 
VALUES 
  (gen_random_uuid(), 'ADMIN_TELEGRAM_BOT_TOKEN', 'ВАШ_BOT_TOKEN'),
  (gen_random_uuid(), 'ADMIN_TELEGRAM_USER_ID', 'ВАШ_TELEGRAM_USER_ID')
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value;
```

Замените:
- `ВАШ_BOT_TOKEN` на токен из шага 1
- `ВАШ_TELEGRAM_USER_ID` на User ID из шага 2

### 3.2 Создание админского пользователя

Если у вас еще нет админского пользователя, создайте его:

```sql
-- Сначала создайте хеш пароля (используйте bcrypt)
-- Пример для пароля "admin123":

INSERT INTO users (
  id, 
  full_name, 
  email, 
  email_verified, 
  role, 
  password_hash, 
  status, 
  created_at, 
  updated_at
)
VALUES (
  gen_random_uuid(),
  'Администратор',
  'admin@kitep.kg',
  true,
  'admin',
  '$2a$10$YourHashedPasswordHere', -- Замените на реальный хеш
  'active',
  NOW(),
  NOW()
);
```

**Важно:** Telegram ID хранится только в таблице `settings` (ключ `ADMIN_TELEGRAM_USER_ID`), а не в таблице `users`!

### 3.3 Генерация хеша пароля

Вы можете сгенерировать хеш пароля с помощью Node.js:

```javascript
const bcrypt = require('bcryptjs');
const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
```

Или используйте онлайн генератор bcrypt (убедитесь, что используете rounds=10).

## Шаг 4: Запуск бота

1. Найдите вашего бота в Telegram (по имени, которое вы дали в @BotFather)
2. Нажмите **Start** или отправьте `/start`
3. Это активирует бота для отправки сообщений

## Шаг 5: Тестирование

1. Перейдите на `/admin/login`
2. Введите email и пароль администратора
3. Проверьте Telegram - должен прийти код
4. Введите код на странице `/admin/verify`
5. Вы будете перенаправлены в `/admin/dashboard`

## Структура маршрутов

### Админские маршруты
- `/admin/login` - Вход в админ-панель
- `/admin/verify` - Ввод кода из Telegram
- `/admin/dashboard` - Главная страница админки

### API маршруты
- `POST /api/admin/login` - Проверка email/пароля и отправка кода
- `POST /api/admin/verify-code` - Проверка кода из Telegram
- `POST /api/admin/resend-code` - Повторная отправка кода

## Безопасность

### Защита маршрутов

Middleware автоматически защищает:
- ✅ Админы не могут заходить на пользовательские страницы (`/profile`, `/`)
- ✅ Обычные пользователи не могут заходить в админку (`/admin/*`)
- ✅ Неавторизованные пользователи перенаправляются на `/admin/login`
- ✅ Авторизованные админы не могут заходить на `/admin/login`

### Особенности безопасности

1. **Двухфакторная аутентификация**: Даже если злоумышленник узнает пароль, ему нужен доступ к Telegram
2. **Временные коды**: Коды действительны только 5 минут
3. **Одноразовые коды**: После использования код становится недействительным
4. **Проверка роли**: Только пользователи с ролью `admin` могут войти
5. **Проверка статуса**: Заблокированные и неактивные аккаунты не могут войти
6. **JWT токены**: Сессии защищены JWT с истечением через 7 дней

## Таблицы базы данных

### users
- Админские пользователи имеют `role = 'admin'`
- Telegram ID **НЕ** хранится в этой таблице

### admin_verifications
- `user_id` - ID пользователя
- `code` - 6-значный код
- `expires_at` - Время истечения (5 минут)
- `verified` - Флаг использования кода

### settings
- `ADMIN_TELEGRAM_BOT_TOKEN` - Токен Telegram бота
- `ADMIN_TELEGRAM_USER_ID` - Telegram User ID администратора (коды отправляются на этот ID)

## Переводы

Все тексты админки переведены на русский и кыргызский языки в файлах:
- `app/i18n/locales/ru/landing.json` - раздел `admin`
- `app/i18n/locales/kg/landing.json` - раздел `admin`

## Troubleshooting

### Код не приходит в Telegram

1. Проверьте, что бот запущен (нажмите Start)
2. Проверьте правильность `ADMIN_TELEGRAM_BOT_TOKEN` в таблице `settings`
3. Проверьте, что `telegram_id` пользователя совпадает с `ADMIN_TELEGRAM_USER_ID`
4. Проверьте логи сервера на наличие ошибок

### Ошибка "Telegram не настроен"

1. Убедитесь, что в таблице `settings` есть записи с ключами:
   - `ADMIN_TELEGRAM_BOT_TOKEN`
   - `ADMIN_TELEGRAM_USER_ID`
2. Telegram ID хранится только в `settings`, а не в таблице `users`

### Ошибка "Неверный код"

1. Проверьте, что код не истек (5 минут)
2. Убедитесь, что вводите последний полученный код
3. Попробуйте запросить код повторно

### Админ попадает на обычные страницы

Проверьте, что middleware правильно настроен и файл `middleware.ts` находится в корне проекта.

## Дополнительные возможности

### Добавление нескольких админов

Для каждого админа:
1. Создайте пользователя с `role = 'admin'`
2. Укажите его `telegram_id`
3. Убедитесь, что его `telegram_id` совпадает с `ADMIN_TELEGRAM_USER_ID` в настройках

**Примечание**: Текущая реализация поддерживает одного главного админа. Для нескольких админов нужно модифицировать логику проверки `ADMIN_TELEGRAM_USER_ID`.

### Изменение времени действия кода

В файлах API (`app/api/admin/login/route.ts`, `app/api/admin/resend-code/route.ts`):

```typescript
const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 минут
```

Измените `5` на нужное количество минут.

### Изменение длины кода

В файле `lib/telegram.ts`:

```typescript
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 цифр
}
```

Для 4-значного кода: `Math.floor(1000 + Math.random() * 9000)`

## Поддержка

При возникновении проблем проверьте:
1. Логи сервера Next.js
2. Логи базы данных PostgreSQL
3. Правильность настроек в таблице `settings`
4. Статус Telegram бота
