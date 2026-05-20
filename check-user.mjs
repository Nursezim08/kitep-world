import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'tajibaevaas.08@gmail.com' },
      select: {
        id: true,
        full_name: true,
        email: true,
        password_hash: true,
        google_id: true,
        role: true,
        status: true,
      }
    });
    
    if (user) {
      console.log('User found:');
      console.log('- Name:', user.full_name);
      console.log('- Email:', user.email);
      console.log('- Has password:', user.password_hash ? 'Yes' : 'No');
      console.log('- Google ID:', user.google_id || 'None');
      console.log('- Role:', user.role);
      console.log('- Status:', user.status);
    } else {
      console.log('User not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
