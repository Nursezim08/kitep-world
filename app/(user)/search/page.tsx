import { redirect } from 'next/navigation';
import { checkUserAccess } from '@/lib/auth';
import SearchClient from './SearchClient';

export default async function SearchPage() {
  const access = await checkUserAccess();

  if (!access.allowed) {
    redirect(access.redirectTo!);
  }

  return <SearchClient user={access.user!} />;
}
