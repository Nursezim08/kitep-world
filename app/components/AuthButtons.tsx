import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { AiOutlineUser } from 'react-icons/ai';

export default async function AuthButtons() {
  const user = await getCurrentUser();

  if (user) {
    return (
      <Link
        href="/profile"
        className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
      >
        <AiOutlineUser size={20} />
        <span>{user.fullName}</span>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="px-4 py-2 text-gray-700 hover:text-violet-600 transition font-medium"
      >
        Вход
      </Link>
      <Link
        href="/register"
        className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition font-medium"
      >
        Регистрация
      </Link>
    </div>
  );
}
