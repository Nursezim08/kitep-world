import { redirect } from 'next/navigation';
import { checkUserAccess } from '@/lib/auth';
import CategoriesClient from './CategoriesClient';

export default async function CategoriesPage() {
  const access = await checkUserAccess();

  if (!access.allowed) {
    redirect(access.redirectTo!);
  }

  return <CategoriesClient user={access.user!} />;
}
