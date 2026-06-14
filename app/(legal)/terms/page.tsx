import { Metadata } from 'next';
import TermsClient from './TermsClient';

export const metadata: Metadata = {
  title: 'Условия использования | Nur-kitep',
  description: 'Условия использования интернет-магазина Nur-kitep. Правила покупки товаров, возврата, гарантии. Юридическая информация для клиентов.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Условия использования | Nur-kitep',
    description: 'Правила использования интернет-магазина',
    url: 'https://nur-kitep.store/terms',
  },
};

export default function TermsPage() {
  return <TermsClient />;
}
