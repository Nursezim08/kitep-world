# Добавить в AGENTS.md

## PWA (Progressive Web App) реализация (13.06.2026)

**Реализовано полноценное Progressive Web App для Nur-Kitep:**

### Созданные файлы:

**Манифест и Service Worker:**
- `public/manifest.json` - Web App Manifest с настройками PWA
- `public/sw.js` - Service Worker для кеширования и оффлайн режима
- `public/icons/` - 8 иконок (72×72 до 512×512) сгенерированы из logonur.png

**Компоненты:**
- `app/register-sw.tsx` - Регистрация Service Worker (только production)
- `app/components/InstallPWA.tsx` - Баннер установки PWA с градиентом
- `app/offline/page.tsx` - Красивая оффлайн страница с WifiOff иконкой

**Скрипты:**
- `scripts/generate-icons.mjs` - Автогенерация иконок из логотипа через sharp

**Документация:**
- `PWA_SETUP.md` - Полная инструкция по настройке и тестированию
- `PWA_IMPLEMENTATION.md` - Техническое описание реализации
- `PWA_QUICKSTART.md` - Быстрый старт для разработчиков
- `PWA_SUMMARY.md` - Краткое резюме с чеклистом

### Обновлённые файлы:

**`app/layout.tsx`:**
- ✅ Добавлены PWA мета-теги в metadata
- ✅ Добавлены Apple Web App мета-теги
- ✅ Интегрирован RegisterSW компонент
- ✅ Интегрирован InstallPWA баннер
- ✅ Ссылки на manifest и иконки в head

**`next.config.ts`:**
- ✅ Добавлены headers для Service Worker (Cache-Control)
- ✅ Добавлен Service-Worker-Allowed header
- ✅ Cache-Control для manifest.json

**`package.json`:**
- ✅ Добавлен скрипт `generate:icons`
- ✅ Добавлена зависимость `sharp` в devDependencies

### Функционал PWA:

**Установка:**
- ✅ Android: Меню браузера → "Установить приложение"
- ✅ iOS: Поделиться → "На экран Домой"
- ✅ Desktop: Иконка в адресной строке
- ✅ Баннер установки внизу страницы

**Оффлайн режим:**
- ✅ Главная страница (`/`) кешируется
- ✅ Статические ресурсы кешируются
- ✅ Специальная offline страница (`/offline`)
- ✅ Network First стратегия для HTML
- ✅ Cache First стратегия для статики

**Автообновления:**
- ✅ Проверка обновлений каждые 60 секунд
- ✅ Уведомление о новой версии
- ✅ Автоматическая активация обновлений
- ✅ Перезагрузка страницы при обновлении

**Дизайн:**
- ✅ Standalone режим (без адресной строки)
- ✅ Фиолетовая тема (#8b5cf6)
- ✅ Адаптивные иконки для всех платформ
- ✅ Splash screen при запуске

### Команды:

```bash
# Генерация иконок (уже выполнено)
npm run generate:icons

# Production сборка и запуск
npm run build
npm run start

# Development (SW не работает)
npm run dev
```

### Тестирование:

**Chrome DevTools:**
1. Application → Manifest (проверить)
2. Application → Service Workers (активирован)
3. Application → Cache Storage (наполнен)
4. Network → Offline (тест оффлайн)

**Lighthouse:**
- PWA score: Ожидается 100/100

### Преимущества:

✅ Работает как нативное приложение
✅ Устанавливается на любое устройство
✅ Быстрая загрузка через кеширование
✅ Доступ к главным страницам оффлайн
✅ Автоматические обновления
✅ Улучшенный UX на мобильных
✅ Меньше трафика за счёт кеша
✅ SEO-friendly (индексируется)

### Важные замечания:

⚠️ **Service Worker работает только в production!**
- В dev режиме SW не регистрируется
- Для тестирования: `npm run build && npm run start`

⚠️ **HTTPS обязателен для production!**
- PWA требует HTTPS (или localhost для тестирования)
- Service Worker не работает на HTTP в production

⚠️ **Иконки уже сгенерированы:**
- Находятся в `public/icons/`
- Сгенерированы из `public/logonur.png`
- 8 размеров: 72, 96, 128, 144, 152, 192, 384, 512

### Будущие улучшения:

- [ ] Push уведомления о заказах
- [ ] Оффлайн корзина (LocalStorage)
- [ ] Background Sync для заказов
- [ ] Кеширование каталога товаров
- [ ] Web Share API для товаров
- [ ] Geolocation API для филиалов

### Файлы:
- `public/manifest.json` - Web App Manifest
- `public/sw.js` - Service Worker
- `public/icons/` - Иконки PWA (8 штук)
- `app/register-sw.tsx` - Регистрация SW
- `app/components/InstallPWA.tsx` - Баннер установки
- `app/offline/page.tsx` - Оффлайн страница
- `scripts/generate-icons.mjs` - Генератор иконок
- `PWA_SETUP.md` - Полная документация
- `PWA_QUICKSTART.md` - Быстрый старт
- `PWA_SUMMARY.md` - Резюме

**Результат:**
🎉 Приложение Nur-Kitep теперь полноценное PWA, готовое к установке на любое устройство!
