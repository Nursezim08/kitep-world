'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BranchSelect from '@/app/components/BranchSelect';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Package,
  CreditCard,
  Home,
  Grid,
  MessageCircle,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  AlertTriangle,
  X,
} from 'lucide-react';
import UserHeader from '@/app/components/UserHeader';
import { useTranslation } from '@/app/i18n/client';
import { useChat } from '@/app/(user)/ChatContext';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
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
      description?: string;
    }>;
    images: Array<{
      imageUrl: string;
    }>;
    category: {
      translations: Array<{
        locale: string;
        name: string;
      }>;
    };
  };
}

export default function CartClient({ user }: { user: User }) {
  const router = useRouter();
  const { t } = useTranslation('user');
  const { openChat, setSidebarCollapsed: syncSidebarToContext } = useChat();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => { syncSidebarToContext(sidebarCollapsed); }, [sidebarCollapsed, syncSidebarToContext]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCheckout, setIsCheckout] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/user/cart');
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.cartItems);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    setLoadingBranches(true);
    try {
      const response = await fetch('/api/user/branches');
      if (response.ok) {
        const data = await response.json();
        setBranches(data.branches);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoadingBranches(false);
    }
  };

  const handleCheckout = () => {
    setIsCheckout(true);
    fetchBranches();
  };

  const handleBackToCart = () => {
    setIsCheckout(false);
    setSelectedBranchId('');
  };

  const handlePlaceOrder = async () => {
    if (!selectedBranchId) {
      alert('Пожалуйста, выберите филиал для самовывоза');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/user/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchId: selectedBranchId }),
      });

      if (response.ok) {
        const data = await response.json();
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

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingItems((prev) => new Set(prev).add(itemId));

    try {
      const response = await fetch(`/api/user/cart/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (response.ok) {
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const removeItem = async (itemId: string) => {
    setItemToDelete(itemId);
    setShowDeleteModal(true);
  };

  const confirmRemoveItem = async () => {
    if (!itemToDelete) return;

    setUpdatingItems((prev) => new Set(prev).add(itemToDelete));
    setShowDeleteModal(false);

    try {
      const response = await fetch(`/api/user/cart/${itemToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCartItems((prev) => prev.filter((item) => item.id !== itemToDelete));
      }
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemToDelete);
        return newSet;
      });
      setItemToDelete(null);
    }
  };

  const clearCart = async () => {
    setShowClearModal(true);
  };

  const confirmClearCart = async () => {
    setShowClearModal(false);
    setLoading(true);

    try {
      const response = await fetch('/api/user/cart', {
        method: 'DELETE',
      });

      if (response.ok) {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (item: CartItem) => {
    const translation = item.product.translations.find((t) => t.locale === 'ru');
    return translation?.name || 'Без названия';
  };

  const getCategoryName = (item: CartItem) => {
    const translation = item.product.category.translations.find(
      (t) => t.locale === 'ru'
    );
    return translation?.name || '';
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

  const menuItems = [
    { title: t('nav.home'), icon: Home, href: '/home', active: false },
    { title: t('nav.catalog'), icon: Grid, href: '/catalog', active: false },
    { title: t('nav.orders'), icon: Package, href: '/orders', active: false },
    { title: t('nav.cart'), icon: ShoppingCart, href: '/cart', active: true },
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

      <div className="flex pt-[57px]">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} px-4 pt-4 flex flex-col transition-all duration-300 sticky top-[57px] self-start`}>
          {/* Main Navigation Card */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              {!sidebarCollapsed && (
                <h3 className="text-sm font-bold text-gray-900">{t('sidebar.navigation')}</h3>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
              >
                {sidebarCollapsed ? (
                  <ChevronRight size={18} className="text-gray-600" />
                ) : (
                  <ChevronLeft size={18} className="text-gray-600" />
                )}
              </button>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.title}
                  onClick={() => item.onClick ? item.onClick() : router.push(item.href)}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl transition-all ${
                    item.active
                      ? 'bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-500/30'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={20} />
                  {!sidebarCollapsed && (
                    <span className="text-sm font-medium">{item.title}</span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Logout Button */}
          <div className="mt-4">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all`}
            >
              <LogOut size={20} />
              {!sidebarCollapsed && (
                <span className="text-sm font-medium">{t('sidebar.logout')}</span>
              )}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
        {cartItems.length === 0 ? (
          <>
            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ShoppingCart size={32} className="text-violet-600" />
                Корзина
              </h1>
            </div>
          </>
        ) : null}

        {cartItems.length === 0 ? (
          // Пустая корзина
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingCart size={48} className="text-gray-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Корзина пуста
            </h2>
            <p className="text-gray-600 mb-6">
              Добавьте товары из каталога, чтобы оформить заказ
            </p>
            <button
              onClick={() => router.push('/catalog')}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Перейти в каталог
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Левая колонка: Заголовок + Список товаров */}
            <div className="lg:col-span-2 space-y-6">
              {/* Page Title */}
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <ShoppingCart size={32} className="text-violet-600" />
                  Корзина
                </h1>
                
                <button
                  onClick={clearCart}
                  className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1.5 px-4 py-2 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={16} />
                  Очистить корзину
                </button>
              </div>

              {/* Список товаров */}
              <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Изображение */}
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <Image
                        src={getProductImage(item)}
                        alt={getProductName(item)}
                        fill
                        className="object-contain rounded-2xl"
                      />
                    </div>

                    {/* Информация */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                            {getProductName(item)}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            {item.product.brand && (
                              <span>{item.product.brand}</span>
                            )}
                            {item.product.brand && getCategoryName(item) && (
                              <span>•</span>
                            )}
                            {getCategoryName(item) && (
                              <span>{getCategoryName(item)}</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Артикул: {item.product.sku}
                          </p>
                        </div>

                        {/* Цена */}
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {Number(item.product.price).toLocaleString('ru-RU')}{' '}
                            сом
                          </p>
                        </div>
                      </div>

                      {/* Управление количеством */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={
                              item.quantity <= 1 || updatingItems.has(item.id)
                            }
                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center font-semibold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={updatingItems.has(item.id)}
                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={updatingItems.has(item.id)}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      {/* Итого за товар */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Итого:</span>
                          <span className="font-bold text-gray-900">
                            {(
                              Number(item.product.price) * item.quantity
                            ).toLocaleString('ru-RU')}{' '}
                            сом
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>

            {/* Правая колонка: Итоговая информация / Оформление заказа */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                {!isCheckout ? (
                  <>
                    {/* Блок "Итого" */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Итого</h2>
                        <span className="text-2xl font-bold text-violet-600">
                          {calculateTotal().toLocaleString('ru-RU')} сом
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleCheckout}
                      className="w-full py-3 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <CreditCard size={18} />
                      Оформить заказ
                    </button>

                    <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Package size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900">
                          <p className="font-semibold mb-1">Самовывоз из филиала</p>
                          <p className="text-blue-700">
                            Выберите удобный филиал при оформлении заказа
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Блок "Оформление заказа" */}
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Оформление заказа
                    </h2>

                    {/* Информация о покупателе */}
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Информация о покупателе
                      </h3>
                      <div className="p-3 bg-gray-50 rounded-lg space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Имя:</span>
                          <span className="text-sm font-medium text-gray-900">{user.fullName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Почта:</span>
                          <span className="text-sm font-medium text-gray-900">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Телефон:</span>
                            <span className="text-sm font-medium text-gray-900">{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Выбор филиала */}
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Филиал для самовывоза *
                      </h3>
                      {loadingBranches ? (
                        <div className="flex items-center justify-center py-6">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                        </div>
                      ) : (
                        <BranchSelect
                          branches={branches}
                          value={selectedBranchId}
                          onChange={setSelectedBranchId}
                        />
                      )}
                    </div>

                    {/* Итоговая сумма */}
                    <div className="mb-4 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">
                          К оплате:
                        </span>
                        <span className="text-2xl font-bold text-violet-600">
                          {calculateTotal().toLocaleString('ru-RU')} сом
                        </span>
                      </div>
                    </div>

                    {/* Кнопки */}
                    <div className="space-y-2">
                      <button
                        onClick={handlePlaceOrder}
                        disabled={!selectedBranchId || submitting}
                        className="w-full py-3 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {submitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Создание заказа...
                          </>
                        ) : (
                          <>
                            <CreditCard size={18} />
                            Перейти к оплате
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleBackToCart}
                        className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        <ArrowLeft size={18} />
                        Назад
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
          </div>
        </main>
      </div>

      {/* Delete Item Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowDeleteModal(false);
              setItemToDelete(null);
            }}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Удалить товар?
                  </h3>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Это действие нельзя отменить
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setItemToDelete(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <p className="text-gray-700 mb-6">
              Вы уверены, что хотите удалить этот товар из корзины?
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setItemToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
              >
                Отмена
              </button>
              <button
                onClick={confirmRemoveItem}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Cart Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowClearModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Очистить корзину?
                  </h3>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Все товары будут удалены
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowClearModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <p className="text-gray-700 mb-6">
              Вы уверены, что хотите удалить все товары из корзины? Это действие нельзя отменить.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
              >
                Отмена
              </button>
              <button
                onClick={confirmClearCart}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all"
              >
                Очистить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
