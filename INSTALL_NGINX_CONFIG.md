# Установка Nginx конфигурации для Nur-kitep

## 📋 Пошаговая инструкция

### Шаг 1: Узнайте путь к проекту на сервере

Подключитесь к серверу через SSH и выполните:

```bash
cd /path/to/your/project
pwd
```

Запомните этот путь (например: `/home/user/nur-kitep` или `/var/www/nur-kitep`)

### Шаг 2: Отредактируйте nginx.conf

Откройте файл `nginx.conf` который я создал и **замените ВСЕ** вхождения:

```nginx
/var/www/nur-kitep
```

На ваш реальный путь к проекту!

### Шаг 3: Скопируйте файл на сервер

**Вариант A: Через git (если файл в репозитории)**

```bash
# Локально
git add nginx.conf
git commit -m "Add nginx config"
git push

# На сервере
git pull
```

**Вариант B: Через SCP**

```bash
# С вашего компьютера (из папки проекта)
scp nginx.conf user@your-server-ip:/tmp/nginx.conf
```

**Вариант C: Вручную скопировать содержимое**

1. Откройте `nginx.conf` на компьютере
2. Скопируйте весь текст
3. На сервере создайте файл и вставьте

### Шаг 4: Установите конфигурацию на сервере

```bash
# Подключитесь к серверу по SSH
ssh user@your-server-ip

# Скопируйте конфиг в Nginx
sudo cp /tmp/nginx.conf /etc/nginx/sites-available/nur-kitep.store

# Или если используете другой путь
sudo cp nginx.conf /etc/nginx/sites-available/nur-kitep.store

# Создайте симлинк (если еще нет)
sudo ln -sf /etc/nginx/sites-available/nur-kitep.store /etc/nginx/sites-enabled/

# Удалите default конфиг (если мешает)
sudo rm -f /etc/nginx/sites-enabled/default
```

### Шаг 5: Проверьте конфигурацию

```bash
# Проверка синтаксиса
sudo nginx -t
```

Должно быть:
```
nginx: configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**Если ошибка:**
- Проверьте что путь `/var/www/nur-kitep` заменен на правильный
- Проверьте что файлы существуют: `ls -la /your/path/public/sitemap.xml`

### Шаг 6: Перезагрузите Nginx

```bash
sudo systemctl reload nginx

# Или полный рестарт
sudo systemctl restart nginx

# Проверка статуса
sudo systemctl status nginx
```

### Шаг 7: Проверьте результат

```bash
# Прямая проверка на сервере
curl http://localhost:3000/sitemap.xml

# Проверка через nginx
curl https://nur-kitep.store/sitemap.xml

# Должен вернуть XML контент
```

В браузере откройте: **https://nur-kitep.store/sitemap.xml**

Должен показать XML файл!

## 🔧 Что делать если не работает

### Ошибка 1: "Permission denied"

```bash
# Дайте права на чтение
sudo chmod 644 /your/path/public/sitemap.xml
sudo chmod 755 /your/path/public

# Проверьте владельца
ls -la /your/path/public/sitemap.xml

# Если нужно, измените владельца
sudo chown www-data:www-data /your/path/public/sitemap.xml
```

### Ошибка 2: "No such file or directory"

```bash
# Проверьте существование файла
ls -la /your/path/public/sitemap.xml

# Если файла нет
cd /your/path
git pull  # подтянуть с репозитория

# Или создайте вручную (скопируйте из проекта)
```

### Ошибка 3: SSL сертификаты

Если в nginx -t ошибки про SSL:

**Вариант 1: Закомментировать SSL (временно)**

В файле конфигурации закомментируйте:
```nginx
# ssl_certificate /etc/letsencrypt/...
# ssl_certificate_key /etc/letsencrypt/...
```

**Вариант 2: Установить SSL через Certbot**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d nur-kitep.store -d www.nur-kitep.store
```

### Ошибка 4: "Address already in use"

Другой конфиг уже слушает порт 443:

```bash
# Найдите конфликтующий конфиг
sudo nginx -T | grep "listen.*443"

# Удалите старый конфиг
sudo rm /etc/nginx/sites-enabled/old-config

# Перезагрузите
sudo systemctl reload nginx
```

## 📊 Проверка всех SEO файлов

После установки проверьте все файлы:

```bash
# 1. Sitemap
curl https://nur-kitep.store/sitemap.xml

# 2. Robots
curl https://nur-kitep.store/robots.txt

# 3. Favicon
curl -I https://nur-kitep.store/favicon.png

# 4. Manifest
curl https://nur-kitep.store/manifest.json
```

Все должны работать!

## 🎯 Альтернативный метод (если ничего не работает)

Если nginx слишком сложный, создайте файл прямо в корне Next.js:

```bash
# На сервере в папке проекта
cd /your/path

# Создайте симлинк
ln -s public/sitemap.xml sitemap.xml
ln -s public/robots.txt robots.txt
```

Но это **плохое решение**, лучше настроить nginx правильно.

## ✅ Финальная проверка

После всех шагов проверьте:

- [ ] https://nur-kitep.store/sitemap.xml - работает ✓
- [ ] https://nur-kitep.store/robots.txt - работает ✓
- [ ] XML валиден (откройте в браузере)
- [ ] В Google Search Console отправлен sitemap
- [ ] В Яндекс Вебмастер отправлен sitemap

## 📝 Шпаргалка команд

```bash
# Весь процесс одной цепочкой (для опытных)
sudo cp nginx.conf /etc/nginx/sites-available/nur-kitep.store && \
sudo ln -sf /etc/nginx/sites-available/nur-kitep.store /etc/nginx/sites-enabled/ && \
sudo nginx -t && \
sudo systemctl reload nginx && \
curl https://nur-kitep.store/sitemap.xml
```

---

**Важно:** Не забудьте заменить `/var/www/nur-kitep` на ваш реальный путь!

**Помощь:** Если что-то не работает, отправьте вывод команды `sudo nginx -t`
