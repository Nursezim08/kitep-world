import { Metadata } from 'next';
import PrivacyClient from './PrivacyClient';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности | Nur-kitep',
  description: 'Политика конфиденциальности интернет-магазина Nur-kitep. Правила обработки персональных данных в соответствии с законодательством Кыргызской Республики.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Политика конфиденциальности | Nur-kitep',
    description: 'Правила обработки персональных данных',
    url: 'https://nur-kitep.kg/privacy',
  },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
