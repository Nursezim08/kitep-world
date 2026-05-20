import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Testing database connection...');
    
    // Проверяем пользователей
    const users = await prisma.user.findMany({
      take: 3,
      select: {
        id: true,
        full_name: true,
        email: true,
        google_id: true,
        role: true,
      }
    });
    
    console.log('Users found:', users.length);
    console.log('Sample users:', JSON.stringify(users, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
