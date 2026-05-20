import { redirect } from 'next/navigation';
import { checkUserAccess } from '@/lib/auth';
import OrdersClient from './OrdersClient';

export default async function OrdersPage() {
  const access = await checkUserAccess();

  if (!access.allowed) {
    redirect(access.redirectTo!);
  }

  return <OrdersClient user={access.user!} />;
}
