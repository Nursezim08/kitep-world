# Решение проблемы Sitemap на продакшене

## ✅ Что сделано

### 1. Упрощен динамический sitemap
- Убрано обращение к БД (было источником ошибки)
- Только статические страницы
- Файл: `app/sitemap.ts`

### 2. Создан статический sitemap
- Файл: `public/sitemap.xml`
- Всегда доступен, не зависит от Next.js routing
- Работает как fallback

## 🚀 Что нужно сделать

### Вариант 1: Задеплоить новую версию (Рекомендуется)

```bash
# 1. Закоммитить изменения
git add .
git commit -m "Fix sitemap - simplified version + static fallback"
git push

# 2. На сервере
git pull
npm install
npm run build
pm2 restart all  # или ваша команда перезапуска
```

**После деплоя проверьте:**
- https://nur-kitep.store/sitemap.xml (динамический)
- https://nur-kitep.store/sitemap.xml (статический fallback)

### Вариант 2: Только статический sitemap (Быстро)

Если нужно срочно:

```bash
# На сервере
cd /path/to/project
git pull  # Чтобы получить public/sitemap.xml
pm2 restart all
```

Статический sitemap из `public/sitemap.xml` заработает сразу.

## 🔍 Проверка после деплоя

### 1. Проверьте в браузере:
```
https://nur-kitep.store/sitemap.xml
```

Должен показать XML с 5 страницами.

### 2. Проверьте robots.txt:
```
https://nur-kitep.store/robots.txt
```

Должна быть строка:
```
Sitemap: https://nur-kitep.store/sitemap.xml
```

### 3. Валидация XML:
Проверьте в XML валидаторе:
- https://www.xml-sitemaps.com/validate-xml-sitemap.html
- Вставьте URL: https://nur-kitep.store/sitemap.xml

## 📊 Два типа sitemap

### Динамический (app/sitemap.ts)
**Плюсы:**
- Автоматически обновляется
- Генерируется Next.js
- Может включать данные из БД (когда исправим)

**Минусы:**
- Требует правильной конфигурации Next.js
- Может не работать если есть ошибки

**URL:** https://nur-kitep.store/sitemap.xml (если Next.js работает)

### Статический (public/sitemap.xml)
**Плюсы:**
- Всегда работает
- Не зависит от кода
- Быстро отдается

**Минусы:**
- Нужно обновлять вручную при добавлении страниц
- Не включает динамические страницы (товары, категории)

**URL:** https://nur-kitep.store/sitemap.xml (fallback)

## 🎯 Приоритет обработки

Next.js проверяет в таком порядке:
1. `app/sitemap.ts` (динамический) ← приоритет
2. `public/sitemap.xml` (статический) ← fallback

Если динамический работает - используется он.
Если нет - используется статический.

## 🔧 Возможные причины 404 на сервере

### 1. Старая версия кода
**Решение:** git pull + npm run build

### 2. Next.js не пересобран
**Решение:** npm run build

### 3. Неправильная конфигурация сервера
Проверьте nginx/apache конфиг:
```nginx
# Nginx должен проксировать все запросы на Next.js
location / {
    proxy_pass http://localhost:3000;
}
```

### 4. PM2 не перезапущен
**Решение:**
```bash
pm2 restart all
pm2 logs  # проверить ошибки
```

### 5. Права доступа к файлам
**Решение:**
```bash
chmod -R 755 .next
chmod -R 755 public
```

## 📝 Команды для деплоя

### Если используете PM2:
```bash
cd /var/www/nur-kitep  # или ваш путь
git pull
npm install
npm run build
pm2 restart nur-kitep  # имя вашего процесса
pm2 logs nur-kitep     # проверить логи
```

### Если используете Docker:
```bash
git pull
docker-compose down
docker-compose up -d --build
docker-compose logs -f
```

### Если используете обычный npm:
```bash
git pull
npm install
npm run build
# Остановить старый процесс
# Запустить новый
npm run start
```

## ✅ Чеклист после деплоя

- [ ] Код задеплоен на сервер (git pull)
- [ ] Зависимости установлены (npm install)
- [ ] Проект пересобран (npm run build)
- [ ] Сервер перезапущен (pm2 restart / docker restart)
- [ ] https://nur-kitep.store/sitemap.xml открывается ✓
- [ ] XML валиден (проверка в валидаторе)
- [ ] robots.txt содержит правильный URL
- [ ] Отправлен в Google Search Console
- [ ] Отправлен в Яндекс Вебмастер

## 🎯 Следующие шаги

### 1. После того как sitemap заработает:

**Отправьте в Google Search Console:**
1. Откройте: https://search.google.com/search-console
2. Выберите ваш сайт nur-kitep.store
3. Меню: Sitemaps
4. Добавить новый sitemap: `sitemap.xml`
5. Нажать "Отправить"

**Отправьте в Яндекс Вебмастер:**
1. Откройте: https://webmaster.yandex.ru
2. Выберите ваш сайт
3. Индексирование → Файлы Sitemap
4. Добавить sitemap: https://nur-kitep.store/sitemap.xml

### 2. В будущем можно добавить товары и категории:

Когда все заработает стабильно, можно вернуть динамический sitemap с БД.
Инструкция будет в `SITEMAP_DYNAMIC.md`.

## 📞 Если ничего не помогает

Проверьте логи сервера:
```bash
# PM2
pm2 logs

# Docker
docker logs <container-name>

# Nginx
tail -f /var/log/nginx/error.log

# System
journalctl -u nginx -f
```

Найдите ошибки связанные с `/sitemap.xml` и отправьте мне.

---

**Статус:** ✅ Локально работает, ждет деплоя  
**Дата:** 13.06.2026  
**Следующий шаг:** git push → deploy → проверить https://nur-kitep.store/sitemap.xml
