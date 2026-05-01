// Скрипт для диагностики настроек админа
// Использование: node scripts/diagnose-admin.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnose() {
  console.log('🔍 Диагностика настроек админ-панели\n');
  console.log('=' .repeat(60));

  try {
    // 1. Проверка настроек Telegram
    console.log('\n1️⃣  Проверка настроек Telegram в таблице settings:');
    console.log('-'.repeat(60));
    
    const botToken = await prisma.setting.findUnique({
      where: { key: 'ADMIN_TELEGRAM_BOT_TOKEN' }
    });
    
    const adminTelegramId = await prisma.setting.findUnique({
      where: { key: 'ADMIN_TELEGRAM_USER_ID' }
    });

    if (botToken) {
      const tokenPreview = botToken.value.substring(0, 10) + '...';
      console.log(`✅ ADMIN_TELEGRAM_BOT_TOKEN: ${tokenPreview} (длина: ${botToken.value.length})`);
    } else {
      console.log('❌ ADMIN_TELEGRAM_BOT_TOKEN: НЕ НАЙДЕН');
    }

    if (adminTelegramId) {
      console.log(`✅ ADMIN_TELEGRAM_USER_ID: ${adminTelegramId.value}`);
    } else {
      console.log('❌ ADMIN_TELEGRAM_USER_ID: НЕ НАЙДЕН');
    }

    // 2. Проверка админских пользователей
    console.log('\n2️⃣  Проверка админских пользователей:');
    console.log('-'.repeat(60));
    
    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: {
        id: true,
        fullName: true,
        email: true,
        status: true,
        emailVerified: true,
      }
    });

    if (admins.length === 0) {
      console.log('❌ Админские пользователи не найдены');
    } else {
      admins.forEach((admin, index) => {
        console.log(`\nАдмин #${index + 1}:`);
        console.log(`  ID: ${admin.id}`);
        console.log(`  Имя: ${admin.fullName}`);
        console.log(`  Email: ${admin.email}`);
        console.log(`  Статус: ${admin.status}`);
        console.log(`  Email подтвержден: ${admin.emailVerified ? '✅' : '❌'}`);
      });
    }

    // 3. Проверка Telegram бота
    console.log('\n3️⃣  Проверка Telegram бота:');
    console.log('-'.repeat(60));
    
    if (botToken && adminTelegramId) {
      console.log('✅ Все настройки Telegram в порядке');
      console.log(`📱 Коды будут отправляться на Telegram ID: ${adminTelegramId.value}`);
    } else {
      console.log('❌ Настройки Telegram не полные');
    }

    // 4. Проверка последних кодов верификации
    console.log('\n4️⃣  Последние коды верификации:');
    console.log('-'.repeat(60));
    
    const verifications = await prisma.adminVerification.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { email: true }
        }
      }
    });

    if (verifications.length === 0) {
      console.log('ℹ️  Коды верификации не найдены');
    } else {
      verifications.forEach((v, index) => {
        const isExpired = new Date() > v.expiresAt;
        const status = isExpired ? '❌ Истек' : '✅ Действителен';
        console.log(`\nКод #${index + 1}:`);
        console.log(`  Email: ${v.user.email}`);
        console.log(`  Код: ${v.code}`);
        console.log(`  Создан: ${v.createdAt.toLocaleString('ru-RU')}`);
        console.log(`  Истекает: ${v.expiresAt.toLocaleString('ru-RU')}`);
        console.log(`  Использован: ${v.verified ? '✅' : '❌'}`);
        console.log(`  Статус: ${status}`);
      });
    }

    // 5. Итоговая диагностика
    console.log('\n5️⃣  Итоговая диагностика:');
    console.log('-'.repeat(60));
    
    const issues = [];
    
    if (!botToken) {
      issues.push('❌ Отсутствует ADMIN_TELEGRAM_BOT_TOKEN в settings');
    }
    
    if (!adminTelegramId) {
      issues.push('❌ Отсутствует ADMIN_TELEGRAM_USER_ID в settings');
    }
    
    if (admins.length === 0) {
      issues.push('❌ Нет пользователей с ролью admin');
    }
    
    admins.forEach(admin => {
      if (admin.status !== 'active') {
        issues.push(`⚠️  Админ ${admin.email} имеет статус: ${admin.status}`);
      }
    });

    if (issues.length === 0) {
      console.log('✅ Все настройки в порядке!');
      console.log('\n📝 Следующие шаги:');
      console.log('1. Убедитесь, что бот запущен в Telegram (нажмите Start)');
      console.log('2. Попробуйте войти через /admin/login');
      console.log('3. Проверьте логи сервера для детальной информации');
      console.log(`4. Код будет отправлен на Telegram ID: ${adminTelegramId.value}`);
    } else {
      console.log('⚠️  Найдены проблемы:\n');
      issues.forEach(issue => console.log(issue));
      console.log('\n📝 Рекомендации:');
      console.log('1. Выполните SQL скрипт: prisma/seed-admin-settings.sql');
      console.log('2. Убедитесь, что все значения заполнены правильно');
      console.log('3. Перезапустите сервер после исправления');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Диагностика завершена\n');

  } catch (error) {
    console.error('\n❌ Ошибка при диагностике:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
