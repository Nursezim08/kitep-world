# 🚀 Быстрый деплой sitemap.xml

## Команды для сервера:

```bash
# 1. Перейдите в папку проекта
cd /home/nursite/nur-kitep.store

# 2. Обновите код (если используете git)
git pull

# 3. Установите зависимости
npm install

# 4. Соберите проект
npm run build

# 5. Перезапустите приложение
pm2 restart nur-kitep

# 6. Проверьте статус
pm2 status
```

## Проверка:

Откройте в браузере:
```
https://nur-kitep.store/sitemap.xml
```

**Должен отобразиться XML с 5 страницами! ✅**

---

## Что исправлено:

1. ✅ Удалено rewrite правило из `next.config.ts` (было конфликтом)
2. ✅ Удалены файлы `app/api/sitemap.xml/route.ts` и `app/sitemap.ts`
3. ✅ Используется только статический файл `public/sitemap.xml`

---

## Если не работает:

```bash
# Проверьте логи
pm2 logs nur-kitep --lines 50

# Полная перезагрузка
pm2 delete nur-kitep
pm2 start npm --name "nur-kitep" -- start

# Проверьте наличие файла
ls -la public/sitemap.xml
```

---

**Готово! 🎉**
