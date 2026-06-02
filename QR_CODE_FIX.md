# Исправление: QR-код не соответствует заказу при выдаче (10.05.2026)

## Проблема
При сканировании QR-кода заказа менеджером всегда появлялась ошибка "QR-код не соответствует этому заказу", даже при правильном QR-коде.

## Причина
Логическая ошибка в файле `app/manager/(dashboard)/orders/[id]/complete/page.tsx`:

**Что было:**
- Пользовательский QR-код содержал: `ORDER:ORD-1779710728185-808` (order_number)
- Менеджер ожидал: `ORDER:c3e7a8b9-4f5d-...` (UUID из БД)
- Сравнивались разные значения!

**Проблемный код:**
```typescript
interface OrderDetails {
  id: string;
  rawId: string;  // ❌ Это поле не приходит с API!
  // ...
}

const getExpectedQrCode = () => {
  return `ORDER:${orderDetails.rawId}`;  // ❌ Использовался несуществующий rawId
};
```

**API возвращал:**
```typescript
{
  id: "uuid...",           // UUID из БД
  orderNumber: "ORD-...",  // Номер заказа
  // ...
}
```

## Решение

### 1. Исправлен интерфейс OrderDetails
```typescript
interface OrderDetails {
  id: string;           // UUID заказа (для API запросов)
  orderNumber: string;  // Номер заказа (для QR и кода)
  // ...
}
```

### 2. Исправлены функции генерации ожидаемых значений
```typescript
const getExpectedQrCode = () => {
  if (!orderDetails) return '';
  return `ORDER:${orderDetails.orderNumber}`;  // ✅ Используем orderNumber
};

const getExpectedManualCode = () => {
  if (!orderDetails) return '';
  const digits = orderDetails.orderNumber.replace(/\D/g, '');  // ✅ Используем orderNumber
  return digits.slice(-5);
};
```

### 3. Исправлено отображение номера заказа в header
```typescript
<p className="text-xs text-gray-500">{orderDetails.orderNumber}</p>
```

### 4. Исправлен API запрос для завершения заказа
```typescript
// Используем UUID (id) для API запроса
const res = await fetch(`/api/manager/orders/${orderDetails.id}/complete`, {
  method: 'PATCH',
});
```

## Логика работы (ПОСЛЕ ИСПРАВЛЕНИЯ)

### QR-код пользователя
Генерируется в `app/(user)/orders/OrdersClient.tsx`:
```typescript
value={`ORDER:${selectedOrder.id}`}  // id = order_number (ORD-xxx)
```

### Проверка менеджером
В `app/manager/(dashboard)/orders/[id]/complete/page.tsx`:
```typescript
const expected = getExpectedQrCode();  // ORDER:ORD-xxx
const trimmed = scannedCode.trim();    // ORDER:ORD-xxx

if (trimmed === expected) {
  // ✅ Коды совпадают!
}
```

### 5-значный код
Берутся последние 5 цифр из номера заказа:
- Заказ: `ORD-1779710728185-808`
- Все цифры: `1779710728185808`
- Последние 5: `85808`

## Результат
- ✅ QR-код корректно сканируется и проверяется
- ✅ Ручной ввод 5-значного кода работает правильно
- ✅ Заказ успешно выдается после подтверждения

## Файлы изменены
- `app/manager/(dashboard)/orders/[id]/complete/page.tsx`
  - Интерфейс `OrderDetails`
  - Функция `getExpectedQrCode()`
  - Функция `getExpectedManualCode()`
  - Отображение номера заказа
  - API запрос для завершения заказа

## Тестирование
1. Пользователь создает заказ
2. Получает QR-код с номером заказа
3. Менеджер нажимает "Выдать" в списке заказов
4. Сканирует QR-код клиента
5. ✅ Система распознает код как правильный
6. Заказ успешно выдается

## Примечание
UUID заказа (`id`) используется только для:
- Ссылок в URL: `/manager/orders/{uuid}/complete`
- API запросов: `/api/manager/orders/{uuid}`

Номер заказа (`orderNumber`) используется для:
- Отображения клиенту
- QR-кода
- 5-значного кода подтверждения
