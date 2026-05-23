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
  Download,
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Image as ImageIcon,
} from 'lucide-react';
import CustomSelect from '@/app/components/CustomSelect';
import DatePicker from '@/app/components/DatePicker';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface ReportsClientProps {
  user: User;
}

interface Branch {
  id: string;
  name: string;
  city: string;
}

interface OverviewData {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  ordersByStatus: Array<{
    orderStatus: string;
    _count: number;
  }>;
  revenueByBranch: Array<{
    branchId: string;
    branchName: string;
    city: string;
    revenue: number;
    orders: number;
  }>;
}

interface SalesData {
  sales: Array<{
    productId: string;
    productName: string;
    sku: string;
    image: string | null;
    quantity: number;
    revenue: number;
    orders: number;
  }>;
}

interface CustomersData {
  customers: Array<{
    userId: string;
    fullName: string;
    email: string;
    phone: string;
    avatar: string | null;
    totalSpent: number;
    orders: number;
  }>;
}

interface InventoryData {
  inventory: Array<{
    branchId: string;
    branchName: string;
    city: string;
    productId: string;
    productName: string;
    sku: string;
    image: string | null;
    quantity: number;
    price: number;
    totalValue: number;
  }>;
}

export default function ReportsClient({ user }: ReportsClientProps) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'customers' | 'inventory'>(
    'overview'
  );
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchFilter, setBranchFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  // Data states
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [customersData, setCustomersData] = useState<CustomersData | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryData | null>(null);

  useEffect(() => {
    fetchBranches();
    fetchReportData();
  }, [activeTab, branchFilter, startDate, endDate]);

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

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: activeTab,
        branchId: branchFilter,
      });

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/admin/reports?${params}`);
      if (response.ok) {
        const data = await response.json();

        switch (activeTab) {
          case 'overview':
            setOverviewData(data);
            break;
          case 'sales':
            setSalesData(data);
            break;
          case 'customers':
            setCustomersData(data);
            break;
          case 'inventory':
            setInventoryData(data);
            break;
        }
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
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

  const exportReport = () => {
    // TODO: Implement export functionality
    alert('Экспорт отчета в разработке');
  };

  const menuItems = [
    { title: 'Панель управления', icon: LayoutDashboard, active: false, href: '/admin/dashboard' },
    { title: 'Пользователи', icon: Users, active: false, href: '/admin/users' },
    { title: 'Категории', icon: FolderTree, active: false, href: '/admin/categories' },
    { title: 'Товары', icon: Package, active: false, href: '/admin/products' },
    { title: 'Баннеры', icon: ImageIcon, active: false, href: '/admin/banners' },
    { title: 'Заказы', icon: ShoppingCart, active: false, href: '/admin/orders' },
    { title: 'Филиалы', icon: MapPin, active: false, href: '/admin/branches' },
    { title: 'Менеджеры', icon: Users, active: false, href: '/admin/managers' },
    { title: 'Отчеты', icon: FileText, active: true, href: '/admin/reports' },
    { title: 'Настройки', icon: Settings, active: false, href: '/admin/settings' },
  ];

  const tabs = [
    { id: 'overview', label: 'Обзор', icon: BarChart3 },
    { id: 'sales', label: 'Продажи', icon: TrendingUp },
    { id: 'customers', label: 'Клиенты', icon: Users },
    { id: 'inventory', label: 'Остатки', icon: Package },
  ];

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
        <aside
          className={`${
            sidebarCollapsed ? 'w-20' : 'w-72'
          } flex-shrink-0 bg-[#151b26] overflow-y-auto no-scrollbar transition-all duration-300`}
        >
          <div className="p-4 flex flex-col min-h-full">
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

          <div className="mt-auto mb-2">
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
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <main className="p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-white mb-2">Отчеты и аналитика</h2>
              <p className="text-gray-400 font-semibold">
                Статистика и анализ деятельности магазина
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-violet-500/15 text-violet-400 border-2 border-violet-500/30'
                      : 'bg-[#252d3d] text-gray-400 hover:text-white border-2 border-transparent'
                  }`}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="bg-[#252d3d] rounded-xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Дата начала
                  </label>
                  <DatePicker
                    value={startDate}
                    onChange={(value) => setStartDate(value)}
                    placeholder="Выберите дату начала"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Дата окончания
                  </label>
                  <DatePicker
                    value={endDate}
                    onChange={(value) => setEndDate(value)}
                    placeholder="Выберите дату окончания"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={exportReport}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-500/15 text-violet-400 hover:bg-violet-500/25 rounded-xl font-medium text-sm transition-all"
                >
                  <Download size={18} />
                  <span>Экспорт отчета</span>
                </button>
              </div>
            </div>

            {/* Report Content */}
            {loading ? (
              <div className="bg-[#252d3d] rounded-2xl p-12 text-center border border-gray-800/50">
                <div className="text-gray-400">Загрузка данных...</div>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && overviewData && (
                  <OverviewReport data={overviewData} />
                )}
                {activeTab === 'sales' && salesData && <SalesReport data={salesData} />}
                {activeTab === 'customers' && customersData && (
                  <CustomersReport data={customersData} />
                )}
                {activeTab === 'inventory' && inventoryData && (
                  <InventoryReport data={inventoryData} />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// Overview Report Component
function OverviewReport({ data }: { data: OverviewData }) {
  const stats = [
    {
      title: 'Всего заказов',
      value: data.totalOrders.toLocaleString('ru-RU'),
      icon: ShoppingCart,
      color: 'violet',
    },
    {
      title: 'Общая выручка',
      value: `${Number(data.totalRevenue).toLocaleString('ru-RU')} KGS`,
      icon: DollarSign,
      color: 'green',
    },
    {
      title: 'Клиентов',
      value: data.totalUsers.toLocaleString('ru-RU'),
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Товаров',
      value: data.totalProducts.toLocaleString('ru-RU'),
      icon: Package,
      color: 'orange',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50 hover:border-violet-500/30 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center">
                <stat.icon className="text-violet-400" size={24} />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-semibold mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Orders by Status */}
      <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
        <h3 className="text-xl font-bold text-white mb-4">Заказы по статусам</h3>
        <div className="space-y-3">
          {data.ordersByStatus.map((item) => (
            <div key={item.orderStatus} className="flex items-center justify-between">
              <span className="text-gray-400">
                {item.orderStatus === 'paid'
                  ? 'Оплачен'
                  : item.orderStatus === 'completed'
                  ? 'Завершен'
                  : 'Отменен'}
              </span>
              <span className="text-white font-semibold">{item._count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue by Branch */}
      <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
        <h3 className="text-xl font-bold text-white mb-4">Выручка по филиалам</h3>
        <div className="space-y-4">
          {data.revenueByBranch.map((item) => (
            <div key={item.branchId} className="p-4 bg-[#1e2533] rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-white font-semibold">{item.branchName}</p>
                  <p className="text-gray-400 text-sm">{item.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">
                    {Number(item.revenue).toLocaleString('ru-RU')} KGS
                  </p>
                  <p className="text-gray-400 text-sm">{item.orders} заказов</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Sales Report Component
function SalesReport({ data }: { data: SalesData }) {
  return (
    <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
      <h3 className="text-xl font-bold text-white mb-4">Топ товаров по продажам</h3>
      <div className="space-y-4">
        {data.sales.map((item, index) => (
          <div key={item.productId} className="flex gap-4 p-4 bg-[#1e2533] rounded-xl">
            <div className="flex items-center gap-4 flex-1">
              <span className="text-2xl font-bold text-gray-600">#{index + 1}</span>
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.productName}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-[#2a3347] rounded-lg flex items-center justify-center">
                  <Package size={24} className="text-gray-600" />
                </div>
              )}
              <div className="flex-1 overflow-y-auto">
                <p className="text-white font-semibold">{item.productName}</p>
                <p className="text-gray-400 text-sm">SKU: {item.sku}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-bold">
                {Number(item.revenue).toLocaleString('ru-RU')} KGS
              </p>
              <p className="text-gray-400 text-sm">
                {item.quantity} шт. • {item.orders} заказов
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Customers Report Component
function CustomersReport({ data }: { data: CustomersData }) {
  return (
    <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
      <h3 className="text-xl font-bold text-white mb-4">Топ клиентов</h3>
      <div className="space-y-4">
        {data.customers.map((customer, index) => (
          <div key={customer.userId} className="flex gap-4 p-4 bg-[#1e2533] rounded-xl">
            <div className="flex items-center gap-4 flex-1">
              <span className="text-2xl font-bold text-gray-600">#{index + 1}</span>
              {customer.avatar ? (
                <img
                  src={customer.avatar}
                  alt={customer.fullName}
                  className="w-12 h-12 rounded-xl object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold">
                  {customer.fullName.charAt(0)}
                </div>
              )}
              <div className="flex-1 overflow-y-auto">
                <p className="text-white font-semibold">{customer.fullName}</p>
                <p className="text-gray-400 text-sm">{customer.email}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-bold">
                {Number(customer.totalSpent).toLocaleString('ru-RU')} KGS
              </p>
              <p className="text-gray-400 text-sm">{customer.orders} заказов</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Inventory Report Component
function InventoryReport({ data }: { data: InventoryData }) {
  const totalValue = data.inventory.reduce((sum, item) => sum + item.totalValue, 0);

  return (
    <div className="space-y-6">
      <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
        <h3 className="text-xl font-bold text-white mb-2">Общая стоимость товаров</h3>
        <p className="text-3xl font-bold text-white">
          {totalValue.toLocaleString('ru-RU')} KGS
        </p>
      </div>

      <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
        <h3 className="text-xl font-bold text-white mb-4">Остатки по филиалам</h3>
        <div className="space-y-4">
          {data.inventory.map((item) => (
            <div
              key={`${item.branchId}-${item.productId}`}
              className="flex gap-4 p-4 bg-[#1e2533] rounded-xl"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.productName}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-[#2a3347] rounded-lg flex items-center justify-center">
                  <Package size={24} className="text-gray-600" />
                </div>
              )}
              <div className="flex-1 overflow-y-auto">
                <p className="text-white font-semibold">{item.productName}</p>
                <p className="text-gray-400 text-sm">
                  {item.branchName} • {item.city}
                </p>
                <p className="text-gray-400 text-sm">SKU: {item.sku}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">
                  {item.quantity} шт.
                </p>
                <p className="text-gray-400 text-sm">
                  {Number(item.price).toLocaleString('ru-RU')} KGS/шт
                </p>
                <p className="text-violet-400 text-sm font-semibold">
                  {item.totalValue.toLocaleString('ru-RU')} KGS
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
