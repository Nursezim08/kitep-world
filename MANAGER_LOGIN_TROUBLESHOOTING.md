# Устранение проблем со входом менеджера

## Проблема: "Не удалось загрузить данные филиала"

### Причина
Компонент пытался использовать админский endpoint `/api/admin/branches/[id]`, который требует прав администратора.

### Решение ✅
Создан специальный endpoint для менеджеров: `/api/manager/branch/[id]`

### Что было исправлено:

1. **Создан новый API endpoint** (`app/api/manager/branch/[id]/route.ts`)
   - Проверяет авторизацию менеджера
   - Проверяет доступ к конкретному филиалу
   - Возвращает данные только того филиала, к которому привязан менеджер

2. **Обновлен компонент** (`app/manager/branch/[id]/BranchManagerClient.tsx`)
   - Использует правильный endpoint `/api/manager/branch/[id]`
   - Улучшена обработка ошибок
   - Добавлено логирование
   - Автоматическое перенаправление на вход при 401

3. **Улучшена обработка ошибок** (`app/manager/verify/page.tsx`)
   - Добавлены новые сообщения об ошибках
   - Более информативные тексты

## Как проверить, что проблема решена

### Шаг 1: Перезапустите dev сервер
```bash
# Остановите текущий сервер (Ctrl+C)
npm run dev
```

### Шаг 2: Войдите как менеджер
1. Откройте `/manager/login`
2. Введите email и пароль менеджера
3. Проверьте консоль сервера для кода (в dev режиме)
4. Введите код на `/manager/verify`

### Шаг 3: Проверьте консоль браузера
Откройте DevTools (F12) и проверьте:
- Нет ошибок 403 или 401
- Запрос к `/api/manager/branch/[id]` возвращает 200
- Данные филиала загружаются корректно

### Шаг 4: Проверьте консоль сервера
Должны увидеть логи:
```
[Manager Branch] Request for branch: uuid
[Manager Branch] Current user: uuid manager
[Manager Branch] SUCCESS: Branch data retrieved
```

## Возможные проблемы и решения

### 1. "Unauthorized" (401)
**Причина:** Менеджер не авторизован

**Решение:**
- Проверьте, что вы прошли процесс входа
- Проверьте, что cookie `auth_token` установлен
- Попробуйте войти заново

### 2. "Access denied to this branch" (403)
**Причина:** Менеджер не привязан к этому филиалу

**Решение:**
```sql
-- Проверьте привязку в БД
SELECT * FROM branch_users WHERE user_id = 'manager-uuid';

-- Если нет записей, добавьте через админ-панель:
-- 1. Откройте /admin/branches
-- 2. Выберите филиал
-- 3. Добавьте менеджера в секции "Менеджеры"
```

### 3. "Branch not found" (404)
**Причина:** Филиал с таким ID не существует

**Решение:**
- Проверьте, что филиал существует в БД
- Проверьте правильность branchId в URL
- Создайте филиал через админ-панель

### 4. Менеджер видит пустую страницу
**Причина:** JavaScript ошибка или проблема с рендерингом

**Решение:**
- Откройте консоль браузера (F12)
- Проверьте наличие ошибок
- Проверьте, что все данные загружены
- Перезагрузите страницу (Ctrl+R)

## Проверка данных в БД

### Проверить, что менеджер существует:
```sql
SELECT id, full_name, email, role, status 
FROM users 
WHERE role = 'manager';
```

### Проверить привязку к филиалу:
```sql
SELECT 
  bu.id,
  u.full_name as manager_name,
  u.email as manager_email,
  b.name as branch_name,
  b.id as branch_id
FROM branch_users bu
JOIN users u ON bu.user_id = u.id
JOIN branches b ON bu.branch_id = b.id
WHERE u.role = 'manager';
```

### Проверить коды верификации:
```sql
SELECT 
  ev.code,
  ev.expires_at,
  ev.verified,
  u.email,
  u.role
FROM email_verifications ev
JOIN users u ON ev.user_id = u.id
WHERE u.role = 'manager'
ORDER BY ev.created_at DESC
LIMIT 5;
```

## Логи для отладки

### В консоли сервера должны быть:
```
[Manager Login] Login attempt for email: manager@example.com
[Manager Login] User found: uuid Role: manager
[Manager Login] Password valid
[Manager Login] Account status OK
[Manager Login] Generated code: 123456
[Manager Login] Code saved to database
[Manager Login] SUCCESS: Code sent via email

[Manager Verify] Verification attempt for userId: uuid
[Manager Verify] Code verified successfully
[Manager Verify] SUCCESS: Token created and cookie set

[Manager Branch] Request for branch: uuid
[Manager Branch] Current user: uuid manager
[Manager Branch] SUCCESS: Branch data retrieved
```

### В консоли браузера должны быть:
```
[BranchManagerClient] Fetching branch data for: uuid
[BranchManagerClient] Branch data loaded successfully
```

## Быстрая проверка

Выполните эти команды для быстрой диагностики:

```bash
# 1. Проверьте, что файлы созданы
ls app/api/manager/branch/[id]/route.ts
ls app/manager/branch/[id]/BranchManagerClient.tsx

# 2. Проверьте компиляцию
npm run build

# 3. Запустите dev сервер
npm run dev

# 4. Откройте в браузере
# http://localhost:3000/manager/login
```

## Контрольный список

- [ ] Dev сервер перезапущен
- [ ] Менеджер создан в админ-панели
- [ ] Менеджер назначен на филиал
- [ ] Email и пароль правильные
- [ ] Код из email введен корректно
- [ ] Cookie `auth_token` установлен
- [ ] Нет ошибок в консоли браузера
- [ ] Нет ошибок в консоли сервера
- [ ] Данные филиала отображаются

## Если проблема не решена

1. Проверьте логи в консоли сервера
2. Проверьте логи в консоли браузера (F12)
3. Проверьте данные в БД
4. Убедитесь, что все файлы созданы
5. Попробуйте очистить кэш браузера
6. Попробуйте в режиме инкогнито
7. Проверьте, что порт 3000 не занят другим процессом

## Дополнительная информация

- **MANAGER_LOGIN_GUIDE.md** - Подробное руководство
- **MANAGER_QUICK_START.md** - Быстрый старт
- **README.md** - Общая документация
