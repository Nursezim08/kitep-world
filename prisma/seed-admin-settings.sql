-- Добавление настроек для Telegram бота админа
-- Выполните этот скрипт после создания админского пользователя

-- Вставка настроек Telegram (замените значения на реальные)
INSERT INTO settings (id, key, value) 
VALUES 
  (gen_random_uuid(), 'ADMIN_TELEGRAM_BOT_TOKEN', 'YOUR_BOT_TOKEN_HERE'),
  (gen_random_uuid(), 'ADMIN_TELEGRAM_USER_ID', 'YOUR_TELEGRAM_USER_ID_HERE')
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value;

-- Пример создания админского пользователя (если еще не создан)
-- Замените данные на реальные
-- Пароль: admin123 (хешированный)
-- INSERT INTO users (id, full_name, email, email_verified, role, password_hash, telegram_id, status, created_at, updated_at)
-- VALUES (
--   gen_random_uuid(),
--   'Администратор',
--   'admin@kitep.kg',
--   true,
--   'admin',
--   '$2a$10$YourHashedPasswordHere',
--   'YOUR_TELEGRAM_USER_ID_HERE',
--   'active',
--   NOW(),
--   NOW()
-- );

-- Инструкции:
-- 1. Создайте Telegram бота через @BotFather и получите токен
-- 2. Узнайте свой Telegram User ID (можно через @userinfobot)
-- 3. Замените YOUR_BOT_TOKEN_HERE и YOUR_TELEGRAM_USER_ID_HERE на реальные значения
-- 4. Создайте админского пользователя с telegram_id равным YOUR_TELEGRAM_USER_ID_HERE
-- 5. Выполните этот скрипт в вашей базе данных PostgreSQL
