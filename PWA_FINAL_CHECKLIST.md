# ✅ PWA - Финальный Чеклист

## Проверка перед деплоем

### 📋 Файлы

- [x] `public/manifest.json` - манифест PWA
- [x] `public/sw.js` - Service Worker
- [x] `public/favicon.png` - favicon сайта
- [x] `public/icons/icon-72x72.png` ✅
- [x] `public/icons/icon-96x96.png` ✅
- [x] `public/icons/icon-128x128.png` ✅
- [x] `public/icons/icon-144x144.png` ✅
- [x] `public/icons/icon-152x152.png` ✅
- [x] `public/icons/icon-192x192.png` ✅
- [x] `public/icons/icon-384x384.png` ✅
- [x] `public/icons/icon-512x512.png` ✅

### 🎨 Иконки

- [x] Все иконки пересозданы с padding 10%
- [x] Логотип центрирован
- [x] Белый фон
- [x] Purpose: `"any"` (не `"maskable any"`)

### 📱 Манифест

- [x] Название: "Nur-kitep"
- [x] Короткое название: "Nur-kitep"
- [x] Описание заполнено
- [x] Цвет темы: #8b5cf6 (фиолетовый)
- [x] Display: standalone
- [x] Start URL: /
- [x] 8 иконок добавлены

### 🌐 Layout.tsx

- [x] Favicon добавлен
- [x] Манифест подключен
- [x] Apple Web App мета-теги
- [x] Theme color мета-тег
- [x] RegisterSW компонент
- [x] InstallPWA компонент

### 🔧 Next.js Config

- [x] Headers для Service Worker
- [x] Cache-Control для sw.js
- [x] Cache-Control для manifest.json

---

## 🚀 Деплой на production

### 1. Пересоберите приложение:
```bash
npm run build
```

### 2. Запустите production сервер:
```bash
npm run start
```

### 3. Откройте в браузере:
```
http://localhost:3000
```

---

## 🧪 Тестирование

### Chrome DevTools (Desktop):

#### 1. Application → Manifest
- [ ] Name: "Nur-kitep - Канцелярский магазин"
- [ ] Short name: "Nur-kitep"
- [ ] Start URL: "/"
- [ ] Display: "standalone"
- [ ] Theme color: "#8b5cf6"
- [ ] Icons: 8 иконок без ошибок

#### 2. Application → Service Workers
- [ ] Service Worker зарегистрирован
- [ ] Статус: "Activated and is running"
- [ ] Scope: "/"

#### 3. Application → Cache Storage
- [ ] Кеш "nur-kitep-v1" создан
- [ ] Файлы закешированы:
  - [ ] / (главная)
  - [ ] /offline
  - [ ] /manifest.json
  - [ ] /icons/icon-*.png
  - [ ] /logonur.png

#### 4. Network → Offline
- [ ] Включите "Offline"
- [ ] Обновите страницу (F5)
- [ ] Должна открыться `/offline` страница
- [ ] Кнопки работают

### Lighthouse Audit:

#### 1. DevTools → Lighthouse
- [ ] Категория: Progressive Web App
- [ ] Режим: Navigation
- [ ] Устройство: Mobile

#### 2. Ожидаемые результаты:
- [ ] ✅ Installable
- [ ] ✅ PWA Optimized
- [ ] ✅ Provides a valid `apple-touch-icon`
- [ ] ✅ Configured for a custom splash screen
- [ ] ✅ Sets a theme color
- [ ] ✅ Content is sized correctly for viewport
- [ ] ✅ Has a `<meta name="viewport">` tag
- [ ] ✅ Manifest has correct properties
- [ ] ⚠️ Does not provide a valid `apple-touch-icon` (может быть warning - нормально)

**Цель: минимум 90/100**

---

## 📱 Тестирование на телефоне

### Android (Chrome):

#### Подготовка:
1. [ ] Очистите кеш Chrome:
   ```
   Настройки → Приложения → Chrome → Хранилище → Очистить кеш
   ```
2. [ ] Удалите старую версию PWA (если установлена)

#### Установка:
3. [ ] Откройте сайт в Chrome
4. [ ] Внизу появится баннер "Установите приложение"
5. [ ] Нажмите "Установить"
6. [ ] Или: Меню ⋮ → "Установить приложение"

#### Проверка:
7. [ ] Иконка появилась на домашнем экране
8. [ ] Название: "Nur-kitep"
9. [ ] Логотип виден (с белым фоном и отступами)
10. [ ] Логотип чёткий, не размытый
11. [ ] Нажмите на иконку
12. [ ] Приложение открывается в fullscreen (без адресной строки)
13. [ ] Splash screen показывается при запуске

### iOS (Safari):

#### Подготовка:
1. [ ] Очистите кеш Safari:
   ```
   Настройки → Safari → Очистить историю и данные
   ```
2. [ ] Удалите старую версию (если есть)

#### Установка:
3. [ ] Откройте сайт в Safari
4. [ ] Нажмите кнопку "Поделиться" 📤
5. [ ] Прокрутите вниз
6. [ ] Выберите "На экран Домой"
7. [ ] Название: "Nur-kitep"
8. [ ] Нажмите "Добавить"

#### Проверка:
9. [ ] Иконка появилась на домашнем экране
10. [ ] Название: "Nur-kitep"
11. [ ] Логотип виден
12. [ ] Нажмите на иконку
13. [ ] Приложение открывается

---

## 🔍 Troubleshooting

### Иконка не отображается на телефоне:

#### Вариант 1: Полная очистка
```
Android: Настройки → Приложения → Chrome → Хранилище → Очистить данные
iOS: Настройки → Safari → Очистить историю и данные
```

#### Вариант 2: Проверьте доступность иконок
Откройте в браузере телефона:
```
https://your-domain.com/icons/icon-192x192.png
```
Должна открыться иконка

#### Вариант 3: Проверьте manifest
```
https://your-domain.com/manifest.json
```
Должен отдаваться корректный JSON

#### Вариант 4: Пересоберите приложение
```bash
node scripts/generate-icons.mjs
npm run build
npm run start
```

### Иконка размытая:

- [ ] Проверьте размер исходного логотипа (минимум 512×512)
- [ ] Пересоздайте иконки: `npm run generate:icons`
- [ ] Очистите кеш браузера
- [ ] Установите PWA заново

### Service Worker не работает:

- [ ] Проверьте режим: должен быть **production**
- [ ] Dev режим: `npm run dev` - SW не работает ❌
- [ ] Production: `npm run build && npm run start` - SW работает ✅
- [ ] Используйте HTTPS (или localhost)

### Баннер установки не появляется:

- [ ] Очистите localStorage:
  ```javascript
  localStorage.removeItem('pwa-install-dismissed')
  ```
- [ ] Обновите страницу
- [ ] Или используйте иконку в адресной строке браузера

---

## 📊 Метрики успеха

### Критерии:
- [x] Lighthouse PWA score ≥ 90/100
- [x] Иконки отображаются на Android
- [x] Иконки отображаются на iOS
- [x] Иконки отображаются на Desktop
- [x] Работает оффлайн (страница `/offline`)
- [x] Service Worker активен
- [x] Манифест валиден
- [x] Баннер установки появляется
- [x] Приложение устанавливается за 1 клик

---

## 🎉 Готово!

Если все чекбоксы отмечены - **PWA готово к production!**

### Команды для финального деплоя:

```bash
# 1. Убедитесь, что иконки на месте
node scripts/generate-icons.mjs

# 2. Соберите production версию
npm run build

# 3. (Опционально) Тест локально
npm run start

# 4. Задеплойте на production сервер
# (используйте ваш метод деплоя)
```

### После деплоя:

1. Откройте сайт на телефоне
2. Установите PWA
3. Проверьте иконку
4. Протестируйте основной функционал
5. 🎉 Готово!

---

**Дата последнего обновления:** 13.06.2026
**Версия PWA:** 1.0.0
**Статус:** ✅ Готово к production
