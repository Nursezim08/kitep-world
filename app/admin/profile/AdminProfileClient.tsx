'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  Settings, 
  FileText,
  MapPin,
  LogOut,
  Bell,
  Search,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  FolderTree,
  Mail,
  Phone,
  Shield,
  Calendar
} from 'lucide-react';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt?: string;
}

interface AdminProfileClientProps {
  user: User;
}

export default function AdminProfileClient({ user }: AdminProfileClientProps) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
    { title: 'Панель управления', icon: LayoutDashboard, active: false, href: '/admin/dashboard' },
    { title: 'Пользователи', icon: Users, active: false, href: '/admin/users' },
    { title: 'Категории', icon: FolderTree, active: false, href: '/admin/categories' },
    { title: 'Товары', icon: Package, active: false, href: '/admin/products' },
    { title: 'Заказы', icon: ShoppingCart, active: false, href: '#' },
    { title: 'Филиалы', icon: MapPin, active: false, href: '/admin/branches' },
    { title: 'Менеджеры', icon: Users, active: false, href: '/admin/managers' },
    { title: 'Отчеты', icon: FileText, active: false, href: '#' },
    { title: 'Настройки', icon: Settings, active: false, href: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#151b26]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#252d3d] border-b border-gray-800/50">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 w-72">
              <img 
                src="/logonur.png" 
                alt="Nur-Kitep Logo" 
                className="w-10 h-10 rounded-xl object-cover"
              />
              <div>
                <h1 className="text-lg font-bold text-white">
                  Nur-Kitep
                </h1>
                <p className="text-xs text-gray-400">Панель управления</p>
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4 flex-1 max-w-xl mx-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Поиск..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1e2533] border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-sm text-white placeholder-gray-500"
                />
              </div>
            </div>

            {/* User & Notifications */}
            <div className="flex items-center gap-3">
              <button className="relative p-2.5 hover:bg-[#252d3d] rounded-xl transition-colors text-gray-400 hover:text-white">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full"></span>
              </button>

              <button 
                onClick={() => router.push('/admin/profile')}
                className="flex items-center gap-3 pl-3 hover:bg-[#2a3347] rounded-xl transition-colors px-3 py-2"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                  {user.fullName.charAt(0)}
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-semibold text-white">{user.fullName}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-[73px]">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} px-4 pt-4 flex flex-col transition-all duration-300 sticky top-[73px] self-start`}>
          {/* Main Navigation Card */}
          <div className="bg-[#252d3d] rounded-2xl p-4 mb-4">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} mb-4 px-2`}>
              {!sidebarCollapsed && <span className="text-sm font-semibold text-gray-400">Навигация</span>}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-[#2a3347] rounded-lg transition-all text-gray-400 hover:text-white"
                title={sidebarCollapsed ? 'Развернуть' : 'Свернуть'}
              >
                {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
            </div>
            
            <nav className="space-y-1">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => item.href !== '#' && router.push(item.href)}
                  className={`w-full flex items-center justify-center ${sidebarCollapsed ? '' : 'justify-start gap-3 px-3'} py-2.5 rounded-xl transition-all ${
                    item.active 
                      ? 'bg-violet-500/15 text-violet-400' 
                      : 'text-gray-400 hover:bg-[#2a3347] hover:text-white'
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
            <div className="bg-[#252d3d] rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-4 px-2">
                <span className="text-sm font-semibold text-gray-400">Быстрые действия</span>
              </div>
              
              <div className="space-y-1">
                <button
                  onClick={() => router.push('/admin/branches')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-[#2a3347] hover:text-white transition-all"
                >
                  <MapPin size={18} className="flex-shrink-0" />
                  <span className="text-sm font-medium">Филиалы</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-[#2a3347] hover:text-white transition-all">
                  <FileText size={18} className="flex-shrink-0" />
                  <span className="text-sm font-medium">Отчеты</span>
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <main className="p-8">
            {/* Page Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-white mb-2">
                Профиль администратора
              </h2>
              <p className="text-gray-400 font-semibold">
                Управление личными данными и настройками аккаунта
              </p>
            </div>

            {/* Profile Card */}
            <div className="bg-[#252d3d] rounded-2xl p-8 border border-gray-800/50 mb-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-start gap-6 mb-8 pb-8 border-b border-gray-800/50">
                <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl flex-shrink-0">
                  {user.fullName.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">{user.fullName}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="px-3 py-1 bg-violet-500/15 text-violet-400 rounded-lg text-sm font-semibold flex items-center gap-2">
                      <Shield size={14} />
                      Администратор
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Полный доступ ко всем функциям системы управления
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <h4 className="text-lg font-bold text-white mb-4">Контактная информация</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="bg-[#1e2533] rounded-xl p-5 border border-gray-800/30">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center">
                        <Mail className="text-violet-400" size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Email</p>
                        <p className="text-white font-semibold">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="bg-[#1e2533] rounded-xl p-5 border border-gray-800/30">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center">
                        <Phone className="text-violet-400" size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Телефон</p>
                        <p className="text-white font-semibold">{user.phone || 'Не указан'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Registration Date */}
                  {user.createdAt && (
                    <div className="bg-[#1e2533] rounded-xl p-5 border border-gray-800/30">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center">
                          <Calendar className="text-violet-400" size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">Дата регистрации</p>
                          <p className="text-white font-semibold">
                            {new Date(user.createdAt).toLocaleDateString('ru-RU', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
              <h4 className="text-lg font-bold text-white mb-4">Управление сеансом</h4>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut size={18} />
                <span>{isLoggingOut ? 'Выход...' : 'Выйти из системы'}</span>
              </button>
              <p className="text-gray-500 text-sm mt-3">
                После выхода вам потребуется снова войти в систему
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
