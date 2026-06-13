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
    console.log(`📐 Исходный логотип: ${metadata.width}x${metadata.height}\n`);

    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      
      // Создаём иконку с белым фоном и центрированным логотипом
      // Логотип занимает 80% от размера иконки (20% padding)
      const logoSize = Math.round(size * 0.8);
      const padding = Math.round((size - logoSize) / 2);
      
      await sharp(inputPath)
        .resize(logoSize, logoSize, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Создана иконка ${size}x${size} (логотип: ${logoSize}x${logoSize})`);
    }
    
    console.log('\n🎉 Все иконки успешно созданы!');
    console.log(`📁 Иконки сохранены в: ${outputDir}`);
    console.log('\n💡 Иконки имеют:');
    console.log('   • Белый фон');
    console.log('   • 10% padding со всех сторон');
    console.log('   • Центрированный логотип');
    console.log('   • Подходят для Android, iOS и Desktop\n');
  } catch (error) {
    console.error('❌ Ошибка при генерации иконок:', error);
    process.exit(1);
  }
}

generateIcons();
