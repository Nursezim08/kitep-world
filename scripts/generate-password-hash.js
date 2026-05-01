// Скрипт для генерации хеша пароля для админа
// Использование: node scripts/generate-password-hash.js <password>

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('❌ Ошибка: Укажите пароль');
  console.log('Использование: node scripts/generate-password-hash.js <password>');
  console.log('Пример: node scripts/generate-password-hash.js admin123');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);

console.log('\n✅ Хеш пароля успешно сгенерирован!\n');
console.log('Пароль:', password);
console.log('Хеш:', hash);
console.log('\nИспользуйте этот хеш в SQL запросе для создания админа:');
console.log(`\nINSERT INTO users (
  id, full_name, email, email_verified, role, 
  password_hash, telegram_id, status, created_at, updated_at
)
VALUES (
  gen_random_uuid(),
  'Администратор',
  'admin@kitep.kg',
  true,
  'admin',
  '${hash}',
  'YOUR_TELEGRAM_USER_ID',
  'active',
  NOW(),
  NOW()
);\n`);
