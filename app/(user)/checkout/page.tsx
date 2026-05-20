import { redirect } from 'next/navigation';
import { checkUserAccess } from '@/lib/auth';
import CheckoutClient from './CheckoutClient';

export default async function CheckoutPage() {
  const access = await checkUserAccess();

  if (!access.allowed) {
    redirect(access.redirectTo!);
  }

  return <CheckoutClient user={access.user!} />;
}
