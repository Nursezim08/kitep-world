import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputPath = path.join(__dirname, '..', 'public', 'logonur.png');
const outputDir = path.join(__dirname, '..', 'public', 'icons');

// Создаем папку для иконок
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🎨 Генерация иконок PWA из логотипа...\n');

async function generateIcons() {
  try {
    // Получаем информацию о исходном изображении
    const metadata = await sharp(inputPath).metadata();
    console.log(`📐 Исходный логотип: ${metadata.width}x${metadata.height}`);
    console.log(`   Формат: ${metadata.format}`);
    console.log(`   Каналы: ${metadata.channels} (${metadata.hasAlpha ? 'с прозрачностью' : 'без прозрачности'})\n`);

    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      
      // Создаём иконку с фиолетовым фоном и центрированным логотипом
      // Логотип занимает 75% от размера иконки (25% padding для безопасности)
      const logoSize = Math.round(size * 0.75);
      const padding = Math.round((size - logoSize) / 2);
      
      // Создаём базовый квадрат с фиолетовым фоном
      const background = await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 139, g: 92, b: 246, alpha: 1 } // #8b5cf6 (фиолетовый)
        }
      })
      .png()
      .toBuffer();
      
      // Изменяем размер логотипа
      const resizedLogo = await sharp(inputPath)
        .resize(logoSize, logoSize, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Прозрачный фон для логотипа
        })
        .toBuffer();
      
      // Накладываем логотип на фон
      await sharp(background)
        .composite([{
          input: resizedLogo,
          top: padding,
          left: padding
        }])
        .png({ quality: 100, compressionLevel: 9 })
        .toFile(outputPath);
      
      console.log(`✅ Создана иконка ${size}x${size} (логотип: ${logoSize}x${logoSize}, padding: ${padding}px)`);
    }
    
    console.log('\n🎉 Все иконки успешно созданы!');
    console.log(`📁 Иконки сохранены в: ${outputDir}`);
    console.log('\n💡 Иконки имеют:');
    console.log('   • Фиолетовый фон (#8b5cf6)');
    console.log('   • 12.5% padding со всех сторон');
    console.log('   • Центрированный логотип с сохранением прозрачности');
    console.log('   • Высокое качество PNG\n');
  } catch (error) {
    console.error('❌ Ошибка при генерации иконок:', error);
    process.exit(1);
  }
}

generateIcons();
