'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AiOutlineUser, AiOutlineMail, AiOutlinePhone, AiOutlineLogout } from 'react-icons/ai';
import UserHeader from '@/app/components/UserHeader';
import UserSidebar from '@/app/components/UserSidebar';
import { useTranslation } from '@/app/i18n/client';
import { useChat } from '@/app/(user)/ChatContext';

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
  const { t } = useTranslation('auth');
  const { t: tu } = useTranslation('user');
  const { setSidebarCollapsed: syncSidebarToContext } = useChat();
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => { syncSidebarToContext(sidebarCollapsed); }, [sidebarCollapsed, syncSidebarToContext]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader user={user} />

      <div className="flex pt-[57px] pb-16 lg:pb-0">
        <UserSidebar
          active="profile"
          collapsed={sidebarCollapsed}
          onCollapseChange={setSidebarCollapsed}
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto">
              {/* Back to Home */}
              <div className="mb-4 sm:mb-6">
                <Link 
                  href="/home" 
                  className="inline-flex items-center gap-1.5 text-violet-600 hover:text-violet-700 font-bold transition text-sm"
                >
                  ← {t('profile.backToHome')}
                </Link>
              </div>

              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-500 to-violet-600 px-4 sm:px-6 py-6 sm:py-8 text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden backdrop-blur-sm flex-shrink-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <AiOutlineUser size={36} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-xl sm:text-2xl font-extrabold mb-1 truncate">{user.fullName}</h1>
                      <p className="text-violet-100 font-semibold text-sm sm:text-base">{t(`profile.roles.${user.role}`)}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-extrabold text-gray-900 mb-3 sm:mb-4">
                    {t('profile.profileInfo')}
                  </h2>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-violet-50 rounded-xl border border-violet-100">
                      <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                        <AiOutlineMail className="text-violet-600" size={24} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-600 font-semibold mb-1">{t('profile.email')}</p>
                        <p className="text-gray-900 font-bold truncate">{user.email}</p>
                      </div>
                    </div>

                    {user.phone ? (
                      <div className="flex items-center gap-3 p-4 bg-violet-50 rounded-xl border border-violet-100">
                        <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                          <AiOutlinePhone className="text-violet-600" size={24} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-600 font-semibold mb-1">{t('profile.phone')}</p>
                          <p className="text-gray-900 font-bold">{user.phone}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <AiOutlinePhone className="text-gray-400" size={24} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-600 font-semibold mb-1">{t('profile.phone')}</p>
                          <p className="text-gray-400 font-semibold italic">{t('profile.phoneNotSet')}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-4 bg-violet-50 rounded-xl border border-violet-100">
                      <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                        <AiOutlineUser className="text-violet-600" size={24} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-600 font-semibold mb-1">{t('profile.status')}</p>
                        <p className="text-gray-900 font-bold">
                          {t(`profile.statuses.${user.status}`)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <AiOutlineLogout size={20} />
                      {loading ? t('profile.loggingOut') : t('profile.logout')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
