'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AiOutlineUser, AiOutlineMail, AiOutlinePhone, AiOutlineLogout } from 'react-icons/ai';
import {
  Globe,
  Home,
  Grid,
  ShoppingCart,
  Package,
  MessageCircle,
  User,
  ChevronRight,
  X,
  Menu,
  ChevronLeft,
  LogOut,
} from 'lucide-react';
import UserHeader from '@/app/components/UserHeader';
import { useTranslation, setLanguageCookie } from '@/app/i18n/client';
import { useChat } from '@/app/(user)/ChatContext';
import { languages, type Language } from '@/app/i18n/settings';

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
  const { t, lang } = useTranslation('auth');
  const { t: tu } = useTranslation('user');
  const { openChat, setSidebarCollapsed: syncSidebarToContext } = useChat();
  const [loading, setLoading] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
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

  const handleLanguageChange = (newLang: Language) => {
    setLanguageCookie(newLang);
    setIsLangOpen(false);
    window.location.reload();
  };

  const languageLabels: Record<Language, string> = {
    ru: 'Русский',
    kg: 'Кыргызча',
  };

  const menuItems = [
    { title: tu('nav.home'), icon: Home, href: '/home', active: false },
    { title: tu('nav.catalog'), icon: Grid, href: '/catalog', active: false },
    { title: tu('nav.orders'), icon: Package, href: '/orders', active: false },
    { title: tu('nav.cart'), icon: ShoppingCart, href: '/cart', active: false },
    { title: tu('nav.aiChat'), icon: MessageCircle, href: '/ai-chat', active: false, onClick: openChat },
    { title: tu('nav.profile'), icon: User, href: '/profile', active: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader user={user} />

      <div className="flex pt-[57px]">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} px-4 pt-4 flex flex-col transition-all duration-300 sticky top-[57px] self-start`}>
          {/* Main Navigation Card */}
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-200">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} mb-4 px-2`}>
              {!sidebarCollapsed && <span className="text-sm font-semibold text-gray-500">{tu('sidebar.navigation')}</span>}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-gray-50 rounded-lg transition-all text-gray-500 hover:text-gray-900"
                title={sidebarCollapsed ? 'Развернуть' : 'Свернуть'}
              >
                {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
            </div>
            
            <nav className="space-y-1">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => item.onClick ? item.onClick() : (item.href !== '#' && router.push(item.href))}
                  className={`w-full flex items-center justify-center ${sidebarCollapsed ? '' : 'justify-start gap-3 px-3'} py-2.5 rounded-xl transition-all ${
                    item.active 
                      ? 'bg-violet-500/15 text-violet-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={sidebarCollapsed ? item.title : ''}
                >
                  <item.icon size={18} className="flex-shrink-0" />
                  {!sidebarCollapsed && <span className="text-sm font-medium">{item.title}</span>}
                </button>
              ))}
            </nav>
          </div>

          {/* Quick Actions Card */}
          {!sidebarCollapsed && (
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4 px-2">
                <span className="text-sm font-semibold text-gray-500">{tu('sidebar.quickActions')}</span>
              </div>
              
              <div className="space-y-1">
                <button
                  onClick={() => router.push('/catalog')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
                >
                  <Grid size={18} className="flex-shrink-0" />
                  <span className="text-sm font-medium">Каталог</span>
                </button>
                <button
                  onClick={() => router.push('/orders')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
                >
                  <Package size={18} className="flex-shrink-0" />
                  <span className="text-sm font-medium">{tu('sidebar.myOrders')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Logout Button Card */}
          <div className="mt-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <button
                onClick={handleLogout}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-center gap-2'} px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-xl font-medium text-sm transition-all`}
                title={sidebarCollapsed ? tu('sidebar.logout') : ''}
              >
                <LogOut size={16} />
                {!sidebarCollapsed && <span>{tu('sidebar.logout')}</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <main className="p-8">
            <div className="max-w-2xl mx-auto">
              {/* Back to Home */}
              <div className="mb-6">
                <Link 
                  href="/home" 
                  className="inline-flex items-center gap-1.5 text-violet-600 hover:text-violet-700 font-bold transition text-sm"
                >
                  ← {t('profile.backToHome')}
                </Link>
              </div>

              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-500 to-violet-600 px-6 py-8 text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden backdrop-blur-sm flex-shrink-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <AiOutlineUser size={40} />
                      )}
                    </div>
                    <div>
                      <h1 className="text-2xl font-extrabold mb-1">{user.fullName}</h1>
                      <p className="text-violet-100 font-semibold">{t(`profile.roles.${user.role}`)}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h2 className="text-lg font-extrabold text-gray-900 mb-4">
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
