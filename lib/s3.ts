import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Инициализация S3 клиента
const s3Client = new S3Client({
  endpoint: process.env.S3_URL!,
  region: 'us-east-1', // Регион не важен для совместимых с S3 хранилищ
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // Важно для совместимости с S3-подобными хранилищами
});

const BUCKET_NAME = process.env.BUCKET_NAME!;

/**
 * Загружает изображение в S3 из base64 строки
 * @param base64Image - Изображение в формате base64 (data:image/png;base64,...)
 * @param folder - Папка в bucket (например: 'categories', 'products')
 * @returns URL загруженного изображения
 */
export async function uploadImageToS3(
  base64Image: string,
  folder: string = 'images'
): Promise<string> {
  try {
    // Извлекаем данные из base64
    const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid base64 image format');
    }

    const imageType = matches[1]; // png, jpg, etc.
    const imageData = matches[2];
    const buffer = Buffer.from(imageData, 'base64');

    // Генерируем уникальное имя файла
    const fileName = `${folder}/${uuidv4()}.${imageType}`;

    // Загружаем в S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: `image/${imageType}`,
      ACL: 'public-read', // Делаем файл публично доступным
    });

    await s3Client.send(command);

    // Возвращаем публичный URL
    const imageUrl = `${process.env.S3_URL}/${BUCKET_NAME}/${fileName}`;
    return imageUrl;
  } catch (error) {
    console.error('Error uploading image to S3:', error);
    throw new Error('Failed to upload image to S3');
  }
}

/**
 * Удаляет изображение из S3
 * @param imageUrl - Полный URL изображения
 */
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

/**
 * Проверяет, является ли URL изображением из S3
 * @param url - URL для проверки
 */
export function isS3Image(url: string): boolean {
  try {
    return url.startsWith(process.env.S3_URL!) && url.includes(BUCKET_NAME);
  } catch {
    return false;
  }
}

/**
 * Проверяет, является ли строка base64 изображением
 * @param str - Строка для проверки
 */
export function isBase64Image(str: string): boolean {
  return str.startsWith('data:image/');
}
