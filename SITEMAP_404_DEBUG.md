# Диагностика 404 ошибки sitemap на продакшене

## 🔍 Проблема
- Локально работает: http://localhost:3000/sitemap.xml ✓
- На сервере 404: https://nur-kitep.store/sitemap.xml ✗
- Деплой выполнен, но не помогло

## 🎯 Возможные причины

### 1. Nginx/Apache не проксирует XML файлы

**Проверка:**
На сервере выполните:
```bash
curl -I https://nur-kitep.store/sitemap.xml
```

Если видите заголовок `X-Powered-By: Next.js` - проксирование работает.
Если нет - проблема в веб-сервере.

**Решение для Nginx:**

Файл конфигурации (обычно `/etc/nginx/sites-available/nur-kitep.store`):

```nginx
server {
    server_name nur-kitep.store www.nur-kitep.store;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Важно! Не блокировать XML файлы
    location ~ \.(xml)$ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
    
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
}
```

После изменения:
```bash
sudo nginx -t  # проверка конфигурации
sudo systemctl reload nginx
```

### 2. Next.js работает не на порту 3000

**Проверка:**
```bash
# На сервере
netstat -tulpn | grep 3000
# или
lsof -i :3000
```

Если Next.js на другом порту, обновите `proxy_pass` в nginx.

### 3. PM2/Docker не перезапустился

**Проверка PM2:**
```bash
pm2 list  # проверить статус
pm2 logs  # проверить логи на ошибки
pm2 restart all
pm2 logs --lines 100  # последние 100 строк
```

**Проверка Docker:**
```bash
docker ps  # проверить статус контейнера
docker logs <container-name>
docker restart <container-name>
```

### 4. Файл .next не обновился

**Проверка:**
```bash
# На сервере в папке проекта
ls -la .next/
stat .next/BUILD_ID  # дата последней сборки
```

Если дата старая:
```bash
rm -rf .next
npm run build
pm2 restart all
```

### 5. Public folder не копируется

**Проверка:**
```bash
# На сервере
ls -la public/sitemap.xml
cat public/sitemap.xml
```

Если файла нет:
```bash
git pull  # убедитесь что файл подтянулся
ls -la public/  # проверьте снова
```

### 6. Next.js standalone build

Если используете `output: 'standalone'`, файлы из `public` нужно копировать отдельно.

**Проверка в next.config.ts:**
```typescript
// Если есть это:
output: 'standalone'
```

**Решение:**
```bash
# После build
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
```

### 7. Проблема с маршрутизацией Next.js

**Временное решение - прямой nginx:**

Добавьте в nginx конфиг **перед** `location /`:

```nginx
# Сначала пробуем статический файл
location = /sitemap.xml {
    root /var/www/nur-kitep/public;
    try_files $uri @nextjs;
}

location @nextjs {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
}

location / {
    proxy_pass http://localhost:3000;
    # ... остальные настройки
}
```

Замените `/var/www/nur-kitep` на ваш путь к проекту.

После изменения:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 🛠️ Пошаговая диагностика

### Шаг 1: Проверьте доступность Next.js
```bash
# На сервере
curl http://localhost:3000/sitemap.xml
```

**Если работает** → проблема в nginx/apache
**Если 404** → проблема в Next.js

### Шаг 2: Проверьте структуру проекта
```bash
# На сервере в папке проекта
ls -la app/sitemap.ts
ls -la public/sitemap.xml
ls -la .next/BUILD_ID
```

Все файлы должны существовать.

### Шаг 3: Проверьте логи
```bash
# PM2
pm2 logs --lines 200

# Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Системные логи
journalctl -xe
```

Ищите ошибки связанные с `/sitemap.xml` или `404`.

### Шаг 4: Проверьте права доступа
```bash
# На сервере
ls -la public/sitemap.xml
# Должно быть: -rw-r--r-- или похожее

# Если права неправильные:
chmod 644 public/sitemap.xml
chown www-data:www-data public/sitemap.xml  # или ваш пользователь
```

### Шаг 5: Проверьте заголовки ответа
```bash
curl -I https://nur-kitep.store/sitemap.xml
```

Должны быть заголовки:
```
HTTP/2 200 OK
Content-Type: application/xml
```

Если видите:
```
HTTP/2 404 Not Found
```

Значит запрос не доходит до Next.js или файл не найден.

## 🚀 Быстрое решение (гарантированно работает)

Если ничего не помогает, создайте прямой nginx route:

### Файл: /etc/nginx/sites-available/nur-kitep.store

```nginx
server {
    server_name nur-kitep.store;
    
    root /var/www/nur-kitep;  # Путь к вашему проекту
    
    # Статические файлы напрямую
    location = /sitemap.xml {
        alias /var/www/nur-kitep/public/sitemap.xml;
        types { application/xml xml; }
        add_header Content-Type application/xml;
        add_header Cache-Control "public, max-age=3600";
    }
    
    location = /robots.txt {
        alias /var/www/nur-kitep/public/robots.txt;
        add_header Content-Type text/plain;
    }
    
    # Все остальное на Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    listen 443 ssl;
    # ... SSL настройки
}
```

**Важно:** Замените `/var/www/nur-kitep` на реальный путь к проекту!

После изменения:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

Это **гарантирует** что sitemap.xml будет отдаваться напрямую из `public/` папки.

## 📝 Команды для сбора информации

Выполните на сервере и отправьте результаты:

```bash
# 1. Структура проекта
echo "=== App structure ==="
ls -la app/ | grep sitemap

echo "=== Public structure ==="
ls -la public/ | grep sitemap

echo "=== Build info ==="
cat .next/BUILD_ID
stat .next/BUILD_ID

# 2. Next.js процесс
echo "=== PM2 status ==="
pm2 list

echo "=== Port check ==="
netstat -tulpn | grep 3000

# 3. Test internal
echo "=== Internal test ==="
curl -I http://localhost:3000/sitemap.xml

# 4. Test external
echo "=== External test ==="
curl -I https://nur-kitep.store/sitemap.xml

# 5. Nginx config
echo "=== Nginx config ==="
cat /etc/nginx/sites-available/nur-kitep.store | grep -A 10 "location"

# 6. Logs
echo "=== PM2 logs ==="
pm2 logs --lines 50 --nostream

echo "=== Nginx error log ==="
sudo tail -20 /var/log/nginx/error.log
```

## 🎯 Наиболее вероятная причина

**99% вероятность:** Nginx конфигурация не настроена правильно для проксирования XML файлов.

**Решение:**
1. Добавьте прямой route для `/sitemap.xml` в nginx
2. Укажите `alias` на `public/sitemap.xml`
3. Перезагрузите nginx

Это сработает **гарантированно**, потому что файл будет отдаваться напрямую, минуя Next.js.

---

**Что делать сейчас:**
1. Проверьте nginx конфигурацию
2. Добавьте прямой route для sitemap.xml (см. "Быстрое решение")
3. Перезагрузите nginx
4. Проверьте https://nur-kitep.store/sitemap.xml

Если не поможет, выполните команды из "Команды для сбора информации" и отправьте результаты.
