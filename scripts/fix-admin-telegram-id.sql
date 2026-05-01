-- Исправление telegram_id для админа
-- Замените email и telegram_id на свои значения

-- Обновление telegram_id для существующего админа
UPDATE users 
SET telegram_id = '1434922404'
WHERE email = 'nursezim416@gmail.com' AND role = 'admin';

-- Проверка результата
SELECT 
    id,
    full_name,
    email,
    role,
    telegram_id,
    status
FROM users 
WHERE role = 'admin';
