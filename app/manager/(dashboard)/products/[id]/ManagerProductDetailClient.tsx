'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, Image as ImageIcon, Minus, Plus, Save, X } from 'lucide-react';

interface ProductTranslation {
  id: string;
  locale: 'ru' | 'kg';
  name: string;
  description: string | null;
}

interface ProductImage {
  id: string;
  imageUrl: string;
  status: string;
}

interface Category {
  id: string;
  translations: {
    locale: string;
    name: string;
  }[];
}

interface Inventory {
  quantity: number;
}

interface Product {
  id: string;
  sku: string;
  categoryId: string;
  brand: string | null;
  price: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  translations: ProductTranslation[];
  images: ProductImage[];
  category: Category;
  inventory: Inventory;
  _count: {
    reviews: number;
  };
}

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface ManagerProductDetailClientProps {
  user: User;
  productId: string;
}

export default function ManagerProductDetailClient({ user, productId }: ManagerProductDetailClientProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [editedQuantity, setEditedQuantity] = useState(0);
  const [savingQuantity, setSavingQuantity] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      console.log('Fetching product:', productId);
      
      const response = await fetch(`/api/manager/products/${productId}`);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Product data:', data);
        setProduct(data);
        setEditedQuantity(data.inventory.quantity);
      } else if (response.status === 401) {
        console.error('Unauthorized - redirecting to login');
        router.push('/manager/login');
      } else if (response.status === 404) {
        console.error('Product not found (404)');
        try {
          const errorData = await response.json();
          console.error('Error details:', errorData);
        } catch (e) {
          console.error('Could not parse error response');
        }
      } else {
        console.error('Unexpected status:', response.status);
        try {
          const errorData = await response.json();
          console.error('Error fetching product:', errorData);
          console.error('Error details:', errorData.details);
        } catch (e) {
          console.error('Could not parse error response');
          const text = await response.text();
          console.error('Response text:', text);
        }
      }
    } catch (error) {
      console.error('Exception while fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (locale: 'ru' | 'kg' = 'ru') => {
    if (!product) return '';
    return product.translations.find((t) => t.locale === locale)?.name || 'Без названия';
  };

  const getProductDescription = (locale: 'ru' | 'kg' = 'ru') => {
    if (!product) return '';
    return product.translations.find((t) => t.locale === locale)?.description || '';
  };

  const getCategoryName = (locale: 'ru' | 'kg' = 'ru') => {
    if (!product?.category) return 'Без категории';
    return product.category.translations.find((t) => t.locale === locale)?.name || 'Без категории';
  };

  const nextImage = () => {
    if (!product) return;
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    if (!product) return;
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const startEditingQuantity = () => {
    if (product) {
      setEditedQuantity(product.inventory.quantity);
      setIsEditingQuantity(true);
    }
  };

  const cancelEditingQuantity = () => {
    if (product) {
      setEditedQuantity(product.inventory.quantity);
    }
    setIsEditingQuantity(false);
  };

  const incrementQuantity = () => {
    setEditedQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setEditedQuantity(prev => Math.max(0, prev - 1));
  };

  const saveQuantity = async () => {
    if (!product) return;

    setSavingQuantity(true);

    try {
      const response = await fetch(`/api/manager/products/${product.id}/inventory`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: editedQuantity }),
      });

      if (response.ok) {
        setProduct({
          ...product,
          inventory: { quantity: editedQuantity }
        });
        setIsEditingQuantity(false);
      } else {
        const data = await response.json();
        alert(data.error || 'Не удалось обновить количество');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Произошла ошибка при обновлении количества');
    } finally {
      setSavingQuantity(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Загрузка товара...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Товар не найден</p>
          <button
            onClick={() => router.push('/manager/products')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            Вернуться к товарам
          </button>
        </div>
      </div>
    );
  }

  const currentImage = product.images[currentImageIndex];

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => router.push('/manager/products')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft size={18} />
        <span className="font-medium text-sm">Назад к товарам</span>
      </button>

      {/* Product Detail */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Left: Images */}
          <div>
            {/* Main Image */}
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative mb-3">
              {currentImage ? (
                <>
                  <img
                    src={currentImage.imageUrl}
                    alt={getProductName('ru')}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Navigation Arrows */}
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
                      >
                        <ChevronLeft size={20} className="text-gray-800" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
                      >
                        <ChevronRight size={20} className="text-gray-800" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-20 h-20 text-gray-400" />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? 'border-blue-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image.imageUrl}
                      alt={`${getProductName('ru')} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="flex flex-col">
            {/* Category & Status */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                {getCategoryName('ru')}
              </span>
              <div className={`inline-flex px-2 py-1 rounded-lg text-xs font-semibold ${
                product.status === 'active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {product.status === 'active' ? 'Активен' : 'Неактивен'}
              </div>
            </div>

            {/* Name */}
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {getProductName('ru')}
            </h1>
            <h2 className="text-lg text-gray-600 mb-3">
              {getProductName('kg')}
            </h2>

            {/* SKU & Price */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-500">
                <span className="font-medium">SKU:</span> {product.sku}
              </p>
              <span className="text-3xl font-bold text-gray-900">
                {product.price.toLocaleString('ru-RU')} с
              </span>
            </div>

            {/* Inventory Management */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <h3 className="text-base font-bold text-gray-900 mb-3">Управление остатками</h3>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Текущий остаток:</span>
                <span className={`text-base font-bold ${
                  product.inventory.quantity === 0 ? 'text-red-600' :
                  product.inventory.quantity < 10 ? 'text-orange-600' :
                  'text-green-600'
                }`}>
                  {product.inventory.quantity} шт
                </span>
              </div>

              {isEditingQuantity ? (
                <div className="space-y-2">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={decrementQuantity}
                      disabled={savingQuantity}
                      className="p-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-all disabled:opacity-50"
                    >
                      <Minus size={18} className="text-gray-700" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={editedQuantity}
                      onChange={(e) => setEditedQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                      disabled={savingQuantity}
                      className="flex-1 text-center px-3 py-2 border border-gray-300 rounded-lg text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <button
                      onClick={incrementQuantity}
                      disabled={savingQuantity}
                      className="p-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-all disabled:opacity-50"
                    >
                      <Plus size={18} className="text-gray-700" />
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={saveQuantity}
                      disabled={savingQuantity}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50 font-medium text-sm"
                    >
                      {savingQuantity ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="ml-2">Сохранение...</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} className="mr-1" />
                          Сохранить
                        </>
                      )}
                    </button>
                    <button
                      onClick={cancelEditingQuantity}
                      disabled={savingQuantity}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all disabled:opacity-50"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={startEditingQuantity}
                  className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium text-sm"
                >
                  Изменить количество
                </button>
              )}
            </div>

            {/* Description */}
            <div className="flex-1 overflow-y-auto">
              {getProductDescription('ru') && (
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Описание (Русский)</h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap line-clamp-3">
                    {getProductDescription('ru')}
                  </p>
                </div>
              )}

              {getProductDescription('kg') && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Описание (Кыргызча)</h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap line-clamp-3">
                    {getProductDescription('kg')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
