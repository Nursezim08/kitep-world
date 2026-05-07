# Настройка Google Maps API

## Получение API ключа

1. Перейдите на [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Перейдите в "APIs & Services" → "Library"
4. Найдите и включите следующие API:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**

5. Перейдите в "APIs & Services" → "Credentials"
6. Нажмите "Create Credentials" → "API Key"
7. Скопируйте созданный ключ
8. (Рекомендуется) Ограничьте ключ:
   - Application restrictions: HTTP referrers
   - Добавьте: `http://localhost:3000/*` и ваш production домен
   - API restrictions: выберите только нужные API (Maps JavaScript API, Places API, Geocoding API)

## Настройка в проекте

1. Откройте файл `.env`
2. Замените `YOUR_GOOGLE_MAPS_API_KEY_HERE` на ваш API ключ:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="ваш_ключ_здесь"
   ```

3. Перезапустите сервер разработки:
   ```bash
   npm run dev
   ```

## Проверка

После настройки:
1. Откройте страницу филиалов
2. Нажмите "Добавить филиал"
3. На первом шаге при вводе города/района/адреса должны появляться подсказки
4. На карте должна отображаться выбранная локация

## Стоимость

Google Maps API предоставляет $200 бесплатных кредитов каждый месяц, что покрывает:
- ~28,000 загрузок карты
- ~100,000 запросов автодополнения

Для небольших проектов этого более чем достаточно.

## Troubleshooting

**Ошибка: "This API project is not authorized to use this API"**
- Убедитесь, что включили все необходимые API в Google Cloud Console

**Карта не загружается**
- Проверьте, что API ключ правильно указан в `.env`
- Проверьте консоль браузера на наличие ошибок
- Убедитесь, что перезапустили сервер после изменения `.env`

**Автодополнение не работает**
- Убедитесь, что включили Places API
- Проверьте ограничения API ключа
