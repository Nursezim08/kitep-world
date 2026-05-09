'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Phone,
  Calendar,
  LogOut,
  Bell,
  LayoutDashboard,
  FolderTree,
  Package,
  ShoppingCart,
  MapPin,
  FileText,
  Settings,
  Filter,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import DeleteUserModal from './DeleteUserModal';
import CustomSelect from '@/app/components/CustomSelect';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phone: string | null;
  avatar: string | null;
  status: string;
}

interface UserData {
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
}

interface UsersClientProps {
  user: User;
}

export default function UsersClient({ user }: UsersClientProps) {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
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
    fetchUsers();
  }, [searchQuery, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
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
        return <ShieldCheck className="text-violet-400" size={16} />;
      case 'manager':
        return <Shield className="text-blue-400" size={16} />;
      default:
        return <ShieldAlert className="text-gray-400" size={16} />;
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
          <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded-lg text-xs font-semibold">
            Активен
          </span>
        );
      case 'inactive':
        return (
          <span className="px-2 py-1 bg-gray-500/10 text-gray-400 rounded-lg text-xs font-semibold">
            Неактивен
          </span>
        );
      case 'blocked':
        return (
          <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded-lg text-xs font-semibold">
            Заблокирован
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

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
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-white mb-2">Пользователи</h2>
              <p className="text-gray-400 font-semibold">
                Управление пользователями системы
              </p>
            </div>

            {/* Search, Filter and Add */}
            <div className="mb-6">
              {/* Top Row: Search and Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Поиск по имени или email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#252d3d] border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                  />
                </div>

                {/* Filter Toggle Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all font-medium relative ${
                    showFilters
                      ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30'
                      : 'bg-[#252d3d] text-gray-400 border border-gray-700/50 hover:border-violet-500/30 hover:text-violet-400'
                  }`}
                >
                  <Filter size={20} />
                  <span>Фильтры</span>
                  {(roleFilter !== 'all' || statusFilter !== 'all') && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {(roleFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)}
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                {/* Add Button */}
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 whitespace-nowrap"
                >
                  <Plus size={20} />
                  <span>Добавить</span>
                </button>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="bg-[#252d3d] border border-gray-700/50 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Filter className="w-5 h-5 text-violet-400" />
                      <h3 className="text-white font-semibold">Параметры фильтрации</h3>
                    </div>
                    {(roleFilter !== 'all' || statusFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setRoleFilter('all');
                          setStatusFilter('all');
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all text-sm font-medium"
                      >
                        <X className="w-4 h-4" />
                        Сбросить все
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Role Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Роль
                      </label>
                      <CustomSelect
                        value={roleFilter}
                        onChange={(value) => setRoleFilter(value)}
                        options={[
                          { value: 'all', label: 'Все роли' },
                          { value: 'manager', label: 'Менеджеры' },
                          { value: 'user', label: 'Пользователи' },
                        ]}
                      />
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Статус
                      </label>
                      <CustomSelect
                        value={statusFilter}
                        onChange={(value) => setStatusFilter(value)}
                        options={[
                          { value: 'all', label: 'Все статусы' },
                          { value: 'active', label: 'Активные' },
                          { value: 'inactive', label: 'Неактивные' },
                          { value: 'blocked', label: 'Заблокированные' },
                        ]}
                      />
                    </div>
                  </div>

                  {/* Active Filters Display */}
                  {(roleFilter !== 'all' || statusFilter !== 'all') && (
                    <div className="pt-4 border-t border-gray-700/50">
                      <p className="text-sm text-gray-400 mb-2">Активные фильтры:</p>
                      <div className="flex flex-wrap gap-2">
                        {roleFilter !== 'all' && (
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-500/15 text-violet-400 rounded-lg text-sm font-medium">
                            Роль: {roleFilter === 'manager' ? 'Менеджеры' : 'Пользователи'}
                            <button
                              onClick={() => setRoleFilter('all')}
                              className="hover:bg-violet-500/20 rounded p-0.5 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                        {statusFilter !== 'all' && (
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-500/15 text-violet-400 rounded-lg text-sm font-medium">
                            Статус: {statusFilter === 'active' ? 'Активные' : statusFilter === 'inactive' ? 'Неактивные' : 'Заблокированные'}
                            <button
                              onClick={() => setStatusFilter('all')}
                              className="hover:bg-violet-500/20 rounded p-0.5 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Users Table */}
            <div className="bg-[#252d3d] rounded-2xl border border-gray-800/50 overflow-hidden">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="inline-block w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
                  <p className="text-gray-400 mt-4">Загрузка...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg font-semibold">
                    Пользователи не найдены
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1e2533] border-b border-gray-800/50 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Пользователь
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Роль
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Контакты
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Статус
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Статистика
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Дата регистрации
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Действия
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {users.map((userData) => (
                        <tr
                          key={userData.id}
                          onClick={() => router.push(`/admin/users/${userData.id}`)}
                          className="hover:bg-[#1e2533] transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                                {userData.fullName.charAt(0)}
                              </div>
                              <div>
                                <p className="text-white font-semibold text-sm">
                                  {userData.fullName}
                                </p>
                                <p className="text-gray-500 text-xs">{userData.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getRoleIcon(userData.role)}
                              <span className="text-white text-sm">
                                {getRoleLabel(userData.role)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-gray-400 text-xs">
                                <Mail size={12} />
                                <span>{userData.email}</span>
                              </div>
                              {userData.phone && (
                                <div className="flex items-center gap-2 text-gray-400 text-xs">
                                  <Phone size={12} />
                                  <span>{userData.phone}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(userData.status)}</td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="text-gray-400 text-xs">
                                Заказов: <span className="text-white font-semibold">{userData._count.orders}</span>
                              </p>
                              {userData.role === 'manager' && (
                                <p className="text-gray-400 text-xs">
                                  Филиалов: <span className="text-white font-semibold">{userData._count.branchUsers}</span>
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-gray-400 text-xs">
                              <Calendar size={12} />
                              <span>{formatDate(userData.createdAt)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedUser(userData);
                                  setShowEditModal(true);
                                }}
                                className="p-2 hover:bg-[#2a3347] rounded-lg transition-colors text-gray-400 hover:text-violet-400"
                                title="Редактировать"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedUser(userData);
                                  setShowDeleteModal(true);
                                }}
                                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all text-xs font-medium"
                                title="Заблокировать"
                              >
                                Заблокировать
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchUsers}
      />

      <EditUserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onSuccess={fetchUsers}
        user={selectedUser}
      />

      <DeleteUserModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        onSuccess={fetchUsers}
        user={selectedUser}
      />
    </div>
  );
}
