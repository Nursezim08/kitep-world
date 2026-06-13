# PWA Настройка Nur-Kitep

## Обзор

Приложение Nur-Kitep теперь является Progressive Web App (PWA) с полной поддержкой оффлайн режима.

## Возможности PWA

✅ **Установка на главный экран** - Работает как нативное приложение
✅ **Оффлайн режим** - Доступ к главным страницам без интернета
✅ **Push уведомления** - Готово к интеграции (в будущем)
✅ **Автоматические обновления** - Service Worker обновляется автоматически
✅ **Быстрая загрузка** - Кеширование статических ресурсов
✅ **Адаптивные иконки** - Поддержка всех размеров экранов

## Установка зависимостей

```bash
npm install
```

Это установит `sharp` для генерации иконок.

## Генерация иконок

Создайте иконки PWA из логотипа:

```bash
npm run generate:icons
```

Эта команда создаст иконки следующих размеров:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

Все иконки будут сохранены в `public/icons/`.

## Структура файлов PWA

```
├── public/
│   ├── manifest.json          # Web App Manifest
│   ├── sw.js                  # Service Worker
│   ├── logonur.png           # Исходный логотип
│   └── icons/                # Иконки PWA (генерируются)
│       ├── icon-72x72.png
│       ├── icon-96x96.png
│       ├── icon-128x128.png
│       ├── icon-144x144.png
│       ├── icon-152x152.png
│       ├── icon-192x192.png
│       ├── icon-384x384.png
│       └── icon-512x512.png
├── app/
│   ├── register-sw.tsx       # Регистрация Service Worker
│   ├── components/
│   │   └── InstallPWA.tsx   # Баннер установки PWA
│   └── offline/
│       └── page.tsx          # Оффлайн страница
└── scripts/
    └── generate-icons.mjs    # Скрипт генерации иконок
```

## Service Worker

Service Worker (`public/sw.js`) обеспечивает:

### Стратегия кеширования:
- **Network First** для HTML страниц
- **Cache First** для статических ресурсов
- **Offline Fallback** при отсутствии сети

### Кешируемые ресурсы:
- Главная страница (`/`)
- Оффлайн страница (`/offline`)
- Манифест и иконки
- Логотип

### Исключения:
- API запросы (`/api/*`)
- Next.js служебные файлы (`/_next/*`)
- Chrome extensions
- POST/PUT/DELETE запросы

## Manifest.json

Web App Manifest определяет:
- Название приложения (полное и короткое)
- Иконки для всех платформ
- Цвета темы (фиолетовый `#8b5cf6`)
- Режим отображения (standalone)
- Ориентация (portrait-primary)

## Тестирование PWA

### 1. Development режим:
Service Worker работает только в production!

### 2. Production режим:
```bash
npm run build
npm run start
```

### 3. Открыть приложение:
```
http://localhost:3000
```

### 4. Проверить PWA в DevTools:
1. Откройте Chrome DevTools (F12)
2. Перейдите во вкладку **Application**
3. Проверьте:
   - **Manifest** - должен быть загружен
   - **Service Workers** - должен быть активирован
   - **Cache Storage** - должны быть кешированные файлы

### 5. Тестирование оффлайн:
1. В DevTools → **Network** → поставьте галочку **Offline**
2. Обновите страницу (F5)
3. Должна открыться оффлайн страница `/offline`

### 6. Установка PWA:
1. В адресной строке Chrome появится иконка установки
2. Клик по иконке → "Установить"
3. Или используйте баннер внизу страницы

## Lighthouse Audit

Проверьте качество PWA:

1. Откройте DevTools (F12)
2. Перейдите во вкладку **Lighthouse**
3. Выберите категорию **Progressive Web App**
4. Нажмите **Analyze page load**

Ожидаемые результаты:
- ✅ Installable
- ✅ PWA Optimized
- ✅ Works offline
- ✅ Fast and reliable

## Установка на устройства

### Android (Chrome):
1. Откройте сайт в Chrome
2. Нажмите "⋮" → "Установить приложение"
3. Или используйте баннер установки

### iOS (Safari):
1. Откройте сайт в Safari
2. Нажмите кнопку "Поделиться" (квадрат со стрелкой)
3. Выберите "На экран Домой"
4. Нажмите "Добавить"

### Desktop (Chrome/Edge):
1. В адресной строке нажмите иконку установки
2. Или используйте баннер установки
3. Приложение откроется в отдельном окне

## Обновления PWA

Service Worker автоматически:
- Проверяет обновления каждые 60 секунд
- Уведомляет пользователя о новой версии
- Предлагает перезагрузить страницу

## Оффлайн функционал

### Доступные оффлайн страницы:
- `/` - Главная (лендинг)
- `/offline` - Специальная оффлайн страница

### Будущие улучшения:
- Кеширование каталога товаров
- Кеширование карточек товаров
- Оффлайн корзина (LocalStorage)
- Синхронизация заказов при восстановлении связи

## Troubleshooting

### Service Worker не регистрируется:
1. Проверьте, что приложение запущено в production
2. Проверьте консоль на ошибки
3. Убедитесь, что используется HTTPS (или localhost)

### Кеш не обновляется:
1. Измените `CACHE_NAME` в `sw.js`
2. Пересоберите приложение
3. Или используйте DevTools → Application → Clear storage

### PWA не устанавливается:
1. Проверьте manifest.json (без ошибок)
2. Убедитесь, что все иконки сгенерированы
3. Проверьте Service Worker (активирован)
4. Используйте HTTPS (обязательно для production)

### Баннер установки не появляется:
1. Очистите localStorage: `localStorage.removeItem('pwa-install-dismissed')`
2. Обновите страницу
3. Или используйте кнопку установки в браузере

## Production Deployment

### 1. Убедитесь, что все иконки созданы:
```bash
npm run generate:icons
```

### 2. Соберите приложение:
```bash
npm run build
```

### 3. Запустите production сервер:
```bash
npm run start
```

### 4. Обязательно используйте HTTPS!
PWA требует HTTPS для работы Service Worker (кроме localhost).

## Полезные ссылки

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

## Поддержка

При возникновении проблем:
1. Проверьте консоль браузера
2. Проверьте вкладку Application в DevTools
3. Запустите Lighthouse audit
4. Очистите кеш и попробуйте снова
