'use client';

import { useRouter } from 'next/navigation';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  Settings, 
  TrendingUp, 
  DollarSign,
  FileText,
  MapPin,
  LogOut,
  Bell,
  Search,
  ChevronRight,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
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

  const stats = [
    { 
      title: 'Пользователи', 
      value: '1,234', 
      change: '+12%',
      icon: Users, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500'
    },
    { 
      title: 'Товары', 
      value: '10,567', 
      change: '+8%',
      icon: Package, 
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-500'
    },
    { 
      title: 'Заказы', 
      value: '3,456', 
      change: '+23%',
      icon: ShoppingCart, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-500'
    },
    { 
      title: 'Доход', 
      value: '₸2.4M', 
      change: '+18%',
      icon: DollarSign, 
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-500'
    },
  ];

  const quickActions = [
    { title: 'Добавить товар', desc: 'Создать новый товар в каталоге', icon: Package, color: 'bg-blue-50', iconColor: 'text-blue-500' },
    { title: 'Управление заказами', desc: 'Просмотр и обработка заказов', icon: ShoppingCart, color: 'bg-purple-50', iconColor: 'text-purple-500' },
    { title: 'Управление пользователями', desc: 'Просмотр и редактирование пользователей', icon: Users, color: 'bg-green-50', iconColor: 'text-green-500' },
    { title: 'Настройки системы', desc: 'Конфигурация и параметры', icon: Settings, color: 'bg-orange-50', iconColor: 'text-orange-500' },
    { title: 'Филиалы', desc: 'Управление филиалами магазинов', icon: MapPin, color: 'bg-violet-50', iconColor: 'text-violet-500' },
    { title: 'Отчеты', desc: 'Аналитика и статистика', icon: FileText, color: 'bg-pink-50', iconColor: 'text-pink-500' },
  ];

  const recentOrders = [
    { id: '#12345', customer: 'Айгерим Т.', amount: '₸4,500', status: 'completed', time: '5 мин назад' },
    { id: '#12344', customer: 'Бекжан И.', amount: '₸2,300', status: 'processing', time: '12 мин назад' },
    { id: '#12343', customer: 'Нурайым А.', amount: '₸6,700', status: 'pending', time: '25 мин назад' },
    { id: '#12342', customer: 'Азамат К.', amount: '₸1,200', status: 'completed', time: '1 час назад' },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-50 text-green-600 border-green-200',
      processing: 'bg-blue-50 text-blue-600 border-blue-200',
      pending: 'bg-orange-50 text-orange-600 border-orange-200',
      cancelled: 'bg-red-50 text-red-600 border-red-200',
    };
    const labels = {
      completed: 'Завершен',
      processing: 'В обработке',
      pending: 'Ожидает',
      cancelled: 'Отменен',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-violet-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-violet-500 to-violet-600 bg-clip-text text-transparent">
                  Nur-Kitep Admin
                </h1>
                <p className="text-xs text-gray-500 font-semibold">Панель управления</p>
              </div>
            </div>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm font-semibold"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="hidden md:flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-bold text-black">{user.fullName}</p>
                  <p className="text-xs text-gray-500 font-semibold">{user.email}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold">
                  {user.fullName.charAt(0)}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-sm transition-all border border-red-200"
              >
                <LogOut size={16} />
                <span className="hidden md:inline">Выйти</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-black mb-2">
            Добро пожаловать, {user.fullName.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-600 font-semibold">
            Вот что происходит в вашем магазине сегодня
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-violet-200 hover:shadow-xl transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`${stat.iconColor}`} size={24} strokeWidth={2.5} />
                </div>
                <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-lg">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm font-bold mb-1">{stat.title}</h3>
              <p className="text-3xl font-extrabold text-black">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm mb-8">
          <h3 className="text-xl font-extrabold text-black mb-6">Быстрые действия</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className={`${action.color} rounded-xl p-5 text-left transition-all hover:shadow-lg hover:scale-105 group border-2 border-transparent hover:border-violet-200`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <action.icon className={action.iconColor} size={24} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-black font-bold mb-1">{action.title}</h4>
                    <p className="text-gray-600 text-sm font-semibold">{action.desc}</p>
                  </div>
                  <ChevronRight className="text-gray-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" size={20} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Orders & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-extrabold text-black">Последние заказы</h3>
              <button className="text-violet-500 hover:text-violet-600 font-bold text-sm flex items-center gap-1">
                Все заказы
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="space-y-3">
              {recentOrders.map((order, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                      {order.customer.charAt(0)}
                    </div>
                    <div>
                      <p className="text-black font-bold text-sm">{order.customer}</p>
                      <p className="text-gray-500 text-xs font-semibold">{order.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(order.status)}
                    <div className="text-right">
                      <p className="text-black font-bold text-sm">{order.amount}</p>
                      <p className="text-gray-500 text-xs font-semibold">{order.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
            <h3 className="text-xl font-extrabold text-black mb-6">Активность</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="text-green-500" size={16} />
                </div>
                <div>
                  <p className="text-black text-sm font-bold">Новый заказ</p>
                  <p className="text-gray-500 text-xs font-semibold">5 минут назад</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="text-blue-500" size={16} />
                </div>
                <div>
                  <p className="text-black text-sm font-bold">Новый пользователь</p>
                  <p className="text-gray-500 text-xs font-semibold">12 минут назад</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="text-orange-500" size={16} />
                </div>
                <div>
                  <p className="text-black text-sm font-bold">Низкий остаток товара</p>
                  <p className="text-gray-500 text-xs font-semibold">25 минут назад</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="text-purple-500" size={16} />
                </div>
                <div>
                  <p className="text-black text-sm font-bold">Товар добавлен</p>
                  <p className="text-gray-500 text-xs font-semibold">1 час назад</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <XCircle className="text-red-500" size={16} />
                </div>
                <div>
                  <p className="text-black text-sm font-bold">Заказ отменен</p>
                  <p className="text-gray-500 text-xs font-semibold">2 часа назад</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
