// Скрипт для обновления telegram_id админа
// Использование: node scripts/fix-admin-telegram-id.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixTelegramId() {
  console.log('🔧 Исправление telegram_id для админа\n');

  try {
    // Получаем ADMIN_TELEGRAM_USER_ID из настроек
    const adminTelegramIdSetting = await prisma.setting.findUnique({
      where: { key: 'ADMIN_TELEGRAM_USER_ID' }
    });

    if (!adminTelegramIdSetting) {
      console.error('❌ ADMIN_TELEGRAM_USER_ID не найден в настройках');
      return;
    }

    const telegramId = adminTelegramIdSetting.value;
    console.log(`📱 Telegram ID из настроек: ${telegramId}`);

    // Находим всех админов без telegram_id
    const adminsWithoutTelegramId = await prisma.user.findMany({
      where: {
        role: 'admin',
        OR: [
          { telegramId: null },
          { telegramId: '' }
        ]
      }
    });

    if (adminsWithoutTelegramId.length === 0) {
      console.log('✅ Все админы уже имеют telegram_id');
      
      // Проверяем совпадение
      const allAdmins = await prisma.user.findMany({
        where: { role: 'admin' }
      });

      console.log('\n📋 Текущие админы:');
      allAdmins.forEach(admin => {
        const matches = admin.telegramId === telegramId;
        console.log(`  ${admin.email}: ${admin.telegramId} ${matches ? '✅' : '❌'}`);
      });

      return;
    }

    console.log(`\n⚠️  Найдено админов без telegram_id: ${adminsWithoutTelegramId.length}`);

    // Обновляем telegram_id для каждого админа
    for (const admin of adminsWithoutTelegramId) {
      console.log(`\n🔄 Обновление для ${admin.email}...`);
      
      const updated = await prisma.user.update({
        where: { id: admin.id },
        data: { telegramId: telegramId }
      });

      console.log(`✅ Обновлено: ${updated.email} -> telegram_id: ${updated.telegramId}`);
    }

    console.log('\n✅ Все админы обновлены!');
    console.log('\n📝 Следующие шаги:');
    console.log('1. Убедитесь, что бот запущен в Telegram (найдите бота и нажмите Start)');
    console.log('2. Попробуйте войти через /admin/login');
    console.log('3. Проверьте, что код приходит в Telegram');

  } catch (error) {
    console.error('\n❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTelegramId();
