// Тестовый скрипт для проверки функционала сброса пароля
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPasswordReset() {
  try {
    console.log('🔍 Проверка функционала сброса пароля...\n');

    // 1. Проверка существования таблицы
    console.log('1. Проверка таблицы password_resets...');
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'password_resets'
      );
    `;
    console.log('   ✅ Таблица существует:', tableExists[0].exists);

    // 2. Проверка создания кода
    console.log('\n2. Тестовое создание кода сброса...');
    const testEmail = 'test@example.com';
    const testCode = '123456';
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const resetRecord = await prisma.passwordReset.create({
      data: {
        email: testEmail,
        code: testCode,
        expiresAt,
      },
    });
    console.log('   ✅ Код создан:', resetRecord.id);

    // 3. Проверка поиска кода
    console.log('\n3. Проверка поиска кода...');
    const foundRecord = await prisma.passwordReset.findFirst({
      where: {
        email: testEmail,
        code: testCode,
        used: false,
      },
    });
    console.log('   ✅ Код найден:', foundRecord ? 'Да' : 'Нет');

    // 4. Проверка обновления флага used
    console.log('\n4. Проверка пометки кода как использованного...');
    await prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { used: true },
    });
    console.log('   ✅ Код помечен как использованный');

    // 5. Очистка тестовых данных
    console.log('\n5. Очистка тестовых данных...');
    await prisma.passwordReset.deleteMany({
      where: { email: testEmail },
    });
    console.log('   ✅ Тестовые данные удалены');

    console.log('\n✅ Все проверки пройдены успешно!');
  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    console.error('Детали:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPasswordReset();
