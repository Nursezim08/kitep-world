import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PaymentSuccessClient from './PaymentSuccessClient';

interface PageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function PaymentSuccessPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const { orderId } = await searchParams;

  return <PaymentSuccessClient orderId={orderId} />;
}
