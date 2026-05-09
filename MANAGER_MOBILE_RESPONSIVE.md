# Адаптивная панель менеджера

## Обзор

Панель менеджера полностью адаптирована для мобильных устройств и планшетов с нижней навигацией в стиле нативных мобильных приложений.

## Нижняя навигация

### Дизайн
- **Позиция**: Фиксированная внизу экрана (`fixed bottom-0`)
- **Высота**: 64px (`h-16`)
- **Фон**: Белый с тенью и верхней границей
- **Z-index**: 50 (поверх контента)

### Пункты меню
1. **Главная** - Дашборд с статистикой
2. **Заказы** - Управление заказами
3. **Товары** - Управление товарами и остатками
4. **Отчеты** - Аналитика и отчеты
5. **Склад** - Управление складом (вместо "Склад" в требованиях)

### Визуальные состояния
- **Активный**: Синий цвет (`text-blue-600`), жирная иконка
- **Неактивный**: Серый цвет (`text-gray-500`)
- **Иконки**: 20px размер
- **Текст**: 10px шрифт

## Breakpoints

### Мобильные (< 1024px)
- Нижняя навигация видна
- Header скрыт
- Боковая панель скрыта
- 1-2 колонки в сетках
- Компактные размеры текста и отступов

### Десктоп (≥ 1024px)
- Нижняя навигация скрыта
- Header видим
- Боковая панель видима
- 3-4 колонки в сетках
- Стандартные размеры

## Адаптивные компоненты

### Dashboard
```tsx
// Статистика
grid-cols-1 sm:grid-cols-2 lg:grid-cols-4

// Карточки
p-4 sm:p-6
text-xs sm:text-sm
```

### Заказы
```tsx
// Таблица → Карточки
<div className="hidden lg:block">Таблица</div>
<div className="lg:hidden">Карточки</div>

// Статистика
grid-cols-2 lg:grid-cols-4
```

### Товары
```tsx
// Сетка товаров
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4

// Карточки
p-4 sm:p-5
text-sm sm:text-base
```

### Отчеты
```tsx
// Сетка отчетов
grid-cols-1 sm:grid-cols-2

// Карточки
p-4 sm:p-6
```

### Профиль
```tsx
// Layout
grid-cols-1 lg:grid-cols-3

// Аватар
w-20 h-20 sm:w-24 sm:h-24
```

## Технические детали

### Layout
```tsx
// Отступ снизу для нижней навигации
<main className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
  {children}
</main>

// Нижняя навигация
<nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
  <div className="grid grid-cols-5 h-16">
    {/* Пункты меню */}
  </div>
</nav>
```

### Адаптивные размеры
- **Padding**: `p-4 sm:p-6`
- **Gap**: `gap-3 sm:gap-6`
- **Text**: `text-xs sm:text-sm`
- **Icons**: `size={16} sm:size={18}`

### Цветовая схема
- **Активный**: `#3b82f6` (blue-600)
- **Неактивный**: `#6b7280` (gray-500)
- **Фон**: `#ffffff` (white)
- **Граница**: `#e5e7eb` (gray-200)

## Преимущества

✅ **Нативный UX** - Нижняя навигация как в мобильных приложениях
✅ **Полная функциональность** - Все возможности доступны на мобильных
✅ **Оптимизация** - Таблицы превращаются в карточки
✅ **Единый дизайн** - Сохранена цветовая схема
✅ **Плавные переходы** - Адаптация между breakpoints

## Файлы

### Layout
- `app/manager/(dashboard)/ManagerLayout.tsx`

### Страницы
- `app/manager/(dashboard)/dashboard/ManagerDashboardClient.tsx`
- `app/manager/(dashboard)/orders/ManagerOrdersClient.tsx`
- `app/manager/(dashboard)/products/ManagerProductsClient.tsx`
- `app/manager/(dashboard)/inventory/ManagerInventoryClient.tsx`
- `app/manager/(dashboard)/reports/ManagerReportsClient.tsx`
- `app/manager/(dashboard)/profile/ManagerProfileClient.tsx`

## Тестирование

### Проверка на разных устройствах
1. **Мобильные** (< 640px): Нижняя навигация, 1 колонка
2. **Планшеты** (640-1024px): Нижняя навигация, 2 колонки
3. **Десктоп** (≥ 1024px): Боковая панель, 3-4 колонки

### Chrome DevTools
```
Ctrl+Shift+M - Toggle device toolbar
Проверить breakpoints: 375px, 768px, 1024px, 1440px
```

## Будущие улучшения

- [ ] Свайп-жесты для навигации
- [ ] Pull-to-refresh на мобильных
- [ ] Оптимизация изображений для мобильных
- [ ] Кэширование данных для офлайн-режима
