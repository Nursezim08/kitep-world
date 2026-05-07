# Руководство по панели менеджера

## Обзор

Полноценная панель управления для менеджеров филиалов со светлой темой и структурой, аналогичной админской панели.

## Структура

```
app/manager/
├── (dashboard)/                    # Route group для страниц с sidebar
│   ├── layout.tsx                  # Layout с проверкой авторизации
│   ├── ManagerLayout.tsx           # Client component с sidebar и header
│   ├── dashboard/                  # Главная страница
│   │   ├── page.tsx
│   │   └── ManagerDashboardClient.tsx
│   ├── orders/                     # Заказы
│   │   ├── page.tsx
│   │   └── ManagerOrdersClient.tsx
│   ├── products/                   # Товары
│   │   ├── page.tsx
│   │   └── ManagerProductsClient.tsx
│   ├── inventory/                  # Склад
│   │   ├── page.tsx
│   │   └── ManagerInventoryClient.tsx
│   ├── reports/                    # Отчеты
│   │   ├── page.tsx
│   │   └── ManagerReportsClient.tsx
│   └── profile/                    # Профиль
│       ├── page.tsx
│       └── ManagerProfileClient.tsx
├── login/                          # Вход (без sidebar)
│   └── page.tsx
├── verify/                         # Подтверждение (без sidebar)
│   └── page.tsx
└── branch/[id]/                    # Старая страница (redirect)
    └── page.tsx
```

## Страницы

### 1. Дашборд (`/manager/dashboard`)

**Функционал:**
- Статистика: заказы сегодня, товары на складе, выручка, низкий остаток
- Последние заказы с статусами (завершен, в обработке, ожидает)
- Товары с низким остатком (с прогресс-барами)
- Лента последней активности

**Компоненты:**
- 4 карточки статистики с иконками
- Таблица последних заказов
- Список товаров с низким остатком
- Лента активности с иконками по типу

### 2. Заказы (`/manager/orders`)

**Функционал:**
- Таблица всех заказов филиала
- Поиск по номеру заказа или клиенту
- Фильтр по статусу (все, ожидает, в обработке, завершен, отменен)
- Кнопка экспорта данных
- Просмотр деталей заказа
- Пагинация

**Статусы заказов:**
- `completed` - Завершен (зеленый)
- `processing` - В обработке (синий)
- `pending` - Ожидает (оранжевый)
- `cancelled` - Отменен (красный)

### 3. Товары (`/manager/products`)

**Функционал:**
- Сетка товаров с карточками
- Поиск товаров
- Информация: название, SKU, категория, цена, остаток
- Кнопки редактирования и удаления
- Кнопка добавления нового товара

**Отображение:**
- Карточки 3 в ряд на desktop
- Placeholder изображения товара
- Категория в виде бейджа
- Цена крупным шрифтом

### 4. Склад (`/manager/inventory`)

**Функционал:**
- Статистика: всего товаров, низкий остаток, нет в наличии, общая стоимость
- Список товаров с низким остатком
- Прогресс-бары остатков
- Кнопки заказа товаров

**Алерты:**
- Оранжевые карточки для товаров с низким остатком
- Прогресс-бар показывает текущий/минимальный остаток
- Кнопка "Заказать" для быстрого пополнения

### 5. Отчеты (`/manager/reports`)

**Функционал:**
- Отчет по продажам (за месяц)
- Отчет по заказам (за неделю)
- Отчет по товарам (за месяц)
- Финансовый отчет (за квартал)
- Кнопки скачивания отчетов

**Отображение:**
- Карточки 2 в ряд
- Иконки по типу отчета
- Период отчета
- Кнопка скачивания

### 6. Профиль (`/manager/profile`)

**Функционал:**
- Просмотр личной информации
- Информация о филиале
- Редактирование данных (в разработке)

**Поля:**
- Полное имя
- Email
- Телефон
- Филиал
- Код филиала

## Дизайн

### Цветовая схема (светлая тема)

**Основные цвета:**
- Primary: `#3b82f6` (blue-500)
- Secondary: `#2563eb` (blue-600)
- Success: `#10b981` (green-500)
- Warning: `#f59e0b` (orange-500)
- Danger: `#ef4444` (red-500)

**Фоны:**
- Основной: `gradient-to-br from-blue-50 to-indigo-50`
- Карточки: `white` с `border-gray-200`
- Hover: `shadow-xl` с цветными тенями

**Текст:**
- Заголовки: `text-gray-900`
- Основной: `text-gray-600`
- Вторичный: `text-gray-500`

### Компоненты

**Sidebar:**
- Фиксированная на desktop
- Выдвижная на mobile
- Белый фон с градиентными карточками
- Активная страница: синий фон с белым текстом
- Hover: белый фон с тенью

**Header:**
- Фиксированный сверху
- Белый фон с тенью
- Поиск в центре
- Уведомления и профиль справа

**Карточки:**
- Белый фон
- Серая граница
- Скругленные углы (rounded-2xl)
- Hover: тень и масштабирование

**Кнопки:**
- Primary: синий фон, белый текст
- Secondary: серый фон, темный текст
- Danger: красный фон, белый текст
- Hover: темнее + тень

## API Endpoints

### GET /api/manager/my-branch

Получение филиала текущего менеджера.

**Response:**
```json
{
  "branchId": "uuid",
  "branch": {
    "id": "uuid",
    "name": "Филиал Бишкек-1",
    "code": "BSK-001"
  }
}
```

### GET /api/manager/branch/[id]

Получение данных конкретного филиала (с проверкой доступа).

**Response:**
```json
{
  "branch": {
    "id": "uuid",
    "name": "Филиал Бишкек-1",
    "code": "BSK-001",
    "city": "Бишкек",
    "district": "Ленинский",
    "address": "ул. Чуй 123",
    "phone": "+996 555 123 456",
    "email": "branch1@example.com",
    "openTime": "09:00:00",
    "closeTime": "18:00:00",
    "workDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
    "status": "active",
    "branchUsers": [...]
  }
}
```

## Навигация

**Меню:**
1. Дашборд - `/manager/dashboard`
2. Заказы - `/manager/orders`
3. Товары - `/manager/products`
4. Склад - `/manager/inventory`
5. Отчеты - `/manager/reports`
6. Профиль - `/manager/profile`

**Автоматическая подсветка:**
- Активная страница выделяется синим цветом
- Используется `usePathname()` для определения текущей страницы

## Адаптивность

**Desktop (lg+):**
- Sidebar всегда видна
- Header фиксирован
- Контент занимает оставшееся пространство

**Tablet (md):**
- Sidebar скрыта, открывается кнопкой
- Header адаптируется
- Сетки становятся 2 колонки

**Mobile (sm):**
- Sidebar выдвижная с overlay
- Поиск скрыт
- Сетки становятся 1 колонка
- Таблицы прокручиваются горизонтально

## Безопасность

**Проверки в layout:**
```typescript
// Проверка авторизации
if (!user) {
  redirect('/manager/login');
}

// Проверка роли
if (user.role !== 'manager') {
  redirect('/');
}
```

**Проверки в API:**
- Авторизация через JWT токен
- Проверка роли manager
- Проверка доступа к филиалу через `branch_users`

## Использование

### Вход менеджера

1. Откройте `/manager/login`
2. Введите email и пароль
3. Введите код из email
4. Автоматический переход на `/manager/dashboard`

### Навигация

- Используйте боковое меню для перехода между страницами
- На mobile нажмите кнопку меню (☰) для открытия sidebar
- Активная страница подсвечивается синим

### Выход

- Нажмите кнопку "Выйти" внизу sidebar
- Автоматический переход на `/manager/login`

## Разработка

### Добавление новой страницы

1. Создайте папку в `app/manager/(dashboard)/`
2. Создайте `page.tsx` (server component)
3. Создайте `ClientComponent.tsx` (client component)
4. Добавьте пункт в `menuItems` в `ManagerLayout.tsx`

**Пример:**
```typescript
// app/manager/(dashboard)/new-page/page.tsx
import NewPageClient from './NewPageClient';

export default function NewPage() {
  return <NewPageClient />;
}

// app/manager/(dashboard)/new-page/NewPageClient.tsx
'use client';

export default function NewPageClient() {
  return (
    <div>
      <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
        Новая страница
      </h2>
      {/* Контент */}
    </div>
  );
}
```

### Стилизация

Используйте Tailwind CSS классы:

**Карточка:**
```tsx
<div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl transition-all">
  {/* Контент */}
</div>
```

**Кнопка:**
```tsx
<button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium text-sm shadow-lg shadow-blue-500/30">
  Действие
</button>
```

**Статистика:**
```tsx
<div className="bg-white rounded-xl p-6 border border-gray-200">
  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
    <Icon className="text-blue-600" size={24} />
  </div>
  <p className="text-gray-600 text-sm font-medium mb-1">Заголовок</p>
  <p className="text-3xl font-bold text-gray-900">Значение</p>
</div>
```

## Следующие шаги

- [ ] Интеграция с реальными API
- [ ] Добавление фильтров и сортировки
- [ ] Детальные страницы заказов
- [ ] Редактирование товаров
- [ ] Генерация отчетов
- [ ] Уведомления в реальном времени
- [ ] Графики и диаграммы
- [ ] Экспорт данных в Excel/PDF
