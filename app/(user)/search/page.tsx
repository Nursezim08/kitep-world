import { Metadata } from 'next';
import { checkUserAccess } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SearchClient from './SearchClient';

export const metadata: Metadata = {
  title: 'Поиск товаров - Найдите нужные канцелярские товары',
  description: 'Поиск канцелярских товаров в каталоге Nur-kitep. Быстрый поиск по названию, артикулу, бренду. Более 1000 товаров в наличии.',
  keywords: [
    'поиск канцелярии',
    'найти товар',
    'поиск по артикулу',
    'поиск школьных принадлежностей'
  ],
  robots: {
    index: false, // Не индексируем страницу поиска
    follow: true,
  },
};

export default async function SearchPage() {
  const access = await checkUserAccess();
  if (!access.allowed) {
    redirect(access.redirectTo!);
  }

  return <SearchClient user={access.user!} />;
}
