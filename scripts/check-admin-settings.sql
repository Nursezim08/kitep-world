-- Проверка настроек админа в базе данных

-- 1. Проверка настроек Telegram в таблице settings
SELECT 
    key, 
    CASE 
        WHEN key = 'ADMIN_TELEGRAM_BOT_TOKEN' THEN 
            CASE 
                WHEN LENGTH(value) > 10 THEN CONCAT(LEFT(value, 10), '...')
                ELSE value
            END
        ELSE value
    END as value,
    LENGTH(value) as value_length
FROM settings 
WHERE key IN ('ADMIN_TELEGRAM_BOT_TOKEN', 'ADMIN_TELEGRAM_USER_ID')
ORDER BY key;

-- 2. Проверка админских пользователей
SELECT 
    id,
    full_name,
    email,
    role,
    telegram_id,
    status,
    email_verified
FROM users 
WHERE role = 'admin';

-- 3. Проверка совпадения telegram_id
SELECT 
    u.id as user_id,
    u.full_name,
    u.email,
    u.telegram_id as user_telegram_id,
    s.value as admin_telegram_id_setting,
    CASE 
        WHEN u.telegram_id = s.value THEN '✅ СОВПАДАЕТ'
        ELSE '❌ НЕ СОВПАДАЕТ'
    END as match_status
FROM users u
CROSS JOIN settings s
WHERE u.role = 'admin' 
  AND s.key = 'ADMIN_TELEGRAM_USER_ID';

-- 4. Проверка кодов верификации
SELECT 
    av.id,
    av.code,
    av.expires_at,
    av.verified,
    av.created_at,
    u.email,
    CASE 
        WHEN av.expires_at > NOW() THEN '✅ Действителен'
        ELSE '❌ Истек'
    END as status
FROM admin_verifications av
JOIN users u ON av.user_id = u.id
ORDER BY av.created_at DESC
LIMIT 10;
