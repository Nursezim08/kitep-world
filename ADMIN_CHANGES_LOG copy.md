# Лог изменений админ-панели

## Исправление: Telegram ID теперь только в settings

### Проблема
Изначально `telegram_id` хранился в таблице `users`, что было избыточно и создавало путаницу.

### Решение
Теперь `telegram_id` хранится **только** в таблице `settings` с ключом `ADMIN_TELEGRAM_USER_ID`.

### Изменения в базе данных

#### Удалено поле из users
```sql
-- Миграция: 20260501144037_remove_telegram_id_from_users
ALTER TABLE users DROP COLUMN telegram_id;
```

#### Структура settings
```sql
-- Telegram ID хранится здесь
INSERT INTO settings (id, key, value) 
VALUES 
  (gen_random_uuid(), 'ADMIN_TELEGRAM_BOT_TOKEN', 'YOUR_BOT_TOKEN'),
  (gen_random_uuid(), 'ADMIN_TELEGRAM_USER_ID', 'YOUR_TELEGRAM_USER_ID');
```

### Изменения в коде

#### lib/telegram.ts
- ✅ Убрана проверка `user.telegramId`
- ✅ Код отправляется напрямую на `ADMIN_TELEGRAM_USER_ID` из settings
- ✅ Добавлена информация о пользователе в сообщение (имя и email)

#### app/api/admin/login/route.ts
- ✅ Убрана проверка наличия `telegram_id` у пользователя
- ✅ Улучшено логирование

#### scripts/diagnose-admin.js
- ✅ Убрана проверка `telegram_id` в таблице users
- ✅ Обновлена логика диагностики

### Как это работает сейчас

1. Админ вводит email и пароль
2. Система проверяет credentials и роль
3. Генерируется 6-значный код
4. Код отправляется на `ADMIN_TELEGRAM_USER_ID` из settings
5. В сообщении указывается имя и email админа для идентификации

### Преимущества

✅ **Упрощение**: Один источник истины для Telegram ID  
✅ **Гибкость**: Легко изменить Telegram ID без изменения пользователя  
✅ **Безопасность**: Telegram ID не привязан к конкретному пользователю  
✅ **Масштабируемость**: Легко добавить поддержку нескольких админов  

### Обновленная документация

- ✅ ADMIN_SETUP.md
- ✅ ADMIN_QUICK_START.md
- ✅ README_ADMIN.md
- ✅ scripts/diagnose-admin.js

### Проверка настроек

Запустите диагностику:
```bash
node scripts/diagnose-admin.js
```

Должно быть:
```
✅ ADMIN_TELEGRAM_BOT_TOKEN: существует
✅ ADMIN_TELEGRAM_USER_ID: существует
✅ Админские пользователи: найдены
✅ Все настройки в порядке!
```

### Миграция существующих данных

Если у вас уже был `telegram_id` в таблице users, он был автоматически удален миграцией. Убедитесь, что `ADMIN_TELEGRAM_USER_ID` в settings содержит правильное значение.

### Тестирование

1. Убедитесь, что бот запущен в Telegram
2. Откройте `/admin/login`
3. Введите credentials админа
4. Проверьте, что код пришел в Telegram
5. Введите код и войдите в админку

### Логи для отладки

При входе в консоли будут логи:
```
[Admin Login] Login attempt for email: admin@example.com
[Admin Login] User found: xxx Role: admin
[Admin Login] Password valid
[Admin Login] Account status OK
[Admin Login] Generated code: 123456
[Telegram] Starting to send code for userId: xxx
[Telegram] Bot token exists: true
[Telegram] Admin telegram ID exists: true
[Telegram] User found: true
[Telegram] Sending message to chat_id: 1434922404
[Telegram] SUCCESS: Message sent successfully
[Admin Login] SUCCESS: Code sent via Telegram
```

### Дата изменений
2026-05-01
