/**
 * Тестовый скрипт для проверки API менеджеров
 * 
 * Использование:
 * node scripts/test-managers-api.js
 */

const BASE_URL = 'http://localhost:3000';

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testGetManagers() {
  log('\n📋 Тест: Получение списка менеджеров', 'blue');
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/managers`, {
      method: 'GET',
      headers: {
        'Cookie': 'auth_token=test', // В реальности нужна валидная сессия
      },
    });

    if (response.status === 401) {
      log('⚠️  Требуется авторизация (ожидаемо)', 'yellow');
      return;
    }

    const data = await response.json();
    log(`✅ Успешно получено менеджеров: ${data.managers?.length || 0}`, 'green');
  } catch (error) {
    log(`❌ Ошибка: ${error.message}`, 'red');
  }
}

async function testGetBranches() {
  log('\n🏢 Тест: Получение списка филиалов', 'blue');
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/branches`, {
      method: 'GET',
      headers: {
        'Cookie': 'auth_token=test',
      },
    });

    if (response.status === 401) {
      log('⚠️  Требуется авторизация (ожидаемо)', 'yellow');
      return;
    }

    const data = await response.json();
    log(`✅ Успешно получено филиалов: ${data.branches?.length || 0}`, 'green');
  } catch (error) {
    log(`❌ Ошибка: ${error.message}`, 'red');
  }
}

async function testCreateManager() {
  log('\n➕ Тест: Создание менеджера', 'blue');
  
  const testManager = {
    fullName: 'Тестовый Менеджер',
    email: `test.manager.${Date.now()}@example.com`,
    phone: `+996555${Math.floor(Math.random() * 1000000)}`,
    password: 'TestPassword123',
  };

  try {
    const response = await fetch(`${BASE_URL}/api/admin/managers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'auth_token=test',
      },
      body: JSON.stringify(testManager),
    });

    if (response.status === 401) {
      log('⚠️  Требуется авторизация (ожидаемо)', 'yellow');
      return;
    }

    const data = await response.json();
    
    if (response.ok) {
      log('✅ Менеджер успешно создан', 'green');
      log(`   ID: ${data.manager?.id}`, 'green');
      log(`   Email: ${data.manager?.email}`, 'green');
    } else {
      log(`❌ Ошибка создания: ${data.error}`, 'red');
    }
  } catch (error) {
    log(`❌ Ошибка: ${error.message}`, 'red');
  }
}

async function checkEndpoints() {
  log('\n🔍 Проверка доступности endpoints', 'blue');
  
  const endpoints = [
    { method: 'GET', path: '/api/admin/managers' },
    { method: 'POST', path: '/api/admin/managers' },
    { method: 'GET', path: '/api/admin/branches' },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const status = response.status;
      const statusText = status === 401 ? '🔒 Требует авторизации' : 
                        status === 404 ? '❌ Не найден' :
                        status === 200 ? '✅ Доступен' : 
                        `⚠️  Статус ${status}`;
      
      log(`${endpoint.method.padEnd(6)} ${endpoint.path.padEnd(30)} ${statusText}`, 
          status === 401 || status === 200 ? 'green' : 'red');
    } catch (error) {
      log(`${endpoint.method.padEnd(6)} ${endpoint.path.padEnd(30)} ❌ Ошибка подключения`, 'red');
    }
  }
}

async function checkPages() {
  log('\n📄 Проверка доступности страниц', 'blue');
  
  const pages = [
    '/admin/managers',
    '/admin/dashboard',
  ];

  for (const page of pages) {
    try {
      const response = await fetch(`${BASE_URL}${page}`);
      const status = response.status;
      const statusText = status === 307 || status === 302 ? '🔄 Редирект (требует авторизации)' :
                        status === 404 ? '❌ Не найдена' :
                        status === 200 ? '✅ Доступна' :
                        `⚠️  Статус ${status}`;
      
      log(`${page.padEnd(30)} ${statusText}`, 
          status === 307 || status === 302 || status === 200 ? 'green' : 'red');
    } catch (error) {
      log(`${page.padEnd(30)} ❌ Ошибка подключения`, 'red');
    }
  }
}

async function main() {
  log('═══════════════════════════════════════════════════', 'blue');
  log('  Тестирование API управления менеджерами', 'blue');
  log('═══════════════════════════════════════════════════', 'blue');
  
  log(`\n🌐 Базовый URL: ${BASE_URL}`, 'yellow');
  log('⚠️  Примечание: Для полного тестирования требуется валидная admin сессия\n', 'yellow');

  await checkEndpoints();
  await checkPages();
  await testGetManagers();
  await testGetBranches();
  await testCreateManager();

  log('\n═══════════════════════════════════════════════════', 'blue');
  log('  Тестирование завершено', 'blue');
  log('═══════════════════════════════════════════════════', 'blue');
  log('\n💡 Для полного тестирования:', 'yellow');
  log('   1. Запустите сервер: npm run dev', 'yellow');
  log('   2. Войдите в админ-панель: http://localhost:3000/admin/login', 'yellow');
  log('   3. Перейдите в раздел "Менеджеры"', 'yellow');
  log('   4. Протестируйте все функции через UI\n', 'yellow');
}

main().catch(error => {
  log(`\n❌ Критическая ошибка: ${error.message}`, 'red');
  process.exit(1);
});
