# Итоговые изменения: Исправление sitemap.xml через API Route

**Дата:** 14.05.2026

## Проблема
- Sitemap.xml работал локально, но возвращал 404 на продакшн сервере
- Причина: проблемы с конфигурацией Nginx/сервера
- Пользователь не имеет доступа к настройке сервера

## Решение
Создан API Route в Next.js с автоматическим rewrite правилом - **не требует настройки сервера**.

---

## ✅ Внесенные изменения

### 1. Создан API Route для sitemap
**Файл:** `app/api/sitemap.xml/route.ts` (НОВЫЙ)

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://nur-kitep.store';
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/catalog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/search</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>`;

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
```

**Особенности:**
- Генерирует валидный XML sitemap
- Правильный Content-Type: `application/xml`
- Кеширование на 1 час
- Статические страницы сайта
- Домен: `https://nur-kitep.store`

### 2. Добавлен rewrite в next.config.ts
**Файл:** `next.config.ts` (ИЗМЕНЕН)

Добавлена новая секция `rewrites()`:

```typescript
// Rewrite для sitemap.xml
async rewrites() {
  return [
    {
      source: '/sitemap.xml',
      destination: '/api/sitemap.xml',
    },
  ];
}
```

**Что делает:**
- Автоматически перенаправляет запросы с `/sitemap.xml` на `/api/sitemap.xml`
- Прозрачно для пользователя и поисковиков
- Работает без настройки сервера

### 3. Создана документация
**Файлы:** (НОВЫЕ)
- `SITEMAP_API_SOLUTION.md` - подробная документация решения
- `БЫСТРЫЙ_СТАРТ_SITEMAP.md` - краткая инструкция на русском

---

## 📋 Файлы для добавления в AGENTS.md

### Список изменённых файлов:
- ✅ `app/api/sitemap.xml/route.ts` - создан API endpoint
- ✅ `next.config.ts` - добавлен rewrite
- ✅ `SITEMAP_API_SOLUTION.md` - подробная документация
- ✅ `БЫСТРЫЙ_СТАРТ_SITEMAP.md` - быстрая инструкция

### Файлы без изменений (уже настроены):
- ✅ `public/robots.txt` - содержит правильный URL sitemap
- ✅ `app/sitemap.ts` - оставлен как есть (Next.js fallback)
- ✅ `public/sitemap.xml` - оставлен как статический fallback

---

## 🚀 Инструкция для деплоя

1. **Пересоберите проект:**
   ```bash
   npm run build
   ```

2. **Задеплойте на сервер:**
   - Загрузите обновленные файлы
   - Перезапустите Next.js: `pm2 restart nur-kitep`

3. **Проверьте:**
   - Откройте: https://nur-kitep.store/sitemap.xml
   - Должен отобразиться XML файл

4. **Отправьте в поисковики:**
   - Google Search Console: добавьте `sitemap.xml`
   - Яндекс.Вебмастер: добавьте полный URL

---

## ✅ Преимущества решения

1. **Не требует настройки сервера** - всё в коде Next.js
2. **Не требует прав root** - нет доступа к Nginx
3. **Работает везде** - на любом хостинге с Node.js
4. **SEO-friendly** - стандартный путь `/sitemap.xml`
5. **Кеширование** - оптимизировано для производительности
6. **Легко расширить** - можно добавить динамические URL

---

## 🎯 Результат

После деплоя sitemap будет доступен по адресу:
- ✅ `https://nur-kitep.store/sitemap.xml` (через rewrite)
- ✅ `https://nur-kitep.store/api/sitemap.xml` (прямой API)

Оба URL ведут к одному и тому же XML файлу.

---

## 📝 Примечание для будущего

В будущем можно расширить sitemap, добавив:
- Динамические товары из БД
- Категории товаров
- Страницы блога (если будет)

Пример кода приведен в файле `SITEMAP_API_SOLUTION.md`.
