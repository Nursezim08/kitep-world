# ✅ Sitemap.xml - Готово к деплою!

## 🎯 Что исправлено:

### Проблема:
- Sitemap.xml возвращал **404 на продакшн сервере**
- Даже после создания статического файла не работало

### Причина:
- **Rewrite правило в `next.config.ts` конфликтовало** со статическим файлом!
- Rewrite перенаправлял `/sitemap.xml` на `/api/sitemap.xml`
- API route не работал на продакшене

### Решение:
1. ✅ Создан статический файл `public/sitemap.xml`
2. ✅ **УДАЛЕНО** rewrite правило из `next.config.ts`
3. ✅ **УДАЛЕНЫ** ненужные файлы:
   - `app/api/sitemap.xml/route.ts`
   - `app/sitemap.ts`
4. ✅ Проект успешно собирается (`npm run build`)

---

## 📦 Инструкция для деплоя:

### Шаг 1: Установите зависимости (если нужно)
```bash
npm install
```

### Шаг 2: Соберите проект
```bash
npm run build
```
**Ожидаемый результат:** `Exit Code: 0` ✅

### Шаг 3: Загрузите на сервер
```bash
# Вариант 1: Git (рекомендуется)
git add .
git commit -m "Fix: Removed conflicting rewrite for sitemap.xml"
git push

# На сервере:
cd /home/nursite/nur-kitep.store
git pull
npm install
npm run build
pm2 restart nur-kitep
```

```bash
# Вариант 2: Вручную
# Загрузите обновленные файлы на сервер через FTP/SFTP
# Затем на сервере:
cd /home/nursite/nur-kitep.store
npm install
npm run build
pm2 restart nur-kitep
```

### Шаг 4: Проверьте результат
Откройте в браузере:
```
https://nur-kitep.store/sitemap.xml
```

**Должен отобразиться XML файл** с 5 страницами! 🎉

---

## 📋 Содержимое sitemap.xml:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://nur-kitep.store</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://nur-kitep.store/catalog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://nur-kitep.store/search</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://nur-kitep.store/terms</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://nur-kitep.store/privacy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>
```

---

## 🔍 Добавление в поисковые системы:

### Google Search Console:
1. Откройте: https://search.google.com/search-console
2. Выберите сайт `nur-kitep.store`
3. Перейдите: **Файлы Sitemap**
4. Нажмите **"Добавить файл Sitemap"**
5. Введите: `sitemap.xml`
6. Нажмите **"Отправить"**

### Яндекс.Вебмастер:
1. Откройте: https://webmaster.yandex.ru
2. Выберите сайт `nur-kitep.store`
3. Перейдите: **Индексирование → Файлы Sitemap**
4. Нажмите **"Добавить файл sitemap"**
5. Введите: `https://nur-kitep.store/sitemap.xml`
6. Нажмите **"Добавить"**

---

## 📝 Измененные файлы:

### Созданные:
- ✅ `public/sitemap.xml` - статический XML файл

### Измененные:
- ✅ `next.config.ts` - удалено rewrite правило
- ✅ `AGENTS.md` - обновлена документация

### Удаленные:
- ❌ `app/api/sitemap.xml/route.ts` - больше не нужен
- ❌ `app/sitemap.ts` - больше не нужен

---

## 🎉 Итого:

| Статус | Описание |
|--------|----------|
| ✅ | Статический файл создан |
| ✅ | Rewrite правило удалено |
| ✅ | Конфликтующие файлы удалены |
| ✅ | Проект собирается без ошибок |
| ✅ | Готово к деплою! |

---

## 💡 Почему теперь работает:

**Было:**
```
Запрос /sitemap.xml 
  → Rewrite перенаправляет на /api/sitemap.xml
  → API route не работает на продакшене
  → 404 Error ❌
```

**Стало:**
```
Запрос /sitemap.xml 
  → Next.js отдает файл из public/sitemap.xml
  → Статический файл всегда работает
  → XML отображается ✅
```

---

## 🚀 Что делать после деплоя:

1. ✅ Проверьте доступность: `https://nur-kitep.store/sitemap.xml`
2. ✅ Добавьте в Google Search Console
3. ✅ Добавьте в Яндекс.Вебмастер
4. ✅ Дождитесь индексации (1-7 дней)
5. ✅ Проверьте статус в панелях вебмастеров

---

## 📞 Поддержка:

Если после деплоя все еще 404:
1. Убедитесь, что файл `public/sitemap.xml` загружен на сервер
2. Проверьте, что проект пересобран: `npm run build`
3. Проверьте, что pm2 перезапущен: `pm2 restart nur-kitep`
4. Проверьте логи: `pm2 logs nur-kitep`

---

**Готово к деплою! 🎯**

Дата: 14.05.2026
Версия: v2 (финальная)
