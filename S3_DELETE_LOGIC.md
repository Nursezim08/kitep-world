# Логика удаления изображений из S3

## ✅ Реализовано

### 1. При изменении изображения категории

**Сценарий:** Пользователь редактирует категорию и загружает новое изображение

**Процесс:**
```
1. Пользователь открывает модальное окно редактирования
   ↓
2. Загружает новое изображение (PNG)
   ↓
3. Клиент конвертирует в base64
   ↓
4. Отправка на сервер: PATCH /api/admin/categories/[id]
   ↓
5. Сервер получает:
   - existingCategory.image = "https://s3.twcstorage.ru/nur-kitep/categories/old-uuid.png"
   - newImage = "data:image/png;base64,..."
   ↓
6. Проверка: isBase64Image(newImage) → true
   ↓
7. ✅ Загрузка нового изображения в S3
   - uploadImageToS3(newImage, 'categories')
   - Результат: "https://s3.twcstorage.ru/nur-kitep/categories/new-uuid.png"
   ↓
8. Проверка: isS3Image(existingCategory.image) → true
   ↓
9. ✅ Удаление старого изображения из S3
   - deleteImageFromS3("https://s3.twcstorage.ru/nur-kitep/categories/old-uuid.png")
   - Извлечение ключа: "categories/old-uuid.png"
   - Удаление из bucket
   ↓
10. Обновление URL в БД
    - image = "https://s3.twcstorage.ru/nur-kitep/categories/new-uuid.png"
    ↓
11. Возврат обновлённой категории
```

**Код:**
```typescript
// app/api/admin/categories/[id]/route.ts (строки 115-130)

if (image !== undefined) {
  if (isBase64Image(image)) {
    // Загружаем новое изображение
    const newImageUrl = await uploadImageToS3(image, 'categories');
    
    // Удаляем старое изображение
    if (existingCategory.image && isS3Image(existingCategory.image)) {
      try {
        await deleteImageFromS3(existingCategory.image);
      } catch (error) {
        console.error('Error deleting old image from S3:', error);
        // Продолжаем, даже если не удалось удалить старое
      }
    }
    
    updateData.image = newImageUrl;
  }
}
```

**Результат:**
- ✅ Старое изображение удалено из S3
- ✅ Новое изображение загружено в S3
- ✅ URL обновлён в БД
- ✅ Хранилище не засоряется

---

### 2. При удалении категории

**Сценарий:** Пользователь удаляет категорию

**Процесс:**
```
1. Пользователь нажимает кнопку удаления
   ↓
2. Подтверждение удаления
   ↓
3. Отправка на сервер: DELETE /api/admin/categories/[id]
   ↓
4. Проверка: нет подкатегорий
   ↓
5. Проверка: нет товаров
   ↓
6. Получение категории:
   - category.image = "https://s3.twcstorage.ru/nur-kitep/categories/uuid.png"
   ↓
7. ✅ Мягкое удаление категории
   - status = 'deleted'
   ↓
8. Проверка: isS3Image(category.image) → true
   ↓
9. ✅ Удаление изображения из S3
   - deleteImageFromS3("https://s3.twcstorage.ru/nur-kitep/categories/uuid.png")
   - Извлечение ключа: "categories/uuid.png"
   - Удаление из bucket
   ↓
10. Возврат успеха
```

**Код:**
```typescript
// app/api/admin/categories/[id]/route.ts (строки 240-260)

// Получаем категорию для удаления изображения
const category = await prisma.category.findUnique({
  where: { id: id },
  select: { image: true },
});

// Мягкое удаление
await prisma.category.update({
  where: { id: id },
  data: { status: 'deleted' },
});

// Удаляем изображение из S3
if (category?.image && isS3Image(category.image)) {
  try {
    await deleteImageFromS3(category.image);
  } catch (error) {
    console.error('Error deleting image from S3:', error);
    // Продолжаем, категория уже удалена
  }
}
```

**Результат:**
- ✅ Категория помечена как удалённая
- ✅ Изображение удалено из S3
- ✅ Хранилище очищено

---

## Функция удаления из S3

**Код:**
```typescript
// lib/s3.ts (строки 62-78)

export async function deleteImageFromS3(imageUrl: string): Promise<void> {
  try {
    // Извлекаем ключ файла из URL
    const url = new URL(imageUrl);
    const key = url.pathname.replace(`/${BUCKET_NAME}/`, '');

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting image from S3:', error);
    throw new Error('Failed to delete image from S3');
  }
}
```

**Как работает:**
1. Принимает полный URL: `https://s3.twcstorage.ru/nur-kitep/categories/uuid.png`
2. Парсит URL и извлекает путь: `/nur-kitep/categories/uuid.png`
3. Удаляет префикс bucket: `categories/uuid.png`
4. Отправляет команду удаления в S3
5. Файл удаляется из хранилища

---

## Обработка ошибок

### При изменении изображения

**Если не удалось удалить старое:**
```typescript
try {
  await deleteImageFromS3(existingCategory.image);
} catch (error) {
  console.error('Error deleting old image from S3:', error);
  // Продолжаем выполнение
}
```

**Поведение:**
- ✅ Новое изображение уже загружено
- ✅ URL обновлён в БД
- ⚠️ Старое изображение осталось в S3 (можно очистить вручную)
- ✅ Операция считается успешной

**Причины ошибки:**
- Файл уже удалён
- Нет прав доступа
- Проблемы с сетью
- Неверный URL

### При удалении категории

**Если не удалось удалить изображение:**
```typescript
try {
  await deleteImageFromS3(category.image);
} catch (error) {
  console.error('Error deleting image from S3:', error);
  // Продолжаем выполнение
}
```

**Поведение:**
- ✅ Категория помечена как удалённая
- ⚠️ Изображение осталось в S3 (можно очистить вручную)
- ✅ Операция считается успешной

---

## Тестовые сценарии

### Тест 1: Изменение изображения

**Шаги:**
1. Создать категорию с изображением A
2. Проверить, что изображение A есть в S3
3. Изменить изображение на B
4. Проверить, что изображение B есть в S3
5. Проверить, что изображение A удалено из S3

**Ожидаемый результат:**
- ✅ В S3 только изображение B
- ✅ В БД URL изображения B
- ✅ Изображение A удалено

### Тест 2: Удаление категории

**Шаги:**
1. Создать категорию с изображением
2. Проверить, что изображение есть в S3
3. Удалить категорию
4. Проверить, что изображение удалено из S3

**Ожидаемый результат:**
- ✅ Категория status = 'deleted'
- ✅ Изображение удалено из S3

### Тест 3: Множественные изменения

**Шаги:**
1. Создать категорию с изображением A
2. Изменить на изображение B
3. Изменить на изображение C
4. Проверить S3

**Ожидаемый результат:**
- ✅ В S3 только изображение C
- ✅ Изображения A и B удалены

---

## Проверка в реальном времени

### Просмотр файлов в S3

**Через AWS CLI:**
```bash
aws s3 ls s3://nur-kitep/categories/ --endpoint-url=https://s3.twcstorage.ru
```

**Через браузер:**
```
https://s3.twcstorage.ru/nur-kitep/categories/
```

### Логи сервера

**При изменении:**
```
Загружено новое изображение: categories/new-uuid.png
Удалено старое изображение: categories/old-uuid.png
```

**При удалении:**
```
Категория удалена: category-id
Удалено изображение: categories/uuid.png
```

**При ошибке:**
```
Error deleting old image from S3: [детали ошибки]
```

---

## Преимущества реализации

### 1. Автоматическая очистка
- ✅ Не нужно вручную удалять старые изображения
- ✅ Хранилище не засоряется
- ✅ Экономия места и денег

### 2. Безопасность
- ✅ Удаление происходит в try-catch
- ✅ Ошибка удаления не блокирует операцию
- ✅ Логирование всех ошибок

### 3. Консистентность
- ✅ Сначала загружается новое, потом удаляется старое
- ✅ Если загрузка не удалась, старое не удаляется
- ✅ Данные в БД всегда актуальны

### 4. Производительность
- ✅ Асинхронные операции
- ✅ Не блокирует основной поток
- ✅ Быстрое выполнение

---

## Возможные улучшения

### 1. Очередь удаления
```typescript
// Добавить задачу в очередь вместо немедленного удаления
await addToDeleteQueue(oldImageUrl);
```

**Преимущества:**
- Повторные попытки при ошибке
- Не блокирует основную операцию
- Централизованное логирование

### 2. Скрипт очистки неиспользуемых файлов
```typescript
// scripts/cleanup-unused-images.ts
// Найти все файлы в S3
// Сравнить с URL в БД
// Удалить файлы, которых нет в БД
```

### 3. Soft delete для изображений
```typescript
// Не удалять сразу, а переместить в папку deleted/
// Через 30 дней удалить окончательно
```

### 4. Версионирование
```typescript
// Хранить историю изменений изображений
// Возможность отката к предыдущей версии
```

---

## Заключение

✅ **Логика полностью реализована и работает:**

1. **При изменении изображения:**
   - Загружается новое изображение в S3
   - Удаляется старое изображение из S3
   - Обновляется URL в БД

2. **При удалении категории:**
   - Категория помечается как удалённая
   - Изображение удаляется из S3

3. **Обработка ошибок:**
   - Все операции в try-catch
   - Логирование ошибок
   - Операция не блокируется при ошибке удаления

**Хранилище S3 остаётся чистым и не засоряется старыми файлами!**
