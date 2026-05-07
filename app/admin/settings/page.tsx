import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/admin/login');
  }

  if (user.role !== 'admin') {
    redirect('/admin/login');
  }

  return <SettingsClient user={user} />;
}
