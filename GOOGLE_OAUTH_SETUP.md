# Настройка Google OAuth

## Шаги для настройки Google OAuth

### 1. Создание проекта в Google Cloud Console

1. Перейдите на [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. В меню навигации выберите "APIs & Services" > "Credentials"

### 2. Настройка OAuth consent screen

1. Нажмите "Configure Consent Screen"
2. Выберите "External" (для тестирования) или "Internal" (для организации)
3. Заполните обязательные поля:
   - App name: Kitep World
   - User support email: ваш email
   - Developer contact information: ваш email
4. Нажмите "Save and Continue"
5. На странице "Scopes" нажмите "Add or Remove Scopes"
6. Выберите следующие scopes:
   - `openid`
   - `email`
   - `profile`
7. Нажмите "Save and Continue"
8. Добавьте тестовых пользователей (если выбрали External)
9. Нажмите "Save and Continue"

### 3. Создание OAuth 2.0 Client ID

1. Вернитесь в "Credentials"
2. Нажмите "Create Credentials" > "OAuth client ID"
3. Выберите "Web application"
4. Заполните поля:
   - Name: Kitep World Web Client
   - Authorized JavaScript origins:
     - `http://localhost:3000` (для разработки)
     - `https://yourdomain.com` (для продакшена)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback` (для разработки)
     - `https://yourdomain.com/api/auth/google/callback` (для продакшена)
5. Нажмите "Create"
6. Скопируйте Client ID и Client Secret

### 4. Добавление credentials в .env

Откройте файл `.env` и добавьте:

```env
GOOGLE_CLIENT_ID="ваш-client-id"
GOOGLE_CLIENT_SECRET="ваш-client-secret"
```

### 5. Перезапуск сервера

После добавления credentials перезапустите сервер разработки:

```bash
npm run dev
```

## Тестирование

1. Откройте `http://localhost:3000/login`
2. Нажмите "Войти через Google"
3. Выберите Google аккаунт
4. Разрешите доступ к данным
5. Вы будете перенаправлены на главную страницу

## Важные замечания

- **Безопасность**: Никогда не коммитьте `.env` файл в Git
- **Продакшен**: Обязательно измените `JWT_SECRET` на случайную строку
- **HTTPS**: В продакшене используйте только HTTPS
- **Домены**: Добавьте все домены в Authorized redirect URIs

## Возможные ошибки

### Error: redirect_uri_mismatch
- Проверьте, что redirect URI в Google Console точно совпадает с вашим URL
- Убедитесь, что нет лишних слешей в конце URL

### Error: invalid_client
- Проверьте правильность GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET
- Убедитесь, что credentials активны в Google Console

### Error: access_denied
- Пользователь отклонил доступ
- Проверьте, что пользователь добавлен в список тестовых пользователей (для External apps)
