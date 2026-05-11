import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import CatalogClient from './CatalogClient';

export default async function CatalogPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'user') {
    redirect('/login');
  }

  return <CatalogClient user={user} />;
}
