'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home,
  Grid,
  ShoppingCart,
  Package,
  MessageCircle,
  User,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
} from 'lucide-react';
import UserHeader from '@/app/components/UserHeader';
import { useTranslation } from '@/app/i18n/client';
import { useChat } from '@/app/(user)/ChatContext';

interface User {
  id: string;
  fullName: string;
  email: string;
  avatar: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: 'paid' | 'completed' | 'cancelled';
  createdAt: string;
  branch: {
    name: string;
    city: string;
  };
  orderItems: {
    quantity: number;
    price: number;
    product: {
      translations: {
        locale: string;
        name: string;
      }[];
      images: {
        imageUrl: string;
      }[];
    };
  }[];
}

interface OrdersClientProps {
  user: User;
}

export default function OrdersClient({ user }: OrdersClientProps) {
  const router = useRouter();
  const { t } = useTranslation('user');
  const { openChat, setSidebarCollapsed: syncSidebarToContext } = useChat();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => { syncSidebarToContext(sidebarCollapsed); }, [sidebarCollapsed, syncSidebarToContext]);
  const [cartCount, setCartCount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
    fetchCartCount();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
    try {
      const response = await fetch('/api/user/cart');
      if (response.ok) {
        const data = await response.json();
        setCartCount(data.cartItems.length);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <Clock className="w-5 h-5" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-blue-500/10 text-blue-600';
      case 'completed':
        return 'bg-green-500/10 text-green-600';
      case 'cancelled':
        return 'bg-red-500/10 text-red-600';
      default:
        return 'bg-gray-500/10 text-gray-600';
    }
  };

  const getProductName = (order: Order, itemIndex: number) => {
    const item = order.orderItems[itemIndex];
    return item.product.translations.find((t) => t.locale === 'ru')?.name || 'Без названия';
  };

  const getOrderCode = (orderNumber: string) => {
    // Убираем дефисы и извлекаем последние 5 цифр
    const digits = orderNumber.replace(/-/g, '').replace(/\D/g, '');
    return digits.slice(-5);
  };

  const menuItems = [
    { title: t('nav.home'), icon: Home, href: '/home', active: false },
    { title: t('nav.catalog'), icon: Grid, href: '/catalog', active: false },
    { title: t('nav.orders'), icon: Package, href: '/orders', active: true },
    { title: t('nav.cart'), icon: ShoppingCart, href: '/cart', active: false },
    { title: t('nav.aiChat'), icon: MessageCircle, href: '/ai-chat', active: false, onClick: openChat },
    { title: t('nav.profile'), icon: User, href: '/profile', active: false },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Заказ #{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-gray-500">
                  {new Date(selectedOrder.createdAt).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
            </div>

            <div className="p-6">
              {/* Код заказа */}
              <div className="mb-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6 border border-violet-200">
                <p className="text-sm font-semibold text-gray-700 mb-2 text-center">Код для получения заказа</p>
                <p className="text-4xl font-bold text-violet-600 text-center tracking-widest">
                  {getOrderCode(selectedOrder.orderNumber)}
                </p>
                <p className="text-xs text-gray-600 mt-3 text-center">
                  Назовите этот код менеджеру при получении заказа
                </p>
              </div>

              {/* Статус */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Статус</h4>
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusIcon(selectedOrder.status)}
                  <span className="font-semibold text-sm">
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>
              </div>

              {/* Филиал */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Филиал</h4>
                <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{selectedOrder.branch.name}</p>
                    <p className="text-xs text-gray-600">{selectedOrder.branch.city}</p>
                  </div>
                </div>
              </div>

              {/* Товары */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Товары</h4>
                <div className="space-y-3">
                  {selectedOrder.orderItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                      {item.product.images[0] && (
                        <img
                          src={item.product.images[0].imageUrl}
                          alt={getProductName(selectedOrder, index)}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {getProductName(selectedOrder, index)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} × {item.price.toLocaleString('ru-RU')} с
                        </p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {(item.quantity * item.price).toLocaleString('ru-RU')} с
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Итого */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Итого:</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {selectedOrder.totalAmount.toLocaleString('ru-RU')} с
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <UserHeader
        user={user}
        cartCount={cartCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearch}
      />

      <div className="flex pt-[57px]">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} px-4 pt-4 flex flex-col transition-all duration-300 sticky top-[57px] self-start`}>
          {/* Main Navigation Card */}
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-200">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} mb-4 px-2`}>
              {!sidebarCollapsed && <span className="text-sm font-semibold text-gray-500">{t('sidebar.navigation')}</span>}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-gray-50 rounded-lg transition-all text-gray-500 hover:text-gray-900"
                title={sidebarCollapsed ? 'Развернуть' : 'Свернуть'}
              >
                {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
            </div>
            
            <nav className="space-y-1">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => item.onClick ? item.onClick() : router.push(item.href)}
                  className={`w-full flex items-center justify-center ${sidebarCollapsed ? '' : 'justify-start gap-3 px-3'} py-2.5 rounded-xl transition-all ${
                    item.active 
                      ? 'bg-violet-500/15 text-violet-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
          <div className="mt-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <button
                onClick={handleLogout}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-center gap-2'} px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-xl font-medium text-sm transition-all`}
                title={sidebarCollapsed ? t('sidebar.logout') : ''}
              >
                <LogOut size={16} />
                {!sidebarCollapsed && <span>{t('sidebar.logout')}</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <main className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                {t('orders.title')}
              </h1>
              <p className="text-gray-600">
                История ваших заказов и их статусы
              </p>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  У вас пока нет заказов
                </h3>
                <p className="text-gray-600 mb-6">
                  Начните покупки в нашем каталоге
                </p>
                <button
                  onClick={() => router.push('/catalog')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors"
                >
                  Перейти в каталог
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all border border-gray-200 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          Заказ #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="font-semibold text-sm">
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span>{order.branch.name}, {order.branch.city}</span>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {order.orderItems.length} {order.orderItems.length === 1 ? 'товар' : 'товара'}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">Итого:</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {order.totalAmount.toLocaleString('ru-RU')} с
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
