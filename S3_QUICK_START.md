# S3 для изображений категорий - Быстрый старт

## Что изменилось?

Изображения категорий теперь автоматически загружаются в S3 вместо хранения в базе данных.

## Для пользователей

**Ничего не изменилось!** Процесс загрузки изображений остался прежним:

1. Перетащите PNG изображение в модальное окно
2. Или кликните для выбора файла
3. Изображение автоматически загрузится в S3
4. URL сохранится в базе данных

## Для разработчиков

### Использование утилиты S3

```typescript
import { uploadImageToS3, deleteImageFromS3, isS3Image, isBase64Image } from '@/lib/s3';

// Загрузка изображения
const imageUrl = await uploadImageToS3(base64Image, 'categories');
// Результат: https://s3.twcstorage.ru/nur-kitep/categories/uuid.png

// Удаление изображения
await deleteImageFromS3(imageUrl);

// Проверка типа изображения
if (isBase64Image(image)) {
  // Это base64, нужно загрузить в S3
}

if (isS3Image(url)) {
  // Это URL из S3, можно удалить
}
```

### Добавление новых типов изображений

Для товаров, баннеров и т.д.:

```typescript
// Загрузка изображения товара
const productImageUrl = await uploadImageToS3(base64Image, 'products');

// Загрузка баннера
const bannerUrl = await uploadImageToS3(base64Image, 'banners');
```

Структура в S3:
```
nur-kitep/
  ├── categories/
  │   ├── uuid1.png
  │   └── uuid2.png
  ├── products/
  │   ├── uuid3.png
  │   └── uuid4.png
  └── banners/
      └── uuid5.png
```

### Переменные окружения

Убедитесь, что в `.env` настроены:

```env
S3_URL="https://s3.twcstorage.ru"
BUCKET_NAME="nur-kitep"
S3_ACCESS_KEY="ваш_ключ"
S3_SECRET_ACCESS_KEY="ваш_секретный_ключ"
```

## Миграция существующих данных

Если в БД есть категории с base64 изображениями, они автоматически мигрируют при первом редактировании.

Или запустите скрипт миграции:

```typescript
// scripts/migrate-images-to-s3.ts
import { prisma } from '@/lib/prisma';
import { uploadImageToS3, isBase64Image } from '@/lib/s3';

async function migrateCategories() {
  const categories = await prisma.category.findMany({
    where: {
      image: { startsWith: 'data:image/' }
    }
  });

  console.log(`Найдено ${categories.length} категорий для миграции`);

  for (const category of categories) {
    if (category.image && isBase64Image(category.image)) {
      console.log(`Миграция категории ${category.id}...`);
      
      const imageUrl = await uploadImageToS3(category.image, 'categories');
      
      await prisma.category.update({
        where: { id: category.id },
        data: { image: imageUrl }
      });
      
      console.log(`✓ Категория ${category.id} мигрирована`);
    }
  }

  console.log('Миграция завершена!');
}

migrateCategories();
```

## Проверка работы

1. **Создайте новую категорию с изображением**
2. **Проверьте в БД:**
   ```sql
   SELECT id, image FROM categories WHERE id = 'your-category-id';
   ```
   Должен быть URL: `https://s3.twcstorage.ru/nur-kitep/categories/...`

3. **Откройте URL в браузере** - изображение должно загрузиться

4. **Удалите категорию** - изображение должно удалиться из S3

## Устранение проблем

### Ошибка: "Failed to upload image to S3"

**Причины:**
- Неверные credentials в `.env`
- Нет доступа к S3 endpoint
- Bucket не существует

**Решение:**
1. Проверьте переменные окружения
2. Проверьте доступ к `https://s3.twcstorage.ru`
3. Проверьте права доступа к bucket

### Изображение не отображается

**Причины:**
- Файл не загружен в S3
- Неверный URL
- Нет публичного доступа

**Решение:**
1. Проверьте URL в БД
2. Откройте URL в браузере
3. Проверьте ACL файла в S3 (должен быть `public-read`)

### Старые изображения не удаляются

**Причины:**
- Ошибка при удалении (логируется в консоль)
- Неверный формат URL

**Решение:**
1. Проверьте логи сервера
2. Удалите файлы вручную через S3 консоль
3. Запустите скрипт очистки неиспользуемых файлов

## Дополнительная информация

Полная документация: `S3_INTEGRATION.md`
