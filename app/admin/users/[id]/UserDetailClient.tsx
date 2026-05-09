'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Bell,
  LogOut,
  LayoutDashboard,
  FolderTree,
  Package,
  ShoppingCart,
  MapPin,
  FileText,
  Settings,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import EditUserModal from '../EditUserModal';
import DeleteUserModal from '../DeleteUserModal';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface UserDetail {
  id: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  role: string;
  phone: string | null;
  avatar: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    orders: number;
    branchUsers: number;
  };
  orders?: Array<{
    id: string;
    orderNumber: string;
    total: number;
    orderStatus: string;
    createdAt: string;
  }>;
  branchUsers?: Array<{
    branch: {
      id: string;
      name: string;
      city: string;
    };
  }>;
}

interface UserDetailClientProps {
  user: User;
  userId: string;
}

export default function UserDetailClient({ user, userId }: UserDetailClientProps) {
  const router = useRouter();
  const [userData, setUserData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems = [
    { title: 'Панель управления', icon: LayoutDashboard, href: '/admin/dashboard' },
    { title: 'Пользователи', icon: Users, active: true, href: '/admin/users' },
    { title: 'Категории', icon: FolderTree, href: '/admin/categories' },
    { title: 'Товары', icon: Package, href: '/admin/products' },
    { title: 'Заказы', icon: ShoppingCart, href: '#' },
    { title: 'Филиалы', icon: MapPin, href: '/admin/branches' },
    { title: 'Менеджеры', icon: Users, href: '/admin/managers' },
    { title: 'Отчеты', icon: FileText, href: '#' },
    { title: 'Настройки', icon: Settings, href: '/admin/settings' },
  ];

  useEffect(() => {
    fetchUserDetail();
  }, [userId]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();

      if (response.ok) {
        setUserData(data.user);
      } else {
        console.error('Error fetching user:', data.error);
        router.push('/admin/users');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      router.push('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="text-violet-400" size={24} />;
      case 'manager':
        return <Shield className="text-blue-400" size={24} />;
      default:
        return <ShieldAlert className="text-gray-400" size={24} />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'manager':
        return 'Менеджер';
      default:
        return 'Пользователь';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-xl text-sm font-semibold">
            <CheckCircle size={16} />
            Активен
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500/10 text-gray-400 rounded-xl text-sm font-semibold">
            <Clock size={16} />
            Неактивен
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl text-sm font-semibold">
            <XCircle size={16} />
            Заблокирован
          </span>
        );
      default:
        return null;
    }
  };

  const getOrderStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      paid: { label: 'Оплачен', color: 'green' },
      completed: { label: 'Завершен', color: 'blue' },
      cancelled: { label: 'Отменен', color: 'red' },
    };

    const config = statusConfig[status] || { label: status, color: 'gray' };

    return (
      <span className={`px-2 py-1 bg-${config.color}-500/10 text-${config.color}-400 rounded-lg text-xs font-semibold`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KGS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#151b26] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 mt-4">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-[#151b26] overflow-hidden">
      {/* Header - Fixed */}
      <header className="flex-shrink-0 bg-[#252d3d] border-b border-gray-800/50 z-50">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 w-72">
              <img
                src="/logonur.png"
                alt="Nur-Kitep Logo"
                className="w-10 h-10 rounded-xl object-cover"
              />
              <div>
                <h1 className="text-lg font-bold text-white">Nur-Kitep</h1>
                <p className="text-xs text-gray-400">Панель управления</p>
              </div>
            </div>

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

      {/* Content Area - Flex container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Fixed width, scrollable */}
        <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} flex-shrink-0 bg-[#151b26] border-r border-gray-800/50 overflow-y-auto transition-all duration-300`}>
          <div className="p-4 flex flex-col min-h-full">
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

            <div className="mt-auto">
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

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <main className="p-8">
            {/* Back Button */}
            <button
              onClick={() => router.push('/admin/users')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Назад к пользователям</span>
            </button>

            {/* User Header */}
            <div className="bg-[#252d3d] rounded-2xl border border-gray-800/50 p-8 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl flex-shrink-0">
                    {userData.fullName.charAt(0)}
                  </div>
                  <div>
                    <h1 className="text-3xl font-extrabold text-white mb-2">
                      {userData.fullName}
                    </h1>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(userData.role)}
                        <span className="text-gray-300 font-medium">
                          {getRoleLabel(userData.role)}
                        </span>
                      </div>
                      {getStatusBadge(userData.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Mail size={16} />
                        <span>{userData.email}</span>
                      </div>
                      {userData.phone && (
                        <div className="flex items-center gap-2">
                          <Phone size={16} />
                          <span>{userData.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-all font-medium"
                  >
                    <Edit2 size={16} />
                    <span>Редактировать</span>
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all font-medium"
                  >
                    <Trash2 size={16} />
                    <span>Заблокировать</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-[#252d3d] rounded-2xl border border-gray-800/50 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm font-medium">Всего заказов</span>
                  <ShoppingCart className="text-violet-400" size={20} />
                </div>
                <p className="text-3xl font-bold text-white">{userData._count.orders}</p>
              </div>

              {userData.role === 'manager' && (
                <div className="bg-[#252d3d] rounded-2xl border border-gray-800/50 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm font-medium">Филиалов</span>
                    <MapPin className="text-blue-400" size={20} />
                  </div>
                  <p className="text-3xl font-bold text-white">{userData._count.branchUsers}</p>
                </div>
              )}

              <div className="bg-[#252d3d] rounded-2xl border border-gray-800/50 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm font-medium">Дата регистрации</span>
                  <Calendar className="text-green-400" size={20} />
                </div>
                <p className="text-lg font-bold text-white">{formatDate(userData.createdAt)}</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              {userData.orders && userData.orders.length > 0 && (
                <div className="bg-[#252d3d] rounded-2xl border border-gray-800/50 p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Последние заказы</h2>
                  <div className="space-y-3">
                    {userData.orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 bg-[#1e2533] rounded-xl hover:bg-[#252d3d] transition-colors"
                      >
                        <div>
                          <p className="text-white font-semibold text-sm mb-1">
                            #{order.orderNumber}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm mb-1">
                            {formatAmount(order.total)}
                          </p>
                          {getOrderStatusBadge(order.orderStatus)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Branches (for managers) */}
              {userData.role === 'manager' && userData.branchUsers && userData.branchUsers.length > 0 && (
                <div className="bg-[#252d3d] rounded-2xl border border-gray-800/50 p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Филиалы</h2>
                  <div className="space-y-3">
                    {userData.branchUsers.map((branchUser) => (
                      <div
                        key={branchUser.branch.id}
                        className="flex items-center gap-3 p-4 bg-[#1e2533] rounded-xl hover:bg-[#252d3d] transition-colors cursor-pointer"
                        onClick={() => router.push(`/admin/branches/${branchUser.branch.id}`)}
                      >
                        <MapPin className="text-blue-400" size={20} />
                        <div>
                          <p className="text-white font-semibold text-sm">
                            {branchUser.branch.name}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {branchUser.branch.city}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Account Info */}
              <div className="bg-[#252d3d] rounded-2xl border border-gray-800/50 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Информация об аккаунте</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Email подтвержден</p>
                    <div className="flex items-center gap-2">
                      {userData.emailVerified ? (
                        <>
                          <CheckCircle className="text-green-400" size={16} />
                          <span className="text-white font-medium">Да</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="text-red-400" size={16} />
                          <span className="text-white font-medium">Нет</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Последнее обновление</p>
                    <p className="text-white font-medium">{formatDate(userData.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Modals */}
      <EditUserModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          fetchUserDetail();
          setShowEditModal(false);
        }}
        user={userData}
      />

      <DeleteUserModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onSuccess={() => {
          router.push('/admin/users');
        }}
        user={userData}
      />
    </div>
  );
}
