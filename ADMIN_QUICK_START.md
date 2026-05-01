# Быстрый старт админ-панели

## 1. Создайте Telegram бота

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot` и следуйте инструкциям
3. Сохраните **Bot Token** (например: `1234567890:ABCdefGHI...`)

## 2. Получите ваш Telegram User ID

1. Откройте [@userinfobot](https://t.me/userinfobot) в Telegram
2. Отправьте любое сообщение
3. Сохраните ваш **User ID** (например: `123456789`)

## 3. Сгенерируйте хеш пароля

```bash
node scripts/generate-password-hash.js admin123
```

Сохраните полученный хеш.

## 4. Настройте базу данных

Выполните SQL запросы (замените значения на свои):

```sql
-- Добавьте настройки Telegram
INSERT INTO settings (id, key, value) 
VALUES 
  (gen_random_uuid(), 'ADMIN_TELEGRAM_BOT_TOKEN', '1234567890:ABCdefGHI...'),
  (gen_random_uuid(), 'ADMIN_TELEGRAM_USER_ID', '123456789')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Создайте админа
INSERT INTO users (
  id, full_name, email, email_verified, role, 
  password_hash, status, created_at, updated_at
)
VALUES (
  gen_random_uuid(),
  'Администратор',
  'admin@kitep.kg',
  true,
  'admin',
  'ВАШ_ХЕШ_ПАРОЛЯ',
  'active',
  NOW(),
  NOW()
);
```

**Важно:** Telegram ID хранится только в таблице `settings`, а не в `users`!

## 5. Запустите бота

1. Найдите вашего бота в Telegram
2. Нажмите **Start**

## 6. Войдите в админку

1. Откройте `http://localhost:3000/admin/login`
2. Введите email: `admin@kitep.kg` и пароль: `admin123`
3. Получите код в Telegram
4. Введите код
5. Готово! 🎉

## Структура

- `/admin/login` - Вход
- `/admin/verify` - Ввод кода
- `/admin/dashboard` - Админ-панель

## Безопасность

✅ Админы не могут заходить на пользовательские страницы  
✅ Пользователи не могут заходить в админку  
✅ Двухфакторная аутентификация через Telegram  
✅ Коды действительны 5 минут  
✅ Одноразовые коды

## Помощь

Подробная документация: [ADMIN_SETUP.md](./ADMIN_SETUP.md)
