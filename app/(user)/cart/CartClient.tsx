'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Package,
  CreditCard,
} from 'lucide-react';

interface User {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

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
    if (!confirm('Удалить товар из корзины?')) return;

    setUpdatingItems((prev) => new Set(prev).add(itemId));

    try {
      const response = await fetch(`/api/user/cart/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      }
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const clearCart = async () => {
    if (!confirm('Очистить всю корзину?')) return;

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/home')}
              className="flex items-center gap-2 text-gray-600 hover:text-violet-600 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Назад к покупкам</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart size={28} className="text-violet-600" />
              Корзина
            </h1>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            {/* Список товаров */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Товары ({cartItems.length})
                </h2>
                <button
                  onClick={clearCart}
                  className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                >
                  <Trash2 size={16} />
                  Очистить корзину
                </button>
              </div>

              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Изображение */}
                    <div className="relative w-24 h-24 bg-white rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={getProductImage(item)}
                        alt={getProductName(item)}
                        fill
                        className="object-contain p-2"
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
                            ₸
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
                            ₸
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Итоговая информация */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Итого
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Товары ({cartItems.length}):</span>
                    <span className="font-semibold">
                      {calculateTotal().toLocaleString('ru-RU')} ₸
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
                        {calculateTotal().toLocaleString('ru-RU')} ₸
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full py-4 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard size={20} />
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
