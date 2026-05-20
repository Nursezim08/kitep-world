import { PrismaClient } from '@prisma/client';

// Создаем глобальный тип для Prisma
declare global {
  var prisma: PrismaClient | undefined;
}

// Функция для создания Prisma клиента
const createPrismaClient = () => {
  console.log('[PRISMA] Creating new Prisma client...');
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
};

// Используем глобальный экземпляр или создаем новый
let prismaInstance: PrismaClient | null = null;

export const getPrismaClient = (): PrismaClient => {
  if (prismaInstance) {
    return prismaInstance;
  }

  if (global.prisma) {
    prismaInstance = global.prisma;
    return prismaInstance;
  }

  prismaInstance = createPrismaClient();
  
  // В режиме разработки сохраняем экземпляр глобально
  if (process.env.NODE_ENV !== 'production') {
    global.prisma = prismaInstance;
  }

  console.log('[PRISMA] Prisma client initialized successfully');
  return prismaInstance;
};

// Экспортируем клиент для обратной совместимости
export const prisma = getPrismaClient();
