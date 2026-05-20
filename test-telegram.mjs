// Тестовый скрипт для проверки отправки сообщения в Telegram
import 'dotenv/config';

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const adminUserId = process.env.TELEGRAM_ADMIN_USER_ID;

console.log('🔍 Проверка настроек Telegram:');
console.log('Bot token:', botToken ? '✅ Установлен' : '❌ Не установлен');
console.log('Admin user ID:', adminUserId);
console.log('');

if (!botToken) {
  console.error('❌ TELEGRAM_BOT_TOKEN не установлен в .env');
  process.exit(1);
}

if (!adminUserId || adminUserId === 'YOUR_TELEGRAM_ID_HERE') {
  console.log('⚠️  TELEGRAM_ADMIN_USER_ID не настроен');
  console.log('📝 Код будет выводиться в консоль (DEV MODE)');
  console.log('');
  console.log('Чтобы получить коды в Telegram:');
  console.log('1. Откройте @userinfobot в Telegram');
  console.log('2. Отправьте любое сообщение');
  console.log('3. Скопируйте ваш ID');
  console.log('4. Добавьте в .env: TELEGRAM_ADMIN_USER_ID="ваш_id"');
  console.log('');
  process.exit(0);
}

console.log('📤 Отправка тестового сообщения...');

const testMessage = `🧪 *Тест Telegram бота*\n\nЭто тестовое сообщение от Nur-Kitep.\n\nЕсли вы видите это сообщение, бот настроен правильно! ✅`;

const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

try {
  const response = await fetch(telegramUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: adminUserId,
      text: testMessage,
      parse_mode: 'Markdown',
    }),
  });

  const data = await response.json();

  if (data.ok) {
    console.log('✅ Сообщение успешно отправлено!');
    console.log('📱 Проверьте Telegram - должно прийти тестовое сообщение');
  } else {
    console.error('❌ Ошибка отправки:', data);
    
    if (data.error_code === 400 && data.description.includes('chat not found')) {
      console.log('');
      console.log('⚠️  Ошибка: Chat not found');
      console.log('Это означает, что вы не запустили бота.');
      console.log('');
      console.log('Решение:');
      console.log('1. Откройте @nur_kitep_bot в Telegram');
      console.log('2. Нажмите кнопку "Start" или отправьте /start');
      console.log('3. Запустите этот скрипт снова');
    }
  }
} catch (error) {
  console.error('❌ Ошибка:', error.message);
}
