'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { AiOutlineUser, AiOutlineMail, AiOutlinePhone, AiOutlineLogout } from 'react-icons/ai';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phone: string | null;
  avatar: string | null;
  status: string;
}

export default function ProfileClient({ user }: { user: User }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const roleNames: Record<string, string> = {
    admin: 'Администратор',
    manager: 'Менеджер',
    user: 'Пользователь',
  };

  const statusNames: Record<string, string> = {
    active: 'Активен',
    inactive: 'Неактивен',
    blocked: 'Заблокирован',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-violet-100 to-violet-50 py-6 px-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="max-w-2xl mx-auto relative">
        {/* Back to Home */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-violet-600 hover:text-violet-700 font-bold mb-4 transition text-sm"
        >
          ← Главная
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-500 to-violet-600 px-5 py-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden backdrop-blur-sm flex-shrink-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <AiOutlineUser size={32} />
                )}
              </div>
              <div>
                <h1 className="text-xl font-extrabold mb-0.5">{user.fullName}</h1>
                <p className="text-violet-100 font-semibold text-sm">{roleNames[user.role]}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <h2 className="text-base font-extrabold text-black mb-3">
              Информация о профиле
            </h2>

            <div className="space-y-2.5">
              <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-xl border-2 border-violet-100">
                <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <AiOutlineMail className="text-violet-600" size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-600 font-semibold">Email</p>
                  <p className="text-black font-bold text-sm truncate">{user.email}</p>
                </div>
              </div>

              {user.phone ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border-2 border-green-100">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <AiOutlinePhone className="text-green-600" size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-600 font-semibold">Телефон</p>
                    <p className="text-black font-bold text-sm">{user.phone}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <AiOutlinePhone className="text-gray-400" size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-600 font-semibold">Телефон</p>
                    <p className="text-gray-400 font-semibold italic text-sm">Не указан</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border-2 border-purple-100">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <AiOutlineUser className="text-purple-600" size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-600 font-semibold">Статус</p>
                  <p className="text-black font-bold text-sm">
                    {statusNames[user.status]}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t-2 border-gray-200">
              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-xl font-bold hover:bg-red-600 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <AiOutlineLogout size={18} />
                {loading ? 'Выход...' : 'Выйти из аккаунта'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
