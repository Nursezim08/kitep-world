# Toast Component - Компонент всплывающих уведомлений

## Обзор

Создан универсальный компонент `Toast` для отображения всплывающих уведомлений в правом верхнем углу экрана.

## Расположение

```
app/components/Toast.tsx
```

## Особенности

### ✨ Функциональность

1. **Автоматическое исчезновение**
   - По умолчанию через 5 секунд
   - Настраиваемая длительность

2. **Пауза при наведении**
   - При наведении мыши таймер останавливается
   - При уходе мыши таймер продолжается

3. **Прогресс-бар**
   - Визуальный индикатор оставшегося времени
   - Плавная анимация

4. **Типы уведомлений**
   - `info` - информационное (синее)
   - `success` - успешное (зеленое)
   - `error` - ошибка (красное)
   - `google` - Google OAuth (фиолетовое с иконкой)

5. **Плавная анимация**
   - Появление справа
   - Исчезновение вправо
   - Длительность: 300ms

## Использование

### Базовый пример

```tsx
import Toast from '@/app/components/Toast';

function MyComponent() {
  const [showToast, setShowToast] = useState(false);

  return (
    <>
      {showToast && (
        <Toast
          message="Операция выполнена успешно!"
          type="success"
          duration={5000}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
```

### Google OAuth уведомление

```tsx
{showGoogleToast && (
  <Toast
    message="Этот аккаунт зарегистрирован через Google. Используйте кнопку 'Войти через Google' ниже."
    type="google"
    duration={5000}
    onClose={() => setShowGoogleToast(false)}
  />
)}
```

### Разные типы

```tsx
// Информация
<Toast
  message="Новое сообщение получено"
  type="info"
  onClose={handleClose}
/>

// Успех
<Toast
  message="Данные сохранены"
  type="success"
  onClose={handleClose}
/>

// Ошибка
<Toast
  message="Не удалось загрузить данные"
  type="error"
  onClose={handleClose}
/>

// Google
<Toast
  message="Войдите через Google"
  type="google"
  onClose={handleClose}
/>
```

## Props

| Prop | Тип | По умолчанию | Описание |
|------|-----|--------------|----------|
| `message` | `string` | - | Текст уведомления (обязательно) |
| `type` | `'info' \| 'success' \| 'error' \| 'google'` | `'info'` | Тип уведомления |
| `duration` | `number` | `5000` | Длительность в миллисекундах |
| `onClose` | `() => void` | - | Callback при закрытии (обязательно) |

## Дизайн

### Цветовая схема

```tsx
// Info (синий)
bg-blue-50 border-blue-500 text-blue-800

// Success (зеленый)
bg-green-50 border-green-500 text-green-800

// Error (красный)
bg-red-50 border-red-500 text-red-800

// Google (фиолетовый)
bg-violet-50 border-violet-500 text-violet-900
```

### Размеры

```css
min-width: 320px
max-width: 28rem (448px)
padding: 1rem (16px)
border-width: 2px
border-radius: 1rem (16px)
```

### Позиционирование

```css
position: fixed
top: 1rem (16px)
right: 1rem (16px)
z-index: 50
```

## Анимация

### Появление

```tsx
opacity: 0 → 1
transform: translateX(100%) → translateX(0)
duration: 300ms
```

### Исчезновение

```tsx
opacity: 1 → 0
transform: translateX(0) → translateX(100%)
duration: 300ms
```

### Прогресс-бар

```tsx
width: 100% → 0%
transition: all 100ms
```

## Визуальное представление

```
┌─────────────────────────────────────┐
│  [G]  Этот аккаунт зарегистрирован │
│       через Google. Используйте     │
│       кнопку 'Войти через Google'   │
│       ниже.                         │
│                                     │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░  │ ← Прогресс
└─────────────────────────────────────┘
```

## Поведение

### Таймер

```typescript
// Запуск таймера
useEffect(() => {
  if (isPaused) return;
  
  const interval = setInterval(() => {
    // Обновление прогресса
    const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
    setProgress(remaining);
    
    // Закрытие при завершении
    if (remaining === 0) {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }
  }, 10);
  
  return () => clearInterval(interval);
}, [isPaused, duration, onClose]);
```

### Пауза при наведении

```tsx
<div
  onMouseEnter={() => setIsPaused(true)}
  onMouseLeave={() => setIsPaused(false)}
>
  {/* Контент */}
</div>
```

## Интеграция

### В странице логина

```tsx
// app/(auth)/login/page.tsx
import Toast from '@/app/components/Toast';

const [showGoogleToast, setShowGoogleToast] = useState(false);

// При ошибке Google аккаунта
if (data.useGoogleAuth) {
  setShowGoogleToast(true);
}

// Рендер
{showGoogleToast && (
  <Toast
    message="Этот аккаунт зарегистрирован через Google..."
    type="google"
    duration={5000}
    onClose={() => setShowGoogleToast(false)}
  />
)}
```

### В странице регистрации

```tsx
// app/(auth)/register/page.tsx
import Toast from '@/app/components/Toast';

const [showGoogleToast, setShowGoogleToast] = useState(false);

// При попытке регистрации с Google email
if (data.useGoogleAuth) {
  setShowGoogleToast(true);
}

// Рендер
{showGoogleToast && (
  <Toast
    message="Этот email уже зарегистрирован через Google..."
    type="google"
    duration={5000}
    onClose={() => setShowGoogleToast(false)}
  />
)}
```

## Преимущества

### 1. Универсальность
- ✅ Один компонент для всех типов уведомлений
- ✅ Легко расширяемый
- ✅ Переиспользуемый

### 2. UX
- ✅ Не блокирует интерфейс
- ✅ Автоматическое закрытие
- ✅ Пауза при наведении
- ✅ Визуальный прогресс

### 3. Дизайн
- ✅ Соответствует фирменному стилю
- ✅ Плавные анимации
- ✅ Адаптивный
- ✅ Accessibility

### 4. Производительность
- ✅ Легкий компонент
- ✅ Оптимизированные анимации
- ✅ Минимальный re-render

## Accessibility

### Семантика
```tsx
<div role="alert" aria-live="polite">
  {message}
</div>
```

### Клавиатура
- Tab для фокуса (если добавить кнопку закрытия)
- Escape для закрытия (можно добавить)

### Screen readers
- Автоматическое объявление при появлении
- Понятный текст сообщения

## Расширение функциональности

### Добавление новых типов

```tsx
// В Toast.tsx
type ToastType = 'info' | 'success' | 'error' | 'google' | 'warning';

const getTypeStyles = () => {
  switch (type) {
    case 'warning':
      return 'bg-yellow-50 border-yellow-500 text-yellow-800';
    // ...
  }
};
```

### Добавление иконок

```tsx
const getIcon = () => {
  switch (type) {
    case 'success':
      return <CheckIcon />;
    case 'error':
      return <ErrorIcon />;
    // ...
  }
};
```

### Добавление действий

```tsx
interface ToastProps {
  // ...
  action?: {
    label: string;
    onClick: () => void;
  };
}

// В компоненте
{action && (
  <button onClick={action.onClick}>
    {action.label}
  </button>
)}
```

## Тестирование

### Тест 1: Автоматическое закрытие
1. Показать toast
2. Подождать 5 секунд
3. **Ожидается:** Toast исчезает

### Тест 2: Пауза при наведении
1. Показать toast
2. Навести мышь
3. Подождать 5+ секунд
4. **Ожидается:** Toast не исчезает
5. Убрать мышь
6. **Ожидается:** Toast исчезает через оставшееся время

### Тест 3: Прогресс-бар
1. Показать toast
2. Наблюдать прогресс-бар
3. **Ожидается:** Плавное уменьшение от 100% до 0%

### Тест 4: Разные типы
1. Показать toast каждого типа
2. **Ожидается:** Правильные цвета и иконки

### Тест 5: Мобильная версия
1. Открыть на мобильном
2. Показать toast
3. **Ожидается:** Адаптивный размер, читаемый текст

## Возможные улучшения

### Краткосрочные
- [ ] Кнопка закрытия (опционально)
- [ ] Закрытие по Escape
- [ ] Звуковое уведомление
- [ ] Разные позиции (top-left, bottom-right, etc.)

### Долгосрочные
- [ ] Стек уведомлений (несколько одновременно)
- [ ] Приоритеты уведомлений
- [ ] Группировка похожих уведомлений
- [ ] Анимация между уведомлениями
- [ ] История уведомлений

## Заключение

Компонент `Toast`:
- ✅ Универсальный и переиспользуемый
- ✅ Современный UX
- ✅ Соответствует фирменному стилю
- ✅ Легко расширяемый
- ✅ Производительный

Идеально подходит для всех типов уведомлений в приложении! 🎉
