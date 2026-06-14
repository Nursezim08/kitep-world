# Решение проблемы 404 для sitemap.xml через API Route

## ✅ Что было сделано

### 1. Создан API Route для sitemap
**Файл:** `app/api/sitemap.xml/route.ts`

Этот route генерирует XML sitemap динамически и доступен по адресу:
- Локально: `http://localhost:3000/api/sitemap.xml`
- Продакшн: `https://nur-kitep.store/api/sitemap.xml`

### 2. Добавлен rewrite в next.config.ts
**Файл:** `next.config.ts`

Добавлено правило, которое автоматически перенаправляет запросы с `/sitemap.xml` на `/api/sitemap.xml`:

```typescript
async rewrites() {
  return [
    {
      source: '/sitemap.xml',
      destination: '/api/sitemap.xml',
    },
  ];
}
```

Теперь sitemap доступен по обоим адресам:
- ✅ `https://nur-kitep.store/sitemap.xml` (перенаправляется на API)
- ✅ `https://nur-kitep.store/api/sitemap.xml` (прямой API route)

### 3. robots.txt уже настроен
**Файл:** `public/robots.txt`

Уже содержит правильную ссылку:
```
Sitemap: https://nur-kitep.store/sitemap.xml
```

---

## 🚀 Инструкция по деплою

### Шаг 1: Соберите проект
```bash
npm run build
```

### Шаг 2: Запустите в production режиме (локально)
```bash
npm run start
```

### Шаг 3: Проверьте локально
Откройте в браузере:
- http://localhost:3000/sitemap.xml
- http://localhost:3000/api/sitemap.xml

Должен отобразиться XML файл с URL-адресами сайта.

### Шаг 4: Задеплойте на сервер
```bash
# Если используете Timeweb или другой хостинг
# Просто загрузите обновленные файлы через FTP/SSH
# или используйте ваш метод деплоя

# Обязательно перезапустите Next.js после деплоя:
pm2 restart nur-kitep
# или
npm run start
```

### Шаг 5: Проверьте на продакшне
Откройте в браузере:
- https://nur-kitep.store/sitemap.xml
- https://nur-kitep.store/api/sitemap.xml

---

## ✅ Преимущества этого решения

1. **Не требует настройки сервера** - всё работает в Next.js
2. **Не требует прав root** - не нужен доступ к Nginx
3. **Динамическая генерация** - sitemap всегда актуальный
4. **Правильный Content-Type** - браузеры и поисковики распознают XML
5. **Кеширование** - sitemap кешируется на 1 час для производительности
6. **SEO-friendly URL** - доступен по стандартному пути `/sitemap.xml`

---

## 🔍 Проверка после деплоя

### 1. Проверка в браузере
Откройте https://nur-kitep.store/sitemap.xml

Должен отобразиться XML файл примерно такого содержания:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://nur-kitep.store</loc>
    <lastmod>2026-05-14T...</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ...
</urlset>
```

### 2. Проверка через curl
```bash
curl -I https://nur-kitep.store/sitemap.xml
```

Должны увидеть:
```
HTTP/2 200
content-type: application/xml
cache-control: public, max-age=3600, s-maxage=3600
```

### 3. Проверка в Google Search Console
1. Перейдите в https://search.google.com/search-console
2. Выберите свойство `nur-kitep.store`
3. Перейдите в раздел "Файлы Sitemap"
4. Нажмите "Добавить новый файл sitemap"
5. Введите: `sitemap.xml`
6. Нажмите "Отправить"

Google начнет индексацию через несколько минут/часов.

### 4. Проверка в Яндекс.Вебмастер
1. Перейдите в https://webmaster.yandex.ru
2. Выберите сайт `nur-kitep.store`
3. Перейдите в раздел "Индексирование" → "Файлы Sitemap"
4. Нажмите "Добавить"
5. Введите: `https://nur-kitep.store/sitemap.xml`
6. Нажмите "Добавить"

---

## 🐛 Устранение неполадок

### Проблема: 404 ошибка на /sitemap.xml
**Решение:**
1. Убедитесь, что вы пересобрали проект: `npm run build`
2. Перезапустите сервер: `pm2 restart nur-kitep` или `npm run start`
3. Очистите кеш браузера (Ctrl+Shift+R)
4. Проверьте, что файлы существуют:
   - `app/api/sitemap.xml/route.ts`
   - Изменения в `next.config.ts`

### Проблема: Отображается HTML вместо XML
**Решение:**
Это означает, что запрос не доходит до API route. Проверьте:
1. Правильно ли настроен `rewrites()` в `next.config.ts`
2. Перезапущен ли сервер после изменений
3. Нет ли конфликтов с другими правилами в Nginx

### Проблема: Ошибка Internal Server Error
**Решение:**
1. Проверьте логи сервера: `pm2 logs nur-kitep`
2. Убедитесь, что синтаксис в `route.ts` корректный
3. Проверьте права доступа к файлам

---

## 📝 Дополнительно: Добавление динамических URL

В будущем можно расширить sitemap, добавив товары и категории:

```typescript
// app/api/sitemap.xml/route.ts
import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

export async function GET() {
  const prisma = getPrismaClient();
  const baseUrl = 'https://nur-kitep.store';
  
  // Получаем товары
  const products = await prisma.product.findMany({
    where: { status: 'active' },
    select: { id: true, updatedAt: true },
  });
  
  // Получаем категории
  const categories = await prisma.category.findMany({
    where: { status: 'active' },
    select: { id: true, updatedAt: true },
  });
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;
  
  // Добавляем товары
  for (const product of products) {
    sitemap += `
  <url>
    <loc>${baseUrl}/product/${product.id}</loc>
    <lastmod>${product.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }
  
  // Добавляем категории
  for (const category of categories) {
    sitemap += `
  <url>
    <loc>${baseUrl}/catalog?category=${category.id}</loc>
    <lastmod>${category.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }
  
  sitemap += `
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

---

## ✅ Итоговый чеклист

После деплоя убедитесь:
- [ ] `https://nur-kitep.store/sitemap.xml` открывается и показывает XML
- [ ] `https://nur-kitep.store/api/sitemap.xml` открывается и показывает XML
- [ ] `https://nur-kitep.store/robots.txt` открывается и содержит ссылку на sitemap
- [ ] Sitemap добавлен в Google Search Console
- [ ] Sitemap добавлен в Яндекс.Вебмастер
- [ ] Через 1-2 дня проверьте индексацию страниц в поисковиках

---

## 🎉 Готово!

Теперь sitemap доступен по стандартному пути `/sitemap.xml` без необходимости настройки сервера или Nginx. Просто задеплойте код и всё заработает автоматически!
