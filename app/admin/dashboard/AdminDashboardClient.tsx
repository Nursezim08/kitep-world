'use client';

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
  Clock,
  TrendingUp,
  LayoutDashboard
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
    { title: 'Пользователи', icon: Users, active: false, href: '#' },
    { title: 'Товары', icon: Package, active: false, href: '#' },
    { title: 'Заказы', icon: ShoppingCart, active: false, href: '#' },
    { title: 'Филиалы', icon: MapPin, active: false, href: '#' },
    { title: 'Менеджеры', icon: Users, active: false, href: '/admin/managers' },
    { title: 'Отчеты', icon: FileText, active: false, href: '#' },
    { title: 'Настройки', icon: Settings, active: false, href: '#' },
  ];

  const stats = [
    { 
      title: 'Пользователи', 
      value: '1,234', 
      change: '+12%',
      icon: Users
    },
    { 
      title: 'Товары', 
      value: '10,567', 
      change: '+8%',
      icon: Package
    },
    { 
      title: 'Заказы', 
      value: '3,456', 
      change: '+23%',
      icon: ShoppingCart
    },
    { 
      title: 'Доход', 
      value: '₸2.4M', 
      change: '+18%',
      icon: DollarSign
    },
  ];

  const quickActions = [
    { title: 'Добавить филиал', desc: 'Создать новый филиал магазина', icon: MapPin },
    { title: 'Управление филиалами', desc: 'Просмотр и редактирование филиалов', icon: MapPin },
    { title: 'Управление заказами', desc: 'Просмотр и обработка заказов', icon: ShoppingCart },
    { title: 'Управление пользователями', desc: 'Просмотр и редактирование пользователей', icon: Users },
    { title: 'Отчеты', desc: 'Аналитика и статистика', icon: FileText },
    { title: 'Настройки системы', desc: 'Конфигурация и параметры', icon: Settings },
  ];

  const recentOrders = [
    { id: '#12345', customer: 'Айгерим Т.', amount: '₸4,500', status: 'Завершен', time: '5 мин назад' },
    { id: '#12344', customer: 'Бекжан И.', amount: '₸2,300', status: 'В обработке', time: '12 мин назад' },
    { id: '#12343', customer: 'Нурайым А.', amount: '₸6,700', status: 'Ожидает', time: '25 мин назад' },
    { id: '#12342', customer: 'Азамат К.', amount: '₸1,200', status: 'Завершен', time: '1 час назад' },
    { id: '#12341', customer: 'Гульнара С.', amount: '₸3,800', status: 'В обработке', time: '2 часа назад' },
  ];

  const recentActivity = [
    { text: 'Новый заказ #12345', time: '5 минут назад' },
    { text: 'Новый пользователь зарегистрирован', time: '12 минут назад' },
    { text: 'Низкий остаток товара "Блокнот А5"', time: '25 минут назад' },
    { text: 'Товар "Манас - эпос" добавлен', time: '1 час назад' },
    { text: 'Заказ #12340 отменен', time: '2 часа назад' },
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

              <div className="flex items-center gap-3 pl-3 border-l border-gray-700">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                  {user.fullName.charAt(0)}
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-semibold text-white">{user.fullName}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-[73px]">
        {/* Sidebar */}
        <aside className="w-72 p-4 flex flex-col sticky top-[73px] h-fit z-40">
          {/* Main Navigation Card */}
          <div className="bg-[#252d3d] rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2 text-gray-400">
                <LayoutDashboard size={18} />
                <span className="text-sm font-semibold">Навигация</span>
              </div>
            </div>
            
            <nav className="space-y-1">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => item.href !== '#' && router.push(item.href)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    item.active 
                      ? 'bg-violet-500/15 text-violet-400' 
                      : 'text-gray-400 hover:bg-[#2a3347] hover:text-white'
                  }`}
                >
                  <item.icon size={18} className="flex-shrink-0" />
                  <span className="text-sm font-medium">{item.title}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-[#252d3d] rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-2 text-gray-400 mb-4 px-2">
              <Settings size={18} />
              <span className="text-sm font-semibold">Быстрые действия</span>
            </div>
            
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-[#2a3347] hover:text-white transition-all">
                <MapPin size={18} className="flex-shrink-0" />
                <span className="text-sm font-medium">Филиалы</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-[#2a3347] hover:text-white transition-all">
                <FileText size={18} className="flex-shrink-0" />
                <span className="text-sm font-medium">Отчеты</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-[#2a3347] hover:text-white transition-all">
                <DollarSign size={18} className="flex-shrink-0" />
                <span className="text-sm font-medium">Финансы</span>
              </button>
            </div>
          </div>

          {/* Logout Button Card */}
          <div className="mt-auto">
            <div className="bg-[#252d3d] rounded-2xl p-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium text-sm transition-all"
              >
                <LogOut size={16} />
                <span>Выйти</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
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
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <stat.icon className="text-violet-400" size={24} strokeWidth={2.5} />
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400">
                      <TrendingUp size={14} />
                      <span className="text-xs font-bold">{stat.change}</span>
                    </div>
                  </div>
                  <h3 className="text-gray-400 text-sm font-semibold mb-1">{stat.title}</h3>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
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
                    className="bg-[#1e2533] rounded-xl p-5 text-left transition-all hover:shadow-lg hover:shadow-violet-500/5 hover:scale-[1.02] group border border-gray-800/30 hover:border-violet-500/30"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <action.icon className="text-violet-400" size={24} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">{action.title}</h4>
                        <p className="text-gray-400 text-sm">{action.desc}</p>
                      </div>
                      <ChevronRight className="text-gray-600 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" size={20} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Orders & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Orders */}
              <div className="lg:col-span-2 bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Последние заказы</h3>
                  <button className="text-violet-400 hover:text-violet-300 font-semibold text-sm flex items-center gap-1">
                    Все заказы
                    <ChevronRight size={16} />
                  </button>
                </div>
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
              </div>

              {/* Activity Feed */}
              <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
                <h3 className="text-xl font-bold text-white mb-6">Активность</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-2 h-2 bg-violet-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-white text-sm font-medium">{activity.text}</p>
                        <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                          <Clock size={12} />
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
