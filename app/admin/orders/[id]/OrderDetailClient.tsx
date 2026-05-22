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
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Phone,
  Mail,
  MapPinIcon,
  Image as ImageIcon,
} from 'lucide-react';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface OrderDetailClientProps {
  user: User;
  orderId: string;
}

interface Order {
  id: string;
  orderNumber: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    avatar: string | null;
  };
  branch: {
    id: string;
    name: string;
    code: string;
    city: string;
    district: string;
    address: string;
    phone: string;
  };
  total: number;
  orderStatus: string;
  paymentStatus: string;
  comment: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    total: number;
    product: {
      id: string;
      sku: string;
      price: number;
      translations: Array<{
        name: string;
        description: string | null;
      }>;
      images: Array<{
        imageUrl: string;
      }>;
    };
  }>;
  payments: Array<{
    id: string;
    provider: string;
    transactionId: string;
    amount: number;
    currency: string;
    status: string;
    paidAt: string;
  }>;
}

export default function OrderDetailClient({ user, orderId }: OrderDetailClientProps) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      } else {
        router.push('/admin/orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      router.push('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrder({ ...order, orderStatus: data.order.orderStatus });
      }
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setUpdating(false);
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
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'completed':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
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
        return <Clock size={20} />;
      case 'completed':
        return <CheckCircle size={20} />;
      case 'cancelled':
        return <XCircle size={20} />;
      default:
        return <Clock size={20} />;
    }
  };

  const menuItems = [
    { title: 'Панель управления', icon: LayoutDashboard, active: false, href: '/admin/dashboard' },
    { title: 'Пользователи', icon: Users, active: false, href: '/admin/users' },
    { title: 'Категории', icon: FolderTree, active: false, href: '/admin/categories' },
    { title: 'Товары', icon: Package, active: false, href: '/admin/products' },
    { title: 'Баннеры', icon: ImageIcon, active: false, href: '/admin/banners' },
    { title: 'Заказы', icon: ShoppingCart, active: true, href: '/admin/orders' },
    { title: 'Филиалы', icon: MapPin, active: false, href: '/admin/branches' },
    { title: 'Менеджеры', icon: Users, active: false, href: '/admin/managers' },
    { title: 'Отчеты', icon: FileText, active: false, href: '/admin/reports' },
    { title: 'Настройки', icon: Settings, active: false, href: '/admin/settings' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#151b26] flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

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
          } flex-shrink-0 bg-[#151b26] border-r border-gray-800/50 transition-all duration-300`}
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
            {/* Back Button */}
            <button
              onClick={() => router.push('/admin/orders')}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Назад к заказам</span>
            </button>

            {/* Order Header */}
            <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Заказ {order.orderNumber}
                  </h2>
                  <p className="text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-semibold ${getStatusColor(
                    order.orderStatus
                  )}`}
                >
                  {getStatusIcon(order.orderStatus)}
                  {getStatusText(order.orderStatus)}
                </div>
              </div>

              {/* Status Actions */}
              {order.orderStatus !== 'cancelled' && (
                <div className="flex gap-3">
                  {order.orderStatus === 'paid' && (
                    <>
                      <button
                        onClick={() => updateOrderStatus('completed')}
                        disabled={updating}
                        className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl font-medium text-sm transition-all disabled:opacity-50"
                      >
                        {updating ? 'Обновление...' : 'Завершить заказ'}
                      </button>
                      <button
                        onClick={() => updateOrderStatus('cancelled')}
                        disabled={updating}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium text-sm transition-all disabled:opacity-50"
                      >
                        {updating ? 'Обновление...' : 'Отменить заказ'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Items */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
                  <h3 className="text-xl font-bold text-white mb-4">Товары в заказе</h3>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 p-4 bg-[#1e2533] rounded-xl"
                      >
                        {item.product.images[0] ? (
                          <img
                            src={item.product.images[0].imageUrl}
                            alt={item.product.translations[0]?.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-[#2a3347] rounded-lg flex items-center justify-center">
                            <Package size={32} className="text-gray-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="text-white font-semibold mb-1">
                            {item.product.translations[0]?.name || 'Без названия'}
                          </h4>
                          <p className="text-gray-400 text-sm mb-2">
                            SKU: {item.product.sku}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">
                              {item.quantity} × {Number(item.product.price).toLocaleString('ru-RU')} KGS
                            </span>
                            <span className="text-white font-semibold">
                              {Number(item.total).toLocaleString('ru-RU')} KGS
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-800/50">
                    <div className="flex items-center justify-between text-xl font-bold">
                      <span className="text-gray-400">Итого:</span>
                      <span className="text-white">
                        {Number(order.total).toLocaleString('ru-RU')} KGS
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comment */}
                {order.comment && (
                  <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
                    <h3 className="text-xl font-bold text-white mb-4">Комментарий</h3>
                    <p className="text-gray-400">{order.comment}</p>
                  </div>
                )}
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
                  <h3 className="text-xl font-bold text-white mb-4">Клиент</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      {order.user.avatar ? (
                        <img
                          src={order.user.avatar}
                          alt={order.user.fullName}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold">
                          {order.user.fullName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-white font-semibold">{order.user.fullName}</p>
                        <p className="text-gray-400 text-sm">ID: {order.user.id.slice(0, 8)}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-400">
                        <Mail size={18} />
                        <span className="text-sm">{order.user.email}</span>
                      </div>
                      {order.user.phone && (
                        <div className="flex items-center gap-3 text-gray-400">
                          <Phone size={18} />
                          <span className="text-sm">{order.user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Branch Info */}
                <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
                  <h3 className="text-xl font-bold text-white mb-4">Филиал</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-white font-semibold">{order.branch.name}</p>
                      <p className="text-gray-400 text-sm">Код: {order.branch.code}</p>
                    </div>

                    <div className="flex items-start gap-3 text-gray-400">
                      <MapPinIcon size={18} className="flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p>{order.branch.city}, {order.branch.district}</p>
                        <p>{order.branch.address}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-400">
                      <Phone size={18} />
                      <span className="text-sm">{order.branch.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                {order.payments.length > 0 && (
                  <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
                    <h3 className="text-xl font-bold text-white mb-4">Платеж</h3>
                    {order.payments.map((payment) => (
                      <div key={payment.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Провайдер:</span>
                          <span className="text-white font-semibold">{payment.provider}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Транзакция:</span>
                          <span className="text-white font-mono text-sm">
                            {payment.transactionId}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Сумма:</span>
                          <span className="text-white font-semibold">
                            {Number(payment.amount).toLocaleString('ru-RU')} {payment.currency}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Дата оплаты:</span>
                          <span className="text-white text-sm">
                            {new Date(payment.paidAt).toLocaleDateString('ru-RU', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
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
