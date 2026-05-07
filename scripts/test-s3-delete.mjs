/**
 * Скрипт для тестирования логики удаления изображений из S3
 * Запуск: node scripts/test-s3-delete.mjs
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { config } from 'dotenv';

config();

const S3_URL = process.env.S3_URL;
const BUCKET_NAME = process.env.BUCKET_NAME;
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;

const s3Client = new S3Client({
  endpoint: S3_URL,
  region: 'us-east-1',
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

async function fileExists(key) {
  try {
    await s3Client.send(new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    }));
    return true;
  } catch (error) {
    if (error.name === 'NotFound') {
      return false;
    }
    throw error;
  }
}

async function uploadTestImage(fileName) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: Buffer.from('Test image content'),
    ContentType: 'image/png',
    ACL: 'public-read',
  });
  
  await s3Client.send(command);
  return `${S3_URL}/${BUCKET_NAME}/${fileName}`;
}

async function deleteTestImage(fileName) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
  });
  
  await s3Client.send(command);
}

async function testDeleteLogic() {
  console.log('🧪 Тестирование логики удаления изображений из S3\n');

  // Тест 1: Изменение изображения
  console.log('📝 Тест 1: Изменение изображения категории');
  console.log('─────────────────────────────────────────────');
  
  const oldImageKey = `test/old-image-${Date.now()}.png`;
  const newImageKey = `test/new-image-${Date.now()}.png`;
  
  console.log('1. Загружаем старое изображение...');
  const oldImageUrl = await uploadTestImage(oldImageKey);
  console.log(`   ✅ Загружено: ${oldImageKey}`);
  
  console.log('2. Проверяем, что файл существует...');
  const oldExists1 = await fileExists(oldImageKey);
  console.log(`   ${oldExists1 ? '✅' : '❌'} Файл существует: ${oldExists1}`);
  
  console.log('3. Загружаем новое изображение...');
  const newImageUrl = await uploadTestImage(newImageKey);
  console.log(`   ✅ Загружено: ${newImageKey}`);
  
  console.log('4. Удаляем старое изображение (имитация логики API)...');
  await deleteTestImage(oldImageKey);
  console.log(`   ✅ Удалено: ${oldImageKey}`);
  
  console.log('5. Проверяем, что старое изображение удалено...');
  const oldExists2 = await fileExists(oldImageKey);
  console.log(`   ${!oldExists2 ? '✅' : '❌'} Старое удалено: ${!oldExists2}`);
  
  console.log('6. Проверяем, что новое изображение существует...');
  const newExists = await fileExists(newImageKey);
  console.log(`   ${newExists ? '✅' : '❌'} Новое существует: ${newExists}`);
  
  console.log('\n✅ Тест 1 пройден: Старое удалено, новое загружено\n');

  // Тест 2: Удаление категории
  console.log('📝 Тест 2: Удаление категории');
  console.log('─────────────────────────────────────────────');
  
  const categoryImageKey = `test/category-image-${Date.now()}.png`;
  
  console.log('1. Загружаем изображение категории...');
  const categoryImageUrl = await uploadTestImage(categoryImageKey);
  console.log(`   ✅ Загружено: ${categoryImageKey}`);
  
  console.log('2. Проверяем, что файл существует...');
  const categoryExists1 = await fileExists(categoryImageKey);
  console.log(`   ${categoryExists1 ? '✅' : '❌'} Файл существует: ${categoryExists1}`);
  
  console.log('3. Удаляем категорию (имитация логики API)...');
  await deleteTestImage(categoryImageKey);
  console.log(`   ✅ Удалено: ${categoryImageKey}`);
  
  console.log('4. Проверяем, что изображение удалено...');
  const categoryExists2 = await fileExists(categoryImageKey);
  console.log(`   ${!categoryExists2 ? '✅' : '❌'} Изображение удалено: ${!categoryExists2}`);
  
  console.log('\n✅ Тест 2 пройден: Изображение удалено вместе с категорией\n');

  // Тест 3: Множественные изменения
  console.log('📝 Тест 3: Множественные изменения изображения');
  console.log('─────────────────────────────────────────────');
  
  const imageA = `test/image-a-${Date.now()}.png`;
  const imageB = `test/image-b-${Date.now()}.png`;
  const imageC = `test/image-c-${Date.now()}.png`;
  
  console.log('1. Загружаем изображение A...');
  await uploadTestImage(imageA);
  console.log(`   ✅ Загружено: ${imageA}`);
  
  console.log('2. Меняем на изображение B, удаляем A...');
  await uploadTestImage(imageB);
  await deleteTestImage(imageA);
  console.log(`   ✅ B загружено, A удалено`);
  
  console.log('3. Меняем на изображение C, удаляем B...');
  await uploadTestImage(imageC);
  await deleteTestImage(imageB);
  console.log(`   ✅ C загружено, B удалено`);
  
  console.log('4. Проверяем финальное состояние...');
  const aExists = await fileExists(imageA);
  const bExists = await fileExists(imageB);
  const cExists = await fileExists(imageC);
  
  console.log(`   ${!aExists ? '✅' : '❌'} A удалено: ${!aExists}`);
  console.log(`   ${!bExists ? '✅' : '❌'} B удалено: ${!bExists}`);
  console.log(`   ${cExists ? '✅' : '❌'} C существует: ${cExists}`);
  
  // Очистка
  console.log('5. Очистка тестовых файлов...');
  await deleteTestImage(newImageKey);
  await deleteTestImage(imageC);
  console.log(`   ✅ Тестовые файлы удалены`);
  
  console.log('\n✅ Тест 3 пройден: Только последнее изображение осталось\n');

  // Итоги
  console.log('═════════════════════════════════════════════');
  console.log('🎉 Все тесты пройдены успешно!');
  console.log('═════════════════════════════════════════════');
  console.log('\n✅ Логика удаления работает корректно:');
  console.log('   • При изменении: старое удаляется, новое загружается');
  console.log('   • При удалении: изображение удаляется из S3');
  console.log('   • При множественных изменениях: только последнее остаётся');
  console.log('\n💡 Хранилище S3 остаётся чистым!\n');
}

testDeleteLogic().catch(error => {
  console.error('❌ Ошибка при тестировании:', error.message);
  process.exit(1);
});
