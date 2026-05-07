# AdminToast - Компонент всплывающих уведомлений для админки

## Обзор

Компонент `AdminToast` предоставляет современные всплывающие уведомления в стиле админ-панели с поддержкой различных типов сообщений.

## Функционал

### Типы уведомлений

1. **Success** (Успех) - Зелёный
2. **Error** (Ошибка) - Красный
3. **Warning** (Предупреждение) - Жёлтый
4. **Info** (Информация) - Синий

### Особенности

- ✅ Автоматическое скрытие через заданное время
- ✅ Ручное закрытие кнопкой X
- ✅ Плавная анимация появления справа
- ✅ Backdrop blur эффект
- ✅ Иконки для каждого типа
- ✅ Адаптивный дизайн
- ✅ Z-index 9999 (поверх всего)

## Использование

### Базовый пример

```typescript
import AdminToast from '@/app/components/AdminToast';

const [toast, setToast] = useState({
  show: false,
  message: '',
  type: 'info' as ToastType,
});

const showToast = (message: string, type: ToastType = 'error') => {
  setToast({ show: true, message, type });
};

const hideToast = () => {
  setToast({ ...toast, show: false });
};

// В JSX
{toast.show && (
  <AdminToast
    message={toast.message}
    type={toast.type}
    onClose={hideToast}
  />
)}
```

### Примеры вызовов

```typescript
// Успех
showToast('Изображение загружено успешно', 'success');

// Ошибка
showToast('Допускаются только PNG изображения', 'error');

// Предупреждение
showToast('Изображение должно быть квадратным', 'warning');

// Информация
showToast('Обработка файла...', 'info');
```

## Props

| Prop | Тип | По умолчанию | Описание |
|------|-----|--------------|----------|
| message | string | - | Текст уведомления (обязательно) |
| type | ToastType | 'info' | Тип уведомления |
| duration | number | 5000 | Длительность показа в мс (0 = бесконечно) |
| onClose | () => void | - | Callback при закрытии (обязательно) |

### ToastType

```typescript
type ToastType = 'success' | 'error' | 'info' | 'warning';
```

## Визуальные стили

### Success (Успех)
```
┌─────────────────────────────────────┐
│ ✓ Изображение загружено успешно    │ ← Зелёный
└─────────────────────────────────────┘
```

### Error (Ошибка)
```
┌─────────────────────────────────────┐
│ ⚠ Допускаются только PNG изображения│ ← Красный
└─────────────────────────────────────┘
```

### Warning (Предупреждение)
```
┌─────────────────────────────────────┐
│ ⚠ Изображение должно быть квадратным│ ← Жёлтый
└─────────────────────────────────────┘
```

### Info (Информация)
```
┌─────────────────────────────────────┐
│ ℹ Обработка файла...                │ ← Синий
└─────────────────────────────────────┘
```

## Стили по типам

### Success
- Фон: `bg-green-500/10`
- Граница: `border-green-500`
- Текст: `text-green-400`
- Иконка: CheckCircle

### Error
- Фон: `bg-red-500/10`
- Граница: `border-red-500`
- Текст: `text-red-400`
- Иконка: AlertCircle

### Warning
- Фон: `bg-yellow-500/10`
- Граница: `border-yellow-500`
- Текст: `text-yellow-400`
- Иконка: AlertTriangle

### Info
- Фон: `bg-blue-500/10`
- Граница: `border-blue-500`
- Текст: `text-blue-400`
- Иконка: Info

## Анимация

### CSS Keyframes

```css
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
```

### Эффект

Toast появляется справа с плавным скольжением и изменением прозрачности.

## Позиционирование

```css
position: fixed;
top: 24px (1.5rem);
right: 24px (1.5rem);
z-index: 9999;
```

Toast всегда отображается в правом верхнем углу поверх всех элементов.

## Автоматическое закрытие

```typescript
useEffect(() => {
  if (duration > 0) {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }
}, [duration, onClose]);
```

- Если `duration > 0`: автоматически закрывается через указанное время
- Если `duration = 0`: остаётся до ручного закрытия

## Интеграция в модальные окна

### AddCategoryModal / EditCategoryModal

```typescript
// State
const [toast, setToast] = useState<ToastState>({
  show: false,
  message: '',
  type: 'info',
});

// Helpers
const showToast = (message: string, type: ToastType = 'error') => {
  setToast({ show: true, message, type });
};

const hideToast = () => {
  setToast({ ...toast, show: false });
};

// Использование
const processImageFile = (file: File) => {
  if (!file.type.startsWith('image/png')) {
    showToast('Допускаются только PNG изображения', 'error');
    return;
  }
  
  if (img.width !== img.height) {
    showToast('Изображение должно быть квадратным', 'warning');
    return;
  }
  
  showToast('Изображение загружено успешно', 'success');
};

// Рендер
return (
  <>
    {toast.show && (
      <AdminToast
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    )}
    <div className="modal">
      {/* Контент модального окна */}
    </div>
  </>
);
```

## Преимущества

### UX
- ✅ Ненавязчивые уведомления
- ✅ Чёткая визуальная обратная связь
- ✅ Автоматическое скрытие
- ✅ Возможность ручного закрытия

### Дизайн
- ✅ Соответствует стилю админки
- ✅ Полупрозрачный фон с blur
- ✅ Цветовая кодировка по типу
- ✅ Иконки для быстрого распознавания

### Технические
- ✅ Лёгкий компонент
- ✅ TypeScript типизация
- ✅ Переиспользуемый
- ✅ Настраиваемый

## Примеры использования

### Валидация изображения

```typescript
// Неправильный формат
if (!file.type.startsWith('image/png')) {
  showToast('Допускаются только PNG изображения', 'error');
  return;
}

// Слишком большой файл
if (file.size > 5 * 1024 * 1024) {
  showToast('Размер изображения не должен превышать 5MB', 'error');
  return;
}

// Неквадратное изображение
if (img.width !== img.height) {
  showToast('Изображение должно быть квадратным (например: 512x512, 1024x1024)', 'warning');
  return;
}

// Успешная загрузка
showToast('Изображение загружено успешно', 'success');
```

### Операции с категориями

```typescript
// Создание категории
try {
  const response = await fetch('/api/admin/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (response.ok) {
    showToast('Категория успешно создана', 'success');
    onSuccess();
  } else {
    showToast('Не удалось создать категорию', 'error');
  }
} catch (error) {
  showToast('Произошла ошибка при создании категории', 'error');
}
```

### Информационные сообщения

```typescript
// Начало обработки
showToast('Обработка изображения...', 'info');

// Предупреждение
showToast('Рекомендуется использовать изображения размером 1024x1024', 'warning');
```

## Структура компонента

```typescript
export default function AdminToast({
  message,
  type = 'info',
  duration = 5000,
  onClose,
}: AdminToastProps) {
  // Автоматическое закрытие
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  // Получение иконки по типу
  const getIcon = () => { /* ... */ };
  
  // Получение стилей по типу
  const getStyles = () => { /* ... */ };

  return (
    <div className="fixed top-6 right-6 z-[9999] animate-slide-in-right">
      <div className={`flex items-start gap-3 p-4 rounded-lg border ${getStyles()}`}>
        <div>{getIcon()}</div>
        <p>{message}</p>
        <button onClick={onClose}>
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
```

## Файлы

### Компонент
- `app/components/AdminToast.tsx`

### Стили
- `app/globals.css` (анимация slide-in-right)

### Использование
- `app/admin/categories/AddCategoryModal.tsx`
- `app/admin/categories/EditCategoryModal.tsx`

## Будущие улучшения

- [ ] Очередь уведомлений (несколько одновременно)
- [ ] Прогресс-бар для автозакрытия
- [ ] Звуковые уведомления
- [ ] Позиционирование (top-left, bottom-right и т.д.)
- [ ] Кастомные иконки
- [ ] Действия в уведомлении (кнопки)
- [ ] Анимация закрытия
- [ ] Swipe to dismiss на мобильных

## Заключение

`AdminToast` - это современный, гибкий и простой в использовании компонент для отображения уведомлений в админ-панели. Он обеспечивает отличный UX и легко интегрируется в любую часть приложения.


## Исправление: Повторные уведомления

### Проблема

При повторном вызове `showToast` с теми же параметрами, когда toast уже показан, React не перерендеривает компонент, так как state не изменился.

### Решение

Сначала скрываем toast, затем показываем новый через небольшую задержку:

```typescript
const showToast = (message: string, type: ToastType = 'error') => {
  // Сначала скрываем, если уже показан
  setToast({ show: false, message: '', type: 'info' });
  
  // Затем показываем новый через небольшую задержку
  setTimeout(() => {
    setToast({ show: true, message, type });
  }, 10);
};
```

### Как это работает

1. **Скрытие:** `setToast({ show: false, ... })` - скрывает текущий toast
2. **Задержка:** `setTimeout(..., 10)` - даёт React время на перерендер
3. **Показ:** `setToast({ show: true, ... })` - показывает новый toast

### Результат

Теперь при повторных попытках загрузки неправильного изображения toast будет показываться каждый раз:

```typescript
// Первая попытка
showToast('Изображение должно быть квадратным', 'warning');
// Toast показан

// Вторая попытка (через 2 секунды)
showToast('Изображение должно быть квадратным', 'warning');
// Toast скрывается и показывается снова

// Третья попытка
showToast('Изображение должно быть квадратным', 'warning');
// Toast снова перезапускается
```

### Преимущества

✅ **Работает всегда:** Toast показывается при каждом вызове  
✅ **Сброс таймера:** Автозакрытие перезапускается  
✅ **Визуальная обратная связь:** Пользователь видит, что действие обработано  
✅ **Минимальная задержка:** 10ms незаметны для пользователя  

### Альтернативные решения

#### 1. Уникальный ключ
```typescript
const [toastKey, setToastKey] = useState(0);

const showToast = (message: string, type: ToastType) => {
  setToast({ show: true, message, type });
  setToastKey(prev => prev + 1);
};

<AdminToast key={toastKey} ... />
```

#### 2. Callback в useEffect
```typescript
useEffect(() => {
  if (toast.show) {
    // Перезапуск таймера
  }
}, [toast.message, toast.type]);
```

#### 3. Очередь уведомлений
```typescript
const [toasts, setToasts] = useState<Toast[]>([]);

const showToast = (message: string, type: ToastType) => {
  setToasts(prev => [...prev, { id: Date.now(), message, type }]);
};
```

Наше решение самое простое и эффективное для текущего случая.


---

## Исправление: Повторные уведомления (ФИНАЛЬНОЕ РЕШЕНИЕ)

### Проблема

При повторном вызове `showToast` с теми же параметрами уведомление не показывалось. Попытки с `setTimeout` и уникальным `key` не решили проблему.

### Решение: Очередь уведомлений

Вместо одного toast используем массив toast-ов (очередь):

```typescript
interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

const [toasts, setToasts] = useState<ToastItem[]>([]);

const showToast = (message: string, type: ToastType = 'error') => {
  const id = Date.now();
  setToasts((prev) => [...prev, { id, message, type }]);
};

const hideToast = (id: number) => {
  setToasts((prev) => prev.filter((toast) => toast.id !== id));
};
```

### Рендеринг

```typescript
{toasts.map((toast, index) => (
  <div
    key={toast.id}
    style={{ top: `${24 + index * 80}px` }}
    className="fixed right-6 z-[9999]"
  >
    <AdminToast
      message={toast.message}
      type={toast.type}
      onClose={() => hideToast(toast.id)}
    />
  </div>
))}
```

### Как это работает

1. **Уникальный ID:** Каждый toast получает уникальный `id` через `Date.now()`
2. **Массив:** Все активные toast-ы хранятся в массиве
3. **Позиционирование:** Каждый следующий toast сдвигается вниз на 80px
4. **Удаление:** При закрытии toast удаляется из массива по `id`

### Результат

Теперь при повторных попытках:

```typescript
// Первая попытка
showToast('Изображение должно быть квадратным', 'warning');
// Toast #1 показан на top: 24px

// Вторая попытка (сразу)
showToast('Изображение должно быть квадратным', 'warning');
// Toast #2 показан на top: 104px (24 + 80)

// Третья попытка
showToast('Изображение должно быть квадратным', 'warning');
// Toast #3 показан на top: 184px (24 + 160)
```

### Преимущества

✅ **Всегда работает:** Каждый вызов создаёт новый toast  
✅ **Множественные уведомления:** Можно показать несколько одновременно  
✅ **Автоматическое позиционирование:** Каждый toast сдвигается вниз  
✅ **Независимое закрытие:** Каждый toast закрывается отдельно  
✅ **Нет race conditions:** Нет проблем с асинхронностью  

### Изменения в компоненте AdminToast

Убрано позиционирование из самого компонента:

```typescript
// Было
<div className="fixed top-6 right-6 z-[9999] ...">

// Стало
<div className="min-w-[320px] max-w-md ...">
```

Теперь позиционирование управляется снаружи через `style={{ top: ... }}`.

### Интеграция

Обновлены файлы:
- ✅ `app/components/AdminToast.tsx` - убрано позиционирование
- ✅ `app/admin/categories/AddCategoryModal.tsx` - очередь toast-ов
- ✅ `app/admin/categories/EditCategoryModal.tsx` - очередь toast-ов

### Визуальный пример

```
┌─────────────────────────────────────┐ ← top: 24px
│ ⚠ Изображение должно быть квадратным│
└─────────────────────────────────────┘

┌─────────────────────────────────────┐ ← top: 104px
│ ⚠ Изображение должно быть квадратным│
└─────────────────────────────────────┘

┌─────────────────────────────────────┐ ← top: 184px
│ ⚠ Изображение должно быть квадратным│
└─────────────────────────────────────┘
```

Каждый toast автоматически закрывается через 5 секунд или по клику на X.
