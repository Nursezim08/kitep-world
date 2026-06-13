import { Metadata } from 'next';
import { checkUserAccess } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CatalogClient from './CatalogClient';

export const metadata: Metadata = {
  title: 'Каталог товаров - Канцелярия, книги, школьные принадлежности',
  description: 'Полный каталог канцелярских товаров Nur-kitep: книги, тетради, ручки, карандаши, краски, пеналы, рюкзаки. ✓ Широкий выбор ✓ Низкие цены ✓ Самовывоз из филиалов по всему Кыргызстану',
  keywords: [
    'каталог канцелярии',
    'купить школьные принадлежности',
    'канцтовары Бишкек',
    'книги в наличии',
    'офисные товары каталог',
    'товары для школы'
  ],
  openGraph: {
    title: 'Каталог канцелярских товаров | Nur-kitep',
    description: 'Широкий выбор канцелярских товаров: книги, школьные принадлежности, офисные товары. Низкие цены и быстрый самовывоз.',
    url: 'https://nur-kitep.kg/catalog',
    type: 'website',
  },
};

export default async function CatalogPage() {
  const access = await checkUserAccess();
  if (!access.allowed) {
    redirect(access.redirectTo!);
  }

  return <CatalogClient user={access.user!} />;
}
