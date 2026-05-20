const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else if (file.endsWith('.ts')) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

const apiDir = path.join(__dirname, 'app', 'api');
const files = getAllFiles(apiDir);

let fixedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Проверяем, есть ли импорт PrismaClient и нет ли уже finally блока
  if (content.includes('import { PrismaClient }') && 
      content.includes('const prisma = new PrismaClient()') &&
      !content.includes('finally {')) {
    
    // Ищем паттерн catch блока без finally
    const catchPattern = /(\}\s*catch\s*\([^)]+\)\s*\{[^}]*\}\s*)(\})/g;
    
    if (catchPattern.test(content)) {
      content = content.replace(
        catchPattern,
        '$1 finally {\n    // Закрываем соединение после использования\n    await prisma.$disconnect();\n  }\n$2'
      );
      
      fs.writeFileSync(file, content, 'utf8');
      console.log(`✓ Fixed: ${path.relative(__dirname, file)}`);
      fixedCount++;
    }
  }
});

console.log(`\nCompleted! Fixed ${fixedCount} files.`);
