import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testBannerCreate() {
  try {
    console.log('🧪 Testing banner creation...');

    const banner = await prisma.banner.create({
      data: {
        desktopImage: 'data:image/png;base64,test',
        mobileImage: 'data:image/png;base64,test',
        url: 'https://example.com',
        status: 'active',
        translations: {
          create: [
            {
              locale: 'ru',
              title: 'Тестовый баннер',
            },
            {
              locale: 'kg',
              title: 'Тест баннер',
            },
          ],
        },
      },
      include: {
        translations: true,
      },
    });

    console.log('✅ Banner created successfully:', banner);
    
    // Удаляем тестовый баннер
    await prisma.banner.delete({
      where: { id: banner.id },
    });
    
    console.log('✅ Test banner deleted');
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
  } finally {
    await prisma.$disconnect();
  }
}

testBannerCreate();
