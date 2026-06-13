# Исправление Sitemap для nur-kitep.store

## ✅ Что исправлено

1. **Обновлен домен во всех файлах:**
   - `app/sitemap.ts` → `https://nur-kitep.store`
   - `app/layout.tsx` → metadataBase и canonical
   - `public/robots.txt` → Sitemap URL
   - `app/components/StructuredData.tsx` → Organization и WebSite URLs

## 🔧 Как исправить проблему с sitemap

### Причина проблемы
Sitemap не открывается потому что:
1. Проект не пересобран после изменений
2. Или есть ошибка в коде sitemap.ts

### Решение

#### Шаг 1: Пересоберите проект
```bash
# Остановите сервер (Ctrl+C)
npm run build
npm run start
```

#### Шаг 2: Проверьте локально
Откройте: http://localhost:3000/sitemap.xml

**Если работает локально**, значит проблема на сервере:
- Нужен деплой новой версии
- Проверьте логи сервера на ошибки

**Если НЕ работает локально**, проверьте:

### Возможные ошибки

#### 1. Ошибка подключения к БД
Если в sitemap.ts есть ошибка БД, создайте упрощенную версию:

```typescript
// app/sitemap.ts - УПРОЩЕННАЯ ВЕРСИЯ (без БД)
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://nur-kitep.store';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];
}
```

Это даст базовый sitemap без товаров и категорий.

#### 2. Проверьте логи сборки
```bash
npm run build
```

Ищите ошибки в выводе. Особенно связанные с:
- Prisma подключением
- TypeScript ошибками
- Missing dependencies

#### 3. Проверьте переменные окружения
В `.env` или `.env.production` должен быть DATABASE_URL:
```
DATABASE_URL="postgresql://..."
```

### Временное решение: Статический sitemap

Если динамический sitemap не работает, создайте статический:

```bash
# Удалите app/sitemap.ts
# Создайте public/sitemap.xml
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://nur-kitep.store</loc>
    <lastmod>2026-06-13</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://nur-kitep.store/catalog</loc>
    <lastmod>2026-06-13</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://nur-kitep.store/search</loc>
    <lastmod>2026-06-13</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://nur-kitep.store/terms</loc>
    <lastmod>2026-06-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://nur-kitep.store/privacy</loc>
    <lastmod>2026-06-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>
```

Статический sitemap всегда работает, но его нужно обновлять вручную.

## 🔍 Диагностика

### Проверка 1: Доступность файла
```bash
curl https://nur-kitep.store/sitemap.xml
```

Ожидаемый результат: XML с URL-ами

### Проверка 2: Robots.txt
```bash
curl https://nur-kitep.store/robots.txt
```

Должна быть строка:
```
Sitemap: https://nur-kitep.store/sitemap.xml
```

### Проверка 3: Логи сервера
Проверьте логи на наличие ошибок:
```bash
# Если используете PM2
pm2 logs

# Или Docker
docker logs <container-id>
```

### Проверка 4: Next.js routes
```bash
# После build проверьте
ls .next/server/app/
```

Должен быть файл `sitemap.xml.meta` или `sitemap.xml.body`

## 📋 Чеклист исправления

- [ ] Домен обновлен на nur-kitep.store во всех файлах
- [ ] Проект пересобран (`npm run build`)
- [ ] Сервер перезапущен
- [ ] Sitemap открывается локально (http://localhost:3000/sitemap.xml)
- [ ] Задеплоена новая версия на сервер
- [ ] Sitemap открывается в продакшене (https://nur-kitep.store/sitemap.xml)
- [ ] robots.txt содержит правильный URL sitemap
- [ ] Google Search Console обновлен с новым sitemap

## 🚀 После исправления

1. **Проверьте в браузере:**
   https://nur-kitep.store/sitemap.xml

2. **Отправьте в Google Search Console:**
   - Откройте: https://search.google.com/search-console
   - Sitemaps → Add new sitemap
   - URL: `sitemap.xml`

3. **Отправьте в Яндекс Вебмастер:**
   - Откройте: https://webmaster.yandex.ru
   - Индексирование → Файлы Sitemap
   - Добавьте: https://nur-kitep.store/sitemap.xml

## 💡 Рекомендации

1. Используйте динамический sitemap (текущий) для автоматического обновления
2. Если есть проблемы с БД на build, используйте статический sitemap
3. Обновляйте sitemap при добавлении новых страниц
4. Проверяйте sitemap раз в неделю на валидность

---

**Статус:** ✅ Домен обновлен на nur-kitep.store  
**Дата:** 13.06.2026  
**Следующий шаг:** Пересоберите проект и задеплойте
