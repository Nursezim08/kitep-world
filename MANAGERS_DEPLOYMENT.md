# 🚀 Развертывание системы управления менеджерами

## Предварительные требования

### Система
- ✅ Node.js 18+ установлен
- ✅ PostgreSQL установлен и запущен
- ✅ npm или yarn установлен

### База данных
- ✅ База данных создана
- ✅ Prisma миграции выполнены
- ✅ Существует хотя бы один админ

### Переменные окружения
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## Шаги развертывания

### 1. Проверка текущего состояния

```bash
# Проверить версию Node.js
node --version
# Должно быть >= 18.0.0

# Проверить версию npm
npm --version

# Проверить подключение к БД
npm run prisma:studio
# Должна открыться Prisma Studio
```

### 2. Установка зависимостей (если нужно)

```bash
# Установить все зависимости
npm install

# Или с yarn
yarn install
```

### 3. Проверка схемы БД

```bash
# Проверить статус миграций
npx prisma migrate status

# Если нужно, применить миграции
npx prisma migrate deploy

# Сгенерировать Prisma Client
npx prisma generate
```

### 4. Проверка компиляции

```bash
# Собрать проект
npm run build

# Должно завершиться успешно:
# ✓ Compiled successfully
```

### 5. Запуск в режиме разработки

```bash
# Запустить dev-сервер
npm run dev

# Сервер должен запуститься на http://localhost:3000
```

### 6. Проверка функциональности

#### 6.1. Войти в админ-панель
```
URL: http://localhost:3000/admin/login
Использовать существующие учетные данные админа
```

#### 6.2. Проверить навигацию
```
1. Открыть боковую панель
2. Найти пункт "Менеджеры"
3. Кликнуть на него
4. Должна открыться страница /admin/managers
```

#### 6.3. Проверить API
```bash
# Запустить тестовый скрипт
node scripts/test-managers-api.js

# Должны быть зеленые галочки для всех endpoints
```

#### 6.4. Проверить CRUD операции
```
1. Добавить тестового менеджера
2. Редактировать его данные
3. Изменить статус
4. Назначить на филиал
5. Удалить менеджера
```

### 7. Запуск в продакшене

```bash
# Собрать production build
npm run build

# Запустить production сервер
npm start

# Или с PM2
pm2 start npm --name "kitep-world" -- start
```

## Проверка после развертывания

### Чеклист функциональности

- [ ] Страница /admin/managers открывается
- [ ] Список менеджеров загружается
- [ ] Поиск работает
- [ ] Модальное окно "Добавить" открывается
- [ ] Можно создать менеджера
- [ ] Модальное окно "Редактировать" открывается
- [ ] Можно обновить менеджера
- [ ] Можно удалить менеджера
- [ ] Список филиалов загружается
- [ ] Можно назначить менеджера на филиал
- [ ] Статусы отображаются правильно
- [ ] Локализация работает (ru/kg)

### Чеклист безопасности

- [ ] Неавторизованные пользователи не могут получить доступ
- [ ] Только админы могут управлять менеджерами
- [ ] Пароли хешируются
- [ ] Email уникален
- [ ] Телефон уникален (если указан)
- [ ] Валидация работает на клиенте и сервере

### Чеклист производительности

- [ ] Страница загружается < 1 секунды
- [ ] API отвечает < 500ms
- [ ] Поиск работает мгновенно
- [ ] Нет утечек памяти
- [ ] Нет лишних ре-рендеров

## Возможные проблемы и решения

### Проблема 1: Ошибка компиляции

**Симптом:**
```
Error: Export default doesn't exist in target module
```

**Решение:**
```bash
# Проверить импорты prisma
# Должно быть: import { prisma } from '@/lib/prisma'
# А не: import prisma from '@/lib/prisma'

# Пересобрать проект
npm run build
```

### Проблема 2: База данных не подключается

**Симптом:**
```
Error: Can't reach database server
```

**Решение:**
```bash
# Проверить DATABASE_URL в .env
# Проверить, что PostgreSQL запущен
sudo systemctl status postgresql

# Проверить подключение
npx prisma db pull
```

### Проблема 3: Миграции не применены

**Симптом:**
```
Error: Table 'users' doesn't exist
```

**Решение:**
```bash
# Применить все миграции
npx prisma migrate deploy

# Сгенерировать Prisma Client
npx prisma generate
```

### Проблема 4: Сессия не работает

**Симптом:**
```
401 Unauthorized при запросах к API
```

**Решение:**
```bash
# Проверить NEXTAUTH_SECRET в .env
# Проверить, что cookie admin_session устанавливается
# Проверить срок действия сессии
```

### Проблема 5: Модальные окна не открываются

**Симптом:**
```
Кнопки не реагируют на клики
```

**Решение:**
```bash
# Проверить консоль браузера на ошибки
# Проверить, что useState работает
# Очистить кеш браузера
```

### Проблема 6: Филиалы не загружаются

**Симптом:**
```
Выпадающий список филиалов пустой
```

**Решение:**
```bash
# Проверить, что в БД есть филиалы со статусом 'active'
# Проверить API /api/admin/branches
# Проверить fetchBranches() в useEffect
```

## Мониторинг

### Логи

```bash
# Просмотр логов в dev режиме
npm run dev

# Просмотр логов в production (PM2)
pm2 logs kitep-world

# Просмотр логов в production (Docker)
docker logs -f container_name
```

### Метрики

```bash
# Проверить использование памяти
pm2 monit

# Проверить время ответа API
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/admin/managers
```

### Ошибки

```bash
# Проверить логи ошибок
tail -f logs/error.log

# Проверить Sentry (если настроен)
# Открыть Sentry dashboard
```

## Откат изменений

Если что-то пошло не так, можно откатить изменения:

### Откат файлов

```bash
# Удалить новые файлы
rm -rf app/admin/managers
rm -rf app/api/admin/managers
rm app/api/admin/branches/route.ts
rm app/i18n/locales/ru/admin.json
rm app/i18n/locales/kg/admin.json

# Восстановить измененные файлы из git
git checkout app/admin/dashboard/AdminDashboardClient.tsx
```

### Откат БД

```bash
# База данных не изменялась, откат не требуется
# Если были созданы тестовые менеджеры, удалить их:
npx prisma studio
# Удалить менеджеров вручную
```

## Обновление

### Обновление кода

```bash
# Получить последние изменения
git pull origin main

# Установить зависимости
npm install

# Пересобрать проект
npm run build

# Перезапустить сервер
pm2 restart kitep-world
```

### Обновление БД

```bash
# Если были изменения в схеме
npx prisma migrate deploy
npx prisma generate

# Перезапустить сервер
pm2 restart kitep-world
```

## Резервное копирование

### База данных

```bash
# Создать бэкап БД
pg_dump -U username -d dbname > backup_$(date +%Y%m%d).sql

# Восстановить из бэкапа
psql -U username -d dbname < backup_20260502.sql
```

### Файлы

```bash
# Создать бэкап файлов
tar -czf backup_$(date +%Y%m%d).tar.gz \
  app/admin/managers \
  app/api/admin/managers \
  app/api/admin/branches \
  app/i18n/locales/ru/admin.json \
  app/i18n/locales/kg/admin.json

# Восстановить из бэкапа
tar -xzf backup_20260502.tar.gz
```

## Production Checklist

### Перед развертыванием

- [ ] Все тесты пройдены
- [ ] Код прошел code review
- [ ] Документация обновлена
- [ ] Создан бэкап БД
- [ ] Создан бэкап файлов
- [ ] Проверены переменные окружения
- [ ] Настроен мониторинг
- [ ] Настроены алерты

### После развертывания

- [ ] Проверена функциональность
- [ ] Проверена производительность
- [ ] Проверены логи на ошибки
- [ ] Проверена безопасность
- [ ] Уведомлена команда
- [ ] Обновлена документация
- [ ] Создан changelog

## Контакты поддержки

### Документация
- `MANAGERS_GUIDE.md` - полное руководство
- `MANAGERS_QUICK_START.md` - быстрый старт
- `MANAGERS_ARCHITECTURE.md` - архитектура
- `MANAGERS_SUMMARY.md` - сводка

### Тестирование
- `scripts/test-managers-api.js` - тестовый скрипт

### Схема БД
- `prisma/schema.prisma` - модели данных

## Дополнительные ресурсы

### Next.js
- https://nextjs.org/docs
- https://nextjs.org/docs/app/building-your-application/routing/route-handlers

### Prisma
- https://www.prisma.io/docs
- https://www.prisma.io/docs/concepts/components/prisma-client

### PostgreSQL
- https://www.postgresql.org/docs/

### TypeScript
- https://www.typescriptlang.org/docs/

---

**Дата**: 2 мая 2026  
**Версия**: 1.0.0  
**Статус**: ✅ Готово к развертыванию
