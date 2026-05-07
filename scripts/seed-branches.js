const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const testBranches = [
  {
    name: 'Центральный филиал',
    code: 'BR001',
    city: 'Бишкек',
    district: 'Центральный район',
    address: 'ул. Чуй, 123',
    phone: '+996 312 123 456',
    email: 'central@nurkitep.kg',
    status: 'active',
  },
  {
    name: 'Филиал Ала-Тоо',
    code: 'BR002',
    city: 'Бишкек',
    district: 'Ленинский район',
    address: 'пр. Ала-Тоо, 45',
    phone: '+996 312 234 567',
    email: 'alatoo@nurkitep.kg',
    status: 'active',
  },
  {
    name: 'Филиал Восток-5',
    code: 'BR003',
    city: 'Бишкек',
    district: 'Свердловский район',
    address: 'мкр. Восток-5, 78',
    phone: '+996 312 345 678',
    email: 'vostok5@nurkitep.kg',
    status: 'active',
  },
  {
    name: 'Ошский филиал',
    code: 'BR004',
    city: 'Ош',
    district: 'Центральный район',
    address: 'ул. Ленина, 56',
    phone: '+996 3222 12 345',
    email: 'osh@nurkitep.kg',
    status: 'active',
  },
  {
    name: 'Джалал-Абадский филиал',
    code: 'BR005',
    city: 'Джалал-Абад',
    district: 'Центральный район',
    address: 'ул. Эркиндик, 89',
    phone: '+996 3722 23 456',
    email: 'jalalabad@nurkitep.kg',
    status: 'active',
  },
  {
    name: 'Каракольский филиал',
    code: 'BR006',
    city: 'Каракол',
    district: 'Центральный район',
    address: 'ул. Гебзе, 34',
    phone: '+996 3922 34 567',
    email: 'karakol@nurkitep.kg',
    status: 'active',
  },
  {
    name: 'Нарынский филиал',
    code: 'BR007',
    city: 'Нарын',
    district: 'Центральный район',
    address: 'ул. Ленина, 12',
    phone: '+996 3522 45 678',
    email: 'naryn@nurkitep.kg',
    status: 'inactive',
  },
  {
    name: 'Таласский филиал',
    code: 'BR008',
    city: 'Талас',
    district: 'Центральный район',
    address: 'ул. Бердике Баатыра, 67',
    phone: '+996 3422 56 789',
    email: 'talas@nurkitep.kg',
    status: 'active',
  },
  {
    name: 'Баткенский филиал',
    code: 'BR009',
    city: 'Баткен',
    district: 'Центральный район',
    address: 'ул. Ленина, 23',
    phone: '+996 3622 67 890',
    email: 'batken@nurkitep.kg',
    status: 'active',
  },
  {
    name: 'Филиал Ала-Арча',
    code: 'BR010',
    city: 'Бишкек',
    district: 'Первомайский район',
    address: 'ул. Ала-Арча, 101',
    phone: '+996 312 456 789',
    email: 'alaarcha@nurkitep.kg',
    status: 'active',
  },
];

async function seedBranches() {
  console.log('🌱 Начинаем добавление тестовых филиалов...');

  try {
    // Проверяем, есть ли уже филиалы
    const existingBranches = await prisma.branch.findMany();
    
    if (existingBranches.length > 0) {
      console.log(`⚠️  Найдено ${existingBranches.length} существующих филиалов.`);
      console.log('Хотите удалить их и создать новые? (Ctrl+C для отмены)');
      
      // Удаляем существующие филиалы
      await prisma.branch.deleteMany({});
      console.log('🗑️  Существующие филиалы удалены.');
    }

    // Создаем новые филиалы
    let created = 0;
    for (const branchData of testBranches) {
      try {
        await prisma.branch.create({
          data: branchData,
        });
        created++;
        console.log(`✅ Создан филиал: ${branchData.name} (${branchData.code})`);
      } catch (error) {
        console.error(`❌ Ошибка при создании филиала ${branchData.name}:`, error.message);
      }
    }

    console.log(`\n🎉 Успешно создано ${created} из ${testBranches.length} филиалов!`);

    // Показываем статистику
    const stats = await prisma.branch.groupBy({
      by: ['city'],
      _count: true,
    });

    console.log('\n📊 Статистика по городам:');
    stats.forEach(stat => {
      console.log(`   ${stat.city}: ${stat._count} филиал(ов)`);
    });

  } catch (error) {
    console.error('❌ Ошибка при добавлении филиалов:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedBranches()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
