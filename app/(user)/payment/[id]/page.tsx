import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PaymentClient from './PaymentClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PaymentPage({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const { id } = await params;

  return (
    <PaymentClient
      orderId={id}
      user={{
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      }}
    />
  );
}
