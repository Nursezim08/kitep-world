/**
 * Скрипт для тестирования подключения к S3
 * Запуск: node scripts/test-s3.mjs
 */

import { S3Client, ListBucketsCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { config } from 'dotenv';

// Загружаем переменные окружения
config();

const S3_URL = process.env.S3_URL || 'https://s3.twcstorage.ru';
const BUCKET_NAME = process.env.BUCKET_NAME || 'nur-kitep';
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || '';
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY || '';

console.log('🔧 Конфигурация S3:');
console.log(`   Endpoint: ${S3_URL}`);
console.log(`   Bucket: ${BUCKET_NAME}`);
console.log(`   Access Key: ${S3_ACCESS_KEY.substring(0, 8)}...`);
console.log('');

// Инициализация клиента
const s3Client = new S3Client({
  endpoint: S3_URL,
  region: 'us-east-1',
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

async function testS3Connection() {
  try {
    console.log('1️⃣ Тестирование подключения к S3...');
    
    // Попытка получить список buckets
    const listCommand = new ListBucketsCommand({});
    const listResponse = await s3Client.send(listCommand);
    
    console.log('✅ Подключение успешно!');
    console.log(`   Найдено buckets: ${listResponse.Buckets?.length || 0}`);
    
    if (listResponse.Buckets) {
      listResponse.Buckets.forEach(bucket => {
        console.log(`   - ${bucket.Name}`);
      });
    }
    console.log('');

    // Тест загрузки файла
    console.log('2️⃣ Тестирование загрузки файла...');
    
    const testFileName = `test/test-${Date.now()}.txt`;
    const testContent = 'Это тестовый файл для проверки S3';
    
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: testFileName,
      Body: Buffer.from(testContent),
      ContentType: 'text/plain',
      ACL: 'public-read',
    });
    
    await s3Client.send(putCommand);
    
    const fileUrl = `${S3_URL}/${BUCKET_NAME}/${testFileName}`;
    console.log('✅ Файл успешно загружен!');
    console.log(`   URL: ${fileUrl}`);
    console.log('');

    // Тест удаления файла
    console.log('3️⃣ Тестирование удаления файла...');
    
    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: testFileName,
    });
    
    await s3Client.send(deleteCommand);
    
    console.log('✅ Файл успешно удалён!');
    console.log('');

    console.log('🎉 Все тесты пройдены успешно!');
    console.log('');
    console.log('Теперь можно использовать S3 для загрузки изображений категорий.');
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании S3:');
    console.error(`   ${error.message}`);
    if (error.$metadata) {
      console.error(`   HTTP Status: ${error.$metadata.httpStatusCode}`);
    }
    console.error('');
    console.error('Проверьте:');
    console.error('1. Правильность переменных окружения в .env');
    console.error('2. Доступность S3 endpoint');
    console.error('3. Права доступа к bucket');
    process.exit(1);
  }
}

testS3Connection();
