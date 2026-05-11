import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import HomeClient from './HomeClient';

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'user') {
    redirect('/admin/dashboard');
  }

  return <HomeClient user={user} />;
}
