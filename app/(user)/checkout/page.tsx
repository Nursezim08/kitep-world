import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import CheckoutClient from './CheckoutClient';

export default async function CheckoutPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'user') {
    redirect('/login');
  }

  return <CheckoutClient user={user} />;
}
