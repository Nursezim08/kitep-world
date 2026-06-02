'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  ChevronRight,
  ChevronLeft,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
} from 'lucide-react';
import UserHeader from '@/app/components/UserHeader';
import UserSidebar from '@/app/components/UserSidebar';
import QRCodeDisplay from '@/app/components/QRCodeDisplay';
import { useTranslation } from '@/app/i18n/client';
import { useChat } from '@/app/(user)/ChatContext';
import { useBlockScroll } from '@/app/hooks/useBlockScroll';

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
  const { setSidebarCollapsed: syncSidebarToContext } = useChat();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => { syncSidebarToContext(sidebarCollapsed); }, [sidebarCollapsed, syncSidebarToContext]);
  const [cartCount, setCartCount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Блокируем скролл страницы пока открыта модалка
  useBlockScroll(!!selectedOrder);

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
    // Убираем нецифровые символы и берём последние 5 цифр
    const digits = orderNumber.replace(/\D/g, '');
    return digits.slice(-5);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto no-scrollbar">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto no-scrollbar mt-[80px] sm:mt-[96px] mb-4">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-gray-900 truncate">Заказ #{selectedOrder.orderNumber}</h3>
                <p className="text-[11px] text-gray-500">
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
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-2"
              >
                <ChevronLeft size={18} />
              </button>
            </div>

            <div className="p-4">
              {/* Способы подтверждения: QR + код */}
              <div className="mb-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-4 border border-violet-200">
                <p className="text-xs font-semibold text-gray-700 mb-3 text-center">
                  Покажите QR-код или назовите код менеджеру
                </p>

                <div className="flex flex-col items-center justify-center gap-3">
                  {/* QR-код */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="bg-white p-2.5 rounded-xl shadow-sm border border-violet-100">
                      <QRCodeDisplay
                        value={`ORDER:${selectedOrder.id}`}
                        size={140}
                      />
                    </div>
                    <p className="text-[10px] text-gray-500">QR-код</p>
                  </div>

                  {/* Разделитель */}
                  <div className="flex items-center gap-2 text-gray-400 w-full">
                    <div className="flex-1 h-px bg-violet-200" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">или</span>
                    <div className="flex-1 h-px bg-violet-200" />
                  </div>

                  {/* Код */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="bg-white px-4 py-2.5 rounded-xl shadow-sm border border-violet-100 min-w-[160px]">
                      <p className="text-[10px] font-semibold text-gray-500 text-center mb-1 uppercase tracking-wider">
                        Код заказа
                      </p>
                      <p className="text-2xl font-bold text-violet-600 text-center tracking-widest">
                        {getOrderCode(selectedOrder.orderNumber)}
                      </p>
                    </div>
                    <p className="text-[10px] text-gray-500">Цифровой код</p>
                  </div>
                </div>

                <p className="text-[10px] text-gray-600 mt-3 text-center">
                  Менеджер отсканирует QR или введёт код для подтверждения выдачи
                </p>
              </div>

              {/* Статус */}
              <div className="mb-4">
                <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Статус</h4>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusIcon(selectedOrder.status)}
                  <span className="font-semibold text-xs">
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>
              </div>

              {/* Филиал */}
              <div className="mb-4">
                <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Филиал</h4>
                <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{selectedOrder.branch.name}</p>
                    <p className="text-[11px] text-gray-600">{selectedOrder.branch.city}</p>
                  </div>
                </div>
              </div>

              {/* Товары */}
              <div className="mb-4">
                <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Товары</h4>
                <div className="space-y-2">
                  {selectedOrder.orderItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2.5 bg-gray-50 rounded-xl p-2.5">
                      {item.product.images[0] && (
                        <img
                          src={item.product.images[0].imageUrl}
                          alt={getProductName(selectedOrder, index)}
                          className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 line-clamp-2">
                          {getProductName(selectedOrder, index)}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {item.quantity} × {item.price.toLocaleString('ru-RU')} с
                        </p>
                      </div>
                      <p className="text-xs font-bold text-gray-900 whitespace-nowrap">
                        {(item.quantity * item.price).toLocaleString('ru-RU')} с
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Итого */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">Итого:</span>
                  <span className="text-lg font-bold text-gray-900">
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

      <div className="flex pt-[57px] pb-16 lg:pb-0">
        <UserSidebar
          active="orders"
          collapsed={sidebarCollapsed}
          onCollapseChange={setSidebarCollapsed}
          cartCount={cartCount}
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1 sm:mb-2">
                {t('orders.title')}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
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
                    className="bg-white rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all border border-gray-200 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4 flex-wrap">
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 truncate">
                          Заказ #{order.orderNumber}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="font-semibold text-xs sm:text-sm">
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{order.branch.name}, {order.branch.city}</span>
                    </div>

                    <div className="border-t border-gray-200 pt-3 sm:pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm text-gray-600">
                            {order.orderItems.length} {order.orderItems.length === 1 ? 'товар' : 'товара'}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Итого:</p>
                          <p className="text-lg sm:text-2xl font-bold text-gray-900">
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
