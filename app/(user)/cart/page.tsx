import { redirect } from 'next/navigation';
import { checkUserAccess } from '@/lib/auth';
import CartClient from './CartClient';

export default async function CartPage() {
  const access = await checkUserAccess();

  if (!access.allowed) {
    redirect(access.redirectTo!);
  }

  return <CartClient user={access.user!} />;
}
