import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import CartClient from './CartClient';

export default async function CartPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'user') {
    redirect('/login');
  }

  return <CartClient user={user} />;
}
