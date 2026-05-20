import { redirect } from 'next/navigation';
import { checkUserAccess } from '@/lib/auth';
import CatalogClient from './CatalogClient';

export default async function CatalogPage() {
  const access = await checkUserAccess();

  if (!access.allowed) {
    redirect(access.redirectTo!);
  }

  return <CatalogClient user={access.user!} />;
}
