'use client';

import { useState, useEffect } from 'react';
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
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
} from 'lucide-react';
import CustomSelect from '@/app/components/CustomSelect';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface OrdersClientProps {
  user: User;
}

interface Order {
  id: string;
  orderNumber: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  };
  branch: {
    id: string;
    name: string;
    city: string;
  };
  total: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  items: any[];
}

interface Branch {
  id: string;
  name: string;
  city: string;
}

export default function OrdersClient({ user }: OrdersClientProps) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
    fetchBranches();
  }, [search, statusFilter, branchFilter, page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search,
        status: statusFilter,
        branchId: branchFilter,
        page: page.toString(),
        limit: '50',
      });

      const response = await fetch(`/api/admin/orders?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/admin/branches');
      if (response.ok) {
        const data = await response.json();
        setBranches(data.branches);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-blue-500/10 text-blue-400';
      case 'completed':
        return 'bg-green-500/10 text-green-400';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <Clock size={14} />;
      case 'completed':
        return <CheckCircle size={14} />;
      case 'cancelled':
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const menuItems = [
    { title: 'Панель управления', icon: LayoutDashboard, active: false, href: '/admin/dashboard' },
    { title: 'Пользователи', icon: Users, active: false, href: '/admin/users' },
    { title: 'Категории', icon: FolderTree, active: false, href: '/admin/categories' },
    { title: 'Товары', icon: Package, active: false, href: '/admin/products' },
    { title: 'Заказы', icon: ShoppingCart, active: true, href: '/admin/orders' },
    { title: 'Филиалы', icon: MapPin, active: false, href: '/admin/branches' },
    { title: 'Менеджеры', icon: Users, active: false, href: '/admin/managers' },
    { title: 'Отчеты', icon: FileText, active: false, href: '/admin/reports' },
    { title: 'Настройки', icon: Settings, active: false, href: '/admin/settings' },
  ];

  const activeFiltersCount = [
    statusFilter !== 'all',
    branchFilter !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#151b26]">
      {/* Header */}
      <header className="flex-shrink-0 bg-[#252d3d] border-b border-gray-800/50">
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

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarCollapsed ? 'w-20' : 'w-72'
          } flex-shrink-0 overflow-y-auto px-4 pt-4 flex flex-col transition-all duration-300`}
        >
          <div className="bg-[#252d3d] rounded-2xl p-4 mb-4">
            <div
              className={`flex items-center ${
                sidebarCollapsed ? 'justify-center' : 'justify-between'
              } mb-4 px-2`}
            >
              {!sidebarCollapsed && (
                <span className="text-sm font-semibold text-gray-400">Навигация</span>
              )}
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
                  className={`w-full flex items-center justify-center ${
                    sidebarCollapsed ? '' : 'justify-start gap-3 px-3'
                  } py-2.5 rounded-xl transition-all ${
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
                <button
                  onClick={() => router.push('/admin/reports')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-[#2a3347] hover:text-white transition-all"
                >
                  <FileText size={18} className="flex-shrink-0" />
                  <span className="text-sm font-medium">Отчеты</span>
                </button>
              </div>
            </div>
          )}

          <div className="mt-4">
            <div className="bg-[#252d3d] rounded-2xl p-4">
              <button
                onClick={handleLogout}
                className={`w-full flex items-center ${
                  sidebarCollapsed ? 'justify-center' : 'justify-center gap-2'
                } px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium text-sm transition-all`}
                title={sidebarCollapsed ? 'Выйти' : ''}
              >
                <LogOut size={16} />
                {!sidebarCollapsed && <span>Выйти</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <main className="p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-white mb-2">Заказы</h2>
              <p className="text-gray-400 font-semibold">Управление заказами клиентов</p>
            </div>

            {/* Filters */}
            <div className="mb-6">
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Поиск по номеру заказа или клиенту..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#252d3d] border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-sm text-white placeholder-gray-500"
                  />
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    activeFiltersCount > 0
                      ? 'bg-violet-500/15 text-violet-400 border-2 border-violet-500/30'
                      : 'bg-[#252d3d] text-gray-400 hover:text-white border-2 border-transparent'
                  }`}
                >
                  <Filter size={18} />
                  <span>Фильтры</span>
                  {activeFiltersCount > 0 && (
                    <span className="px-2 py-0.5 bg-violet-500 text-white rounded-full text-xs font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}
                  />
                </button>

                <button
                  onClick={() => {
                    /* TODO: Export */
                  }}
                  className="flex items-center gap-2 px-4 py-3 bg-[#252d3d] text-gray-400 hover:text-white rounded-xl font-medium text-sm transition-all"
                >
                  <Download size={18} />
                  <span>Экспорт</span>
                </button>
              </div>

              {showFilters && (
                <div className="bg-[#252d3d] rounded-xl p-6 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <Filter size={18} />
                      Параметры фильтрации
                    </h3>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={() => {
                          setStatusFilter('all');
                          setBranchFilter('all');
                        }}
                        className="text-red-400 hover:text-red-300 text-sm font-medium"
                      >
                        Сбросить все
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Статус заказа
                      </label>
                      <CustomSelect
                        value={statusFilter}
                        onChange={(value) => setStatusFilter(value)}
                        options={[
                          { value: 'all', label: 'Все статусы' },
                          { value: 'paid', label: 'Оплачен' },
                          { value: 'completed', label: 'Завершен' },
                          { value: 'cancelled', label: 'Отменен' },
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Филиал
                      </label>
                      <CustomSelect
                        value={branchFilter}
                        onChange={(value) => setBranchFilter(value)}
                        options={[
                          { value: 'all', label: 'Все филиалы' },
                          ...branches.map((branch) => ({
                            value: branch.id,
                            label: `${branch.name} (${branch.city})`,
                          })),
                        ]}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Orders Table */}
            <div className="bg-[#252d3d] rounded-2xl border border-gray-800/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#1e2533] sticky top-0">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Номер заказа
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Клиент
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Филиал
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Сумма
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Статус
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Дата
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                          Загрузка...
                        </td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                          Заказы не найдены
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-[#2a3347] transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-white">
                              {order.orderNumber}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-white">
                                {order.user.fullName}
                              </p>
                              <p className="text-xs text-gray-400">{order.user.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-white">
                                {order.branch.name}
                              </p>
                              <p className="text-xs text-gray-400">{order.branch.city}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-white">
                              {Number(order.total).toLocaleString('ru-RU')} KGS
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(
                                order.orderStatus
                              )}`}
                            >
                              {getStatusIcon(order.orderStatus)}
                              {getStatusText(order.orderStatus)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => router.push(`/admin/orders/${order.id}`)}
                              className="p-2 hover:bg-[#353d52] text-gray-400 hover:text-violet-400 rounded-lg transition-all"
                              title="Просмотр"
                            >
                              <Eye size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-800/50 flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    Страница {page} из {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-[#1e2533] text-gray-400 hover:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Назад
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-[#1e2533] text-gray-400 hover:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Вперед
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
