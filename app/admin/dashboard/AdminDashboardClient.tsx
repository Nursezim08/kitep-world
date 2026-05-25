'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  Settings, 
  DollarSign,
  FileText,
  MapPin,
  LogOut,
  Bell,
  Search,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  FolderTree,
  Image as ImageIcon
} from 'lucide-react';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface AdminDashboardClientProps {
  user: User;
}

export default function AdminDashboardClient({ user }: AdminDashboardClientProps) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [banners, setBanners] = useState<{id: string; desktopImage: string; url: string | null; title: string}[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<{
    users: string;
    products: string;
    orders: string;
    revenue: string;
  } | null>(null);
  const [recentOrders, setRecentOrders] = useState<{
    id: string;
    customer: string;
    amount: string;
    status: string;
    time: string;
  }[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data.stats);
        setRecentOrders(data.recentOrders || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setDashboardLoading(false);
    }
  };

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/admin/banners');
      if (response.ok) {
        const data = await response.json();
        setBanners(Array.isArray(data.banners) ? data.banners : []);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setBannersLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { title: 'Панель управления', icon: LayoutDashboard, active: true, href: '/admin/dashboard' },
    { title: 'Пользователи', icon: Users, active: false, href: '/admin/users' },
    { title: 'Категории', icon: FolderTree, active: false, href: '/admin/categories' },
    { title: 'Товары', icon: Package, active: false, href: '/admin/products' },
    { title: 'Баннеры', icon: ImageIcon, active: false, href: '/admin/banners' },
    { title: 'Заказы', icon: ShoppingCart, active: false, href: '/admin/orders' },
    { title: 'Филиалы', icon: MapPin, active: false, href: '/admin/branches' },
    { title: 'Менеджеры', icon: Users, active: false, href: '/admin/managers' },
    { title: 'Отчеты', icon: FileText, active: false, href: '/admin/reports' },
    { title: 'Настройки', icon: Settings, active: false, href: '/admin/settings' },
  ];

  const stats = [
    { title: 'Пользователи', value: dashboardStats?.users ?? '—', icon: Users },
    { title: 'Товары', value: dashboardStats?.products ?? '—', icon: Package },
    { title: 'Заказы', value: dashboardStats?.orders ?? '—', icon: ShoppingCart },
    { title: 'Доход', value: dashboardStats?.revenue ?? '—', icon: DollarSign },
  ];

  const quickActions = [
    { title: 'Добавить филиал', desc: 'Создать новый филиал магазина', icon: MapPin, href: '/admin/branches' },
    { title: 'Управление филиалами', desc: 'Просмотр и редактирование филиалов', icon: MapPin, href: '/admin/branches' },
    { title: 'Управление заказами', desc: 'Просмотр и обработка заказов', icon: ShoppingCart, href: '/admin/orders' },
    { title: 'Управление пользователями', desc: 'Просмотр и редактирование пользователей', icon: Users, href: '/admin/users' },
    { title: 'Отчеты', desc: 'Аналитика и статистика', icon: FileText, href: '/admin/reports' },
    { title: 'Настройки системы', desc: 'Конфигурация и параметры', icon: Settings, href: '/admin/settings' },
  ];


  return (
    <div className="h-screen flex flex-col bg-[#151b26] overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-[#252d3d] border-b border-gray-800/50">
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
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-white">{user.fullName}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} flex-shrink-0 bg-[#151b26] overflow-y-auto no-scrollbar transition-all duration-300`}>
          <div className="p-4 flex flex-col min-h-full">
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

          {/* Logout Button Card */}
          <div className="mt-auto mb-2">
            <div className="bg-[#252d3d] rounded-2xl p-4">
              <button
                onClick={handleLogout}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-center gap-2'} px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium text-sm transition-all`}
                title={sidebarCollapsed ? 'Выйти' : ''}
              >
                <LogOut size={16} />
                {!sidebarCollapsed && <span>Выйти</span>}
              </button>
            </div>
          </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <main className="p-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-white mb-2">
                Панель управления
              </h2>
              <p className="text-gray-400 font-semibold">
                Обзор статистики и управление магазином
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50 hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-500/5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <stat.icon className="text-violet-400" size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-gray-400 text-sm font-semibold mb-1">{stat.title}</h3>
                      {dashboardLoading ? (
                        <div className="w-16 h-8 bg-gray-700/50 rounded animate-pulse" />
                      ) : (
                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50 mb-8">
              <h3 className="text-xl font-bold text-white mb-6">Быстрые действия</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => action.href !== '#' && router.push(action.href)}
                    className="bg-[#1e2533] rounded-xl p-5 text-left transition-all hover:shadow-lg hover:shadow-violet-500/5 hover:scale-[1.02] group border border-gray-800/30 hover:border-violet-500/30"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <action.icon className="text-violet-400" size={24} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        <h4 className="text-white font-semibold mb-1">{action.title}</h4>
                        <p className="text-gray-400 text-sm">{action.desc}</p>
                      </div>
                      <ChevronRight className="text-gray-600 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" size={20} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Banners */}
            <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50 mb-8">
              <div className="flex items-center gap-2 mb-6">
                <ImageIcon className="text-violet-400" size={20} />
                <h3 className="text-xl font-bold text-white">Баннеры</h3>
                {!bannersLoading && (
                  <span className="ml-auto text-xs text-gray-400 font-medium">{banners.length} активных</span>
                )}
              </div>
              {bannersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : banners.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon size={40} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Нет активных баннеров</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {banners.map((banner) => (
                    <div key={banner.id} className="rounded-xl overflow-hidden border border-gray-800/50 group">
                      <div className="relative aspect-[16/6] bg-[#1e2533]">
                        <img
                          src={banner.desktopImage}
                          alt={banner.title || 'Баннер'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 right-2 bg-green-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Активен
                        </span>
                      </div>
                      <div className="px-3 py-2 bg-[#1e2533] border-t border-gray-800/50">
                        <p className="text-sm font-medium text-white truncate">{banner.title || '—'}</p>
                        {banner.url && <p className="text-xs text-gray-500 truncate mt-0.5">{banner.url}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Orders */}
              <div className="lg:col-span-3 bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Последние заказы</h3>
                  <button
                    onClick={() => router.push('/admin/orders')}
                    className="text-violet-400 hover:text-violet-300 font-semibold text-sm flex items-center gap-1"
                  >
                    Все заказы
                    <ChevronRight size={16} />
                  </button>
                </div>
                {dashboardLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-700/30 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart size={40} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Нет заказов</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((order, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-[#1e2533] rounded-xl hover:bg-[#2a3347] transition-all group border border-gray-800/30"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                            {order.customer.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">{order.customer}</p>
                            <p className="text-gray-500 text-xs">{order.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="px-3 py-1 bg-violet-500/10 text-violet-400 rounded-lg text-xs font-semibold">
                            {order.status}
                          </span>
                          <div className="text-right">
                            <p className="text-white font-semibold text-sm">{order.amount}</p>
                            <p className="text-gray-500 text-xs">{order.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
