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
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Создана иконка ${size}x${size}`);
    }
    
    console.log('\n🎉 Все иконки успешно созданы!');
    console.log(`📁 Иконки сохранены в: ${outputDir}`);
  } catch (error) {
    console.error('❌ Ошибка при генерации иконок:', error);
    process.exit(1);
  }
}

generateIcons();
