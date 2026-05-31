'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Package,
  User,
  MapPin,
  CreditCard,
  ArrowLeft,
  Mail,
  Phone,
} from 'lucide-react';
import BranchSelect from '@/app/components/BranchSelect';
import UserHeader from '@/app/components/UserHeader';
import UserSidebar from '@/app/components/UserSidebar';
import { useTranslation } from '@/app/i18n/client';
import { useChat } from '@/app/(user)/ChatContext';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
}

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    sku: string;
    brand?: string;
    price: number;
    translations: Array<{
      locale: string;
      name: string;
    }>;
    images: Array<{
      imageUrl: string;
    }>;
  };
}

interface Branch {
  id: string;
  code: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  workDays: string[];
  openTime: string;
  closeTime: string;
}

export default function CheckoutClient({ user }: { user: User }) {
  const router = useRouter();
  const { t } = useTranslation('user');
  const { setSidebarCollapsed: syncSidebarToContext } = useChat();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => { syncSidebarToContext(sidebarCollapsed); }, [sidebarCollapsed, syncSidebarToContext]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cartRes, branchesRes] = await Promise.all([
        fetch('/api/user/cart'),
        fetch('/api/user/branches'),
      ]);

      if (cartRes.ok) {
        const cartData = await cartRes.json();
        setCartItems(cartData.cartItems);
        
        // Если корзина пуста, перенаправляем обратно
        if (cartData.cartItems.length === 0) {
          router.push('/cart');
          return;
        }
      }

      if (branchesRes.ok) {
        const branchesData = await branchesRes.json();
        console.log('Branches data:', branchesData);
        console.log('Branches count:', branchesData.branches?.length);
        setBranches(branchesData.branches || []);
      } else {
        console.error('Failed to fetch branches:', branchesRes.status);
        const errorData = await branchesRes.json();
        console.error('Error details:', errorData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (item: CartItem) => {
    const translation = item.product.translations.find((t) => t.locale === 'ru');
    return translation?.name || 'Без названия';
  };

  const getProductImage = (item: CartItem) => {
    return item.product.images[0]?.imageUrl || '/placeholder.png';
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );
  };

  const handleSubmit = async () => {
    if (!selectedBranch) {
      alert('Пожалуйста, выберите филиал для самовывоза');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/user/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: selectedBranch,
          comment: comment.trim() || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Перенаправляем на страницу оплаты
        router.push(`/payment/${data.order.id}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка при создании заказа');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Ошибка при создании заказа');
    } finally {
      setSubmitting(false);
    }
  };

  // Удалили menuItems в пользу UserSidebar

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader
        user={user}
        cartCount={cartItems.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex pt-[57px] pb-16 lg:pb-0">
        <UserSidebar
          active="cart"
          collapsed={sidebarCollapsed}
          onCollapseChange={setSidebarCollapsed}
          cartCount={cartItems.length}
        />

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Title */}
            <div className="mb-6 sm:mb-8">
              <button
                onClick={() => router.push('/cart')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 sm:mb-4 transition-colors"
              >
                <ArrowLeft size={18} />
                <span className="text-sm font-medium">Назад в корзину</span>
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                <CreditCard className="w-7 h-7 sm:w-8 sm:h-8 text-violet-600" />
                Оформление заказа
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                Выберите филиал для самовывоза и подтвердите заказ
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Форма оформления */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {/* Информация о покупателе */}
                <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600" />
                    Информация о покупателе
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <User size={18} className="text-gray-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600">Имя</p>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">{user.fullName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Mail size={18} className="text-gray-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600">Email</p>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">{user.email}</p>
                      </div>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <Phone size={18} className="text-gray-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600">Телефон</p>
                          <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">{user.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Выбор филиала */}
                <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 flex-wrap">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600" />
                    Выберите филиал для самовывоза
                    {branches.length > 0 && (
                      <span className="text-xs sm:text-sm font-normal text-gray-600">
                        ({branches.length} доступно)
                      </span>
                    )}
                  </h2>
                  {branches.length === 0 ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800">
                      <p className="font-semibold">Филиалы не найдены</p>
                      <p className="text-sm mt-1">
                        В данный момент нет доступных филиалов для самовывоза.
                      </p>
                    </div>
                  ) : (
                    <BranchSelect
                      branches={branches}
                      value={selectedBranch}
                      onChange={setSelectedBranch}
                    />
                  )}
                </div>

                {/* Комментарий к заказу */}
                <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                    Комментарий к заказу (необязательно)
                  </h2>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Укажите дополнительные пожелания или информацию..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-gray-900 placeholder-gray-400 resize-none text-sm"
                  />
                </div>
              </div>

              {/* Итоговая информация */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:sticky lg:top-24">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                    Ваш заказ
                  </h2>

                  {/* Список товаров */}
                  <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={getProductImage(item)}
                            alt={getProductName(item)}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">
                            {getProductName(item)}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-600">
                              {item.quantity} шт
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              {(Number(item.product.price) * item.quantity).toLocaleString('ru-RU')} сом
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Итого */}
                  <div className="space-y-3 mb-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Товары ({cartItems.length}):</span>
                      <span className="font-semibold">
                        {calculateTotal().toLocaleString('ru-RU')} сом
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Доставка:</span>
                      <span className="font-semibold text-green-600">
                        Бесплатно
                      </span>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">
                          Итого:
                        </span>
                        <span className="text-2xl font-bold text-violet-600">
                          {calculateTotal().toLocaleString('ru-RU')} сом
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Кнопка оформления */}
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedBranch || submitting}
                    className="w-full py-4 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Оформление...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={20} />
                        <span>Перейти к оплате</span>
                      </>
                    )}
                  </button>

                  {/* Информация */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Package size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-900">
                        <p className="font-semibold mb-1">Самовывоз</p>
                        <p className="text-blue-700">
                          Заказ будет готов к выдаче в течение 1-2 часов после оплаты
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
