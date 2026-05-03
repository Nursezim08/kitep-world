'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Building2,
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bell,
  LogOut,
  LayoutDashboard,
  Users,
  Package,
  Settings,
  FileText,
} from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  status: string;
}

interface Order {
  id: string;
  orderNumber: string;
  total: string;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
}

interface Manager {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  branchUsers: {
    branch: Branch;
  }[];
  orders: Order[];
}

interface ManagerDetailClientProps {
  manager: Manager;
  currentUser: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

export default function ManagerDetailClient({ manager, currentUser }: ManagerDetailClientProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'inactive':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'blocked':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активен';
      case 'inactive':
        return 'Неактивен';
      case 'blocked':
        return 'Заблокирован';
      default:
        return status;
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-blue-500/10 text-blue-400';
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Оплачен';
      case 'completed':
        return 'Завершен';
      case 'cancelled':
        return 'Отменен';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const branch = manager.branchUsers[0]?.branch;
  const totalOrders = manager.orders.length;
  const totalRevenue = manager.orders.reduce((sum, order) => sum + Number(order.total), 0);

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

  return (
    <div className="min-h-screen bg-[#151b26] overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#252d3d] border-b border-gray-800/50">
        <div className="px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/logonur.png" 
                alt="Nur-Kitep Logo" 
                className="w-10 h-10 rounded-xl object-cover"
              />
              <div>
                <h1 className="text-lg font-bold text-white">Nur-Kitep</h1>
                <p className="text-xs text-gray-400">Информация о менеджере</p>
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
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-semibold text-white">{currentUser.fullName}</p>
                  <p className="text-xs text-gray-400">{currentUser.email}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2.5 hover:bg-red-500/10 rounded-xl transition-colors text-gray-400 hover:text-red-400"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex pt-[73px] overflow-x-hidden">
        {/* Sidebar */}
        <aside className="w-80 p-4 flex flex-col sticky top-[73px] h-fit z-40 flex-shrink-0">
          {/* Main Navigation Card */}
          <div className="bg-[#252d3d] rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2 text-gray-400">
                <LayoutDashboard size={18} />
                <span className="text-sm font-semibold">Навигация</span>
              </div>
            </div>
            
            <nav className="space-y-1">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white"
              >
                <LayoutDashboard size={18} className="flex-shrink-0" />
                <span className="text-sm font-medium">Панель управления</span>
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white"
              >
                <Users size={18} className="flex-shrink-0" />
                <span className="text-sm font-medium">Пользователи</span>
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white"
              >
                <Package size={18} className="flex-shrink-0" />
                <span className="text-sm font-medium">Товары</span>
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white"
              >
                <ShoppingCart size={18} className="flex-shrink-0" />
                <span className="text-sm font-medium">Заказы</span>
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white"
              >
                <MapPin size={18} className="flex-shrink-0" />
                <span className="text-sm font-medium">Филиалы</span>
              </button>
              <button
                onClick={() => router.push('/admin/managers')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all bg-violet-500/15 text-violet-400"
              >
                <Users size={18} className="flex-shrink-0" />
                <span className="text-sm font-medium">Менеджеры</span>
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white"
              >
                <FileText size={18} className="flex-shrink-0" />
                <span className="text-sm font-medium">Отчеты</span>
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white"
              >
                <Settings size={18} className="flex-shrink-0" />
                <span className="text-sm font-medium">Настройки</span>
              </button>
            </nav>
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

        {/* Main Content Area */}
        <div className="flex-1 p-4 md:p-8 min-w-0">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">Информация о менеджере</h2>
          </div>

          {/* Manager Info Card */}
          <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50 mb-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                {manager.fullName.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{manager.fullName}</h2>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-semibold border ${getStatusColor(manager.status)}`}>
                      {manager.status === 'active' && <CheckCircle size={14} />}
                      {manager.status === 'inactive' && <AlertCircle size={14} />}
                      {manager.status === 'blocked' && <XCircle size={14} />}
                      {getStatusText(manager.status)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
                      <Mail className="text-violet-400" size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-white font-medium">{manager.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
                      <Phone className="text-violet-400" size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Телефон</p>
                      <p className="text-sm text-white font-medium">{manager.phone || '—'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
                      <Calendar className="text-violet-400" size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Дата создания</p>
                      <p className="text-sm text-white font-medium">{formatDate(manager.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
                      <Shield className="text-violet-400" size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Роль</p>
                      <p className="text-sm text-white font-medium">Менеджер</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="text-blue-400" size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Всего заказов</p>
                  <p className="text-2xl font-bold text-white">{totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="text-emerald-400" size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Общая сумма</p>
                  <p className="text-2xl font-bold text-white">₸{totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center">
                  <Building2 className="text-violet-400" size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Филиал</p>
                  <p className="text-lg font-bold text-white">{branch ? branch.name : 'Не назначен'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Branch Info */}
            {branch && (
              <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Building2 size={20} className="text-violet-400" />
                  Информация о филиале
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-[#1e2533] rounded-xl">
                    <MapPin size={16} className="text-violet-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Адрес</p>
                      <p className="text-sm text-white">{branch.city}, {branch.district}</p>
                      <p className="text-sm text-gray-400">{branch.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-[#1e2533] rounded-xl">
                    <Phone size={16} className="text-violet-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Телефон филиала</p>
                      <p className="text-sm text-white">{branch.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-[#1e2533] rounded-xl">
                    <Mail size={16} className="text-violet-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Email филиала</p>
                      <p className="text-sm text-white">{branch.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-[#1e2533] rounded-xl">
                    <Shield size={16} className="text-violet-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Код филиала</p>
                      <p className="text-sm text-white font-mono">{branch.code}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Orders */}
            <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <ShoppingCart size={20} className="text-violet-400" />
                Последние заказы
              </h3>
              {manager.orders.length > 0 ? (
                <div className="space-y-2">
                  {manager.orders.map((order) => (
                    <div key={order.id} className="p-3 bg-[#1e2533] rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-white">{order.orderNumber}</p>
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getOrderStatusColor(order.orderStatus)}`}>
                          {getOrderStatusText(order.orderStatus)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock size={12} />
                          {formatDate(order.createdAt)}
                        </div>
                        <p className="text-white font-semibold">₸{Number(order.total).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart size={48} className="mx-auto mb-2 opacity-20" />
                  <p>Нет заказов</p>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
