'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Code,
  Building2,
  Users,
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bell,
  LogOut,
  LayoutDashboard,
  Package,
  Settings,
  FileText,
  Box,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface BranchUser {
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    status: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  total: string;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
}

interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  latitude: string | null;
  longitude: string | null;
  openTime: string | null;
  closeTime: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  branchUsers: BranchUser[];
  orders: Order[];
  _count: {
    branchUsers: number;
    orders: number;
    inventory: number;
  };
}

interface BranchDetailClientProps {
  branch: Branch;
  currentUser: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

export default function BranchDetailClient({ branch, currentUser }: BranchDetailClientProps) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'inactive':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'closed':
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
      case 'closed':
        return 'Закрыт';
      default:
        return status;
    }
  };

  const getUserStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-400';
      case 'inactive':
        return 'bg-gray-500/10 text-gray-400';
      case 'blocked':
        return 'bg-red-500/10 text-red-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getUserStatusText = (status: string) => {
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

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '—';
    const date = new Date(timeString);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalRevenue = branch.orders.reduce((sum, order) => sum + Number(order.total), 0);

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
                <p className="text-xs text-gray-400">Информация о филиале</p>
              </div>
            </div>

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

      <div className="flex pt-[73px] overflow-x-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-20' : 'w-80'} px-4 pt-4 flex flex-col flex-shrink-0 transition-all duration-300 sticky top-[73px] self-start`}>
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
              <button
                onClick={() => router.push('/admin/dashboard')}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white`}
                title={sidebarCollapsed ? 'Панель управления' : ''}
              >
                <LayoutDashboard size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Панель управления</span>}
              </button>
              <button
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white`}
                title={sidebarCollapsed ? 'Пользователи' : ''}
              >
                <Users size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Пользователи</span>}
              </button>
              <button
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white`}
                title={sidebarCollapsed ? 'Товары' : ''}
              >
                <Package size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Товары</span>}
              </button>
              <button
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white`}
                title={sidebarCollapsed ? 'Заказы' : ''}
              >
                <ShoppingCart size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Заказы</span>}
              </button>
              <button
                onClick={() => router.push('/admin/branches')}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl transition-all bg-violet-500/15 text-violet-400`}
                title={sidebarCollapsed ? 'Филиалы' : ''}
              >
                <MapPin size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Филиалы</span>}
              </button>
              <button
                onClick={() => router.push('/admin/managers')}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white`}
                title={sidebarCollapsed ? 'Менеджеры' : ''}
              >
                <Users size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Менеджеры</span>}
              </button>
              <button
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white`}
                title={sidebarCollapsed ? 'Отчеты' : ''}
              >
                <FileText size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Отчеты</span>}
              </button>
              <button
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white`}
                title={sidebarCollapsed ? 'Настройки' : ''}
              >
                <Settings size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Настройки</span>}
              </button>
            </nav>
          </div>

          <div className="mt-4">
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
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 p-4 md:p-8 min-w-0">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">Информация о филиале</h2>
          </div>

          {/* Branch Info Card */}
          <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50 mb-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                {branch.name.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{branch.name}</h2>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-semibold border ${getStatusColor(branch.status)}`}>
                      {branch.status === 'active' && <CheckCircle size={14} />}
                      {branch.status === 'inactive' && <AlertCircle size={14} />}
                      {branch.status === 'closed' && <XCircle size={14} />}
                      {getStatusText(branch.status)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
                      <Code className="text-violet-400" size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Код филиала</p>
                      <p className="text-sm text-white font-mono font-medium">{branch.code}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
                      <MapPin className="text-violet-400" size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Город</p>
                      <p className="text-sm text-white font-medium">{branch.city}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
                      <Mail className="text-violet-400" size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-white font-medium">{branch.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
                      <Phone className="text-violet-400" size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Телефон</p>
                      <p className="text-sm text-white font-medium">{branch.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
                      <Calendar className="text-violet-400" size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Дата создания</p>
                      <p className="text-sm text-white font-medium">{formatDate(branch.createdAt)}</p>
                    </div>
                  </div>

                  {(branch.openTime || branch.closeTime) && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-violet-500 rounded-xl flex items-center justify-center">
                        <Clock className="text-white" size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Время работы</p>
                        <p className="text-sm text-white font-medium">
                          {formatTime(branch.openTime)} - {formatTime(branch.closeTime)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Users className="text-blue-400" size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Менеджеры</p>
                  <p className="text-2xl font-bold text-white">{branch._count.branchUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="text-emerald-400" size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Заказы</p>
                  <p className="text-2xl font-bold text-white">{branch._count.orders}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="text-violet-400" size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Выручка</p>
                  <p className="text-2xl font-bold text-white">₸{totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                  <Box className="text-orange-400" size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Товары</p>
                  <p className="text-2xl font-bold text-white">{branch._count.inventory}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Address Info */}
            <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-violet-400" />
                Адрес филиала
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-[#1e2533] rounded-xl">
                  <Building2 size={16} className="text-violet-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Район</p>
                    <p className="text-sm text-white">{branch.district}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-[#1e2533] rounded-xl">
                  <MapPin size={16} className="text-violet-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Полный адрес</p>
                    <p className="text-sm text-white">{branch.address}</p>
                  </div>
                </div>

                {(branch.latitude && branch.longitude) && (
                  <div className="flex items-start gap-3 p-3 bg-[#1e2533] rounded-xl">
                    <MapPin size={16} className="text-violet-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Координаты</p>
                      <p className="text-sm text-white font-mono">
                        {branch.latitude}, {branch.longitude}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Managers List */}
            <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users size={20} className="text-violet-400" />
                Менеджеры филиала
              </h3>
              {branch.branchUsers.length > 0 ? (
                <div className="space-y-2">
                  {branch.branchUsers.map((bu) => (
                    <div key={bu.user.id} className="p-3 bg-[#1e2533] rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                          {bu.user.fullName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{bu.user.fullName}</p>
                          <p className="text-xs text-gray-400">{bu.user.email}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getUserStatusColor(bu.user.status)}`}>
                          {getUserStatusText(bu.user.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <User size={48} className="mx-auto mb-2 opacity-20" />
                  <p>Нет назначенных менеджеров</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50 mt-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ShoppingCart size={20} className="text-violet-400" />
              Последние заказы
            </h3>
            {branch.orders.length > 0 ? (
              <div className="space-y-2">
                {branch.orders.map((order) => (
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
  );
}
