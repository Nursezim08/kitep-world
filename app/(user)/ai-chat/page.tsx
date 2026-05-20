import { redirect } from 'next/navigation';
import { checkUserAccess } from '@/lib/auth';
import AIChatClient from './AIChatClient';

export default async function AIChatPage() {
  const access = await checkUserAccess();

  if (!access.allowed) {
    redirect(access.redirectTo!);
  }

  return <AIChatClient user={access.user!} />;
}
