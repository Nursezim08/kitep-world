import { redirect } from 'next/navigation';
import { checkUserAccess } from '@/lib/auth';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const access = await checkUserAccess();

  if (!access.allowed) {
    redirect(access.redirectTo!);
  }

  return <ProfileClient user={access.user!} />;
}
