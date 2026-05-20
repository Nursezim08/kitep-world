// Тестовый скрипт для проверки входа админа
const API_URL = 'http://localhost:3000';

async function testAdminLogin() {
  console.log('🔐 Тестирование входа админа...\n');

  try {
    // Шаг 1: Попытка входа
    console.log('📧 Отправка запроса на вход...');
    const loginResponse = await fetch(`${API_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@nur-kitep.kg',
        password: 'admin123',
      }),
    });

    console.log('📊 Статус ответа:', loginResponse.status);
    
    const loginData = await loginResponse.json();
    console.log('📦 Данные ответа:', JSON.stringify(loginData, null, 2));

    if (loginResponse.ok) {
      console.log('\n✅ Вход успешен!');
      console.log('👤 User ID:', loginData.userId);
      console.log('💬 Сообщение:', loginData.message);
      console.log('\n⚠️ Проверьте консоль сервера или Telegram для кода подтверждения');
    } else {
      console.log('\n❌ Ошибка входа!');
      console.log('🔴 Код ошибки:', loginData.error);
    }
  } catch (error) {
    console.error('\n💥 ИСКЛЮЧЕНИЕ:', error.message);
    console.error('📋 Детали:', error);
  }
}

testAdminLogin();
