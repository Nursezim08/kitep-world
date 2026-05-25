'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Search, Filter, Image as ImageIcon, Minus, Plus, Save, X } from 'lucide-react';
import LightCustomSelect from '@/app/components/LightCustomSelect';

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

export default function ManagerProductsClient() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingQuantity, setEditingQuantity] = useState<{ [key: string]: number }>({});
  const [savingQuantity, setSavingQuantity] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, categoryFilter]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories?parentId=null');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (categoryFilter !== 'all') {
        params.append('categoryId', categoryFilter);
      }

      const response = await fetch(`/api/manager/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else if (response.status === 401) {
        window.location.href = '/manager/login';
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (product: Product, locale: 'ru' | 'kg' = 'ru') => {
    return product.translations.find((t) => t.locale === locale)?.name || 'Без названия';
  };

  const getCategoryName = (category: Category | undefined, locale: 'ru' | 'kg' = 'ru') => {
    if (!category) return 'Без категории';
    return category.translations.find((t) => t.locale === locale)?.name || 'Без категории';
  };

  const startEditingQuantity = (productId: string, currentQuantity: number) => {
    setEditingQuantity({ ...editingQuantity, [productId]: currentQuantity });
  };

  const cancelEditingQuantity = (productId: string) => {
    const newEditing = { ...editingQuantity };
    delete newEditing[productId];
    setEditingQuantity(newEditing);
  };

  const incrementQuantity = (productId: string) => {
    setEditingQuantity({
      ...editingQuantity,
      [productId]: (editingQuantity[productId] || 0) + 1,
    });
  };

  const decrementQuantity = (productId: string) => {
    const current = editingQuantity[productId] || 0;
    if (current > 0) {
      setEditingQuantity({
        ...editingQuantity,
        [productId]: current - 1,
      });
    }
  };

  const saveQuantity = async (productId: string) => {
    const newQuantity = editingQuantity[productId];
    
    if (newQuantity === undefined) return;

    setSavingQuantity({ ...savingQuantity, [productId]: true });

    try {
      const response = await fetch(`/api/manager/products/${productId}/inventory`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (response.ok) {
        // Обновляем локальное состояние
        setProducts(products.map(p => 
          p.id === productId 
            ? { ...p, inventory: { quantity: newQuantity } }
            : p
        ));
        
        // Убираем из режима редактирования
        cancelEditingQuantity(productId);
      } else {
        const data = await response.json();
        alert(data.error || 'Не удалось обновить количество');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Произошла ошибка при обновлении количества');
    } finally {
      setSavingQuantity({ ...savingQuantity, [productId]: false });
    }
  };

  return (
    <div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm mb-4 sm:mb-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск товаров по названию, SKU или бренду..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-xs sm:text-sm"
            />
          </div>
          <div className="w-full">
            <LightCustomSelect
              value={categoryFilter}
              onChange={(value) => setCategoryFilter(value)}
              options={[
                { value: 'all', label: 'Все категории' },
                ...categories.map(cat => ({
                  value: cat.id,
                  label: getCategoryName(cat, 'ru')
                }))
              ]}
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Загрузка товаров...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">
            {searchQuery ? 'Товары не найдены' : 'Нет товаров'}
          </p>
          <p className="text-gray-500 text-sm">
            {searchQuery ? 'Попробуйте изменить параметры поиска' : 'Товары появятся после добавления администратором'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => {
            const mainImage = product.images[0];
            const isEditing = editingQuantity[product.id] !== undefined;
            const isSaving = savingQuantity[product.id];
            const currentQuantity = isEditing ? editingQuantity[product.id] : product.inventory.quantity;

            return (
              <div
                key={product.id}
                onClick={() => router.push(`/manager/products/${product.id}`)}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
              >
                {/* Image */}
                <div className="aspect-square bg-gray-100 overflow-hidden relative">
                  {mainImage ? (
                    <img
                      src={mainImage.imageUrl}
                      alt={getProductName(product)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <div className={`px-2 py-1 rounded-lg text-[10px] sm:text-xs font-semibold ${
                      product.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {product.status === 'active' ? 'Активен' : 'Неактивен'}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5">
                  {/* Category */}
                  <div className="mb-2 sm:mb-3">
                    <span className="text-[10px] sm:text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {getCategoryName(product.category, 'ru')}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1 line-clamp-2">
                    {getProductName(product, 'ru')}
                  </h3>

                  {/* SKU */}
                  <div className="text-[10px] sm:text-xs text-gray-500 mb-2 sm:mb-3">
                    <p>SKU: {product.sku}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-3 sm:mb-4">
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">
                      {product.price.toLocaleString('ru-RU')} с
                    </span>
                  </div>

                  {/* Quantity Control */}
                  <div className="border-t border-gray-200 pt-3 sm:pt-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-medium text-gray-700">Остаток:</span>
                      <span className={`text-xs sm:text-sm font-bold ${
                        currentQuantity === 0 ? 'text-red-600' :
                        currentQuantity < 10 ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {currentQuantity} шт
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="space-y-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              decrementQuantity(product.id);
                            }}
                            disabled={isSaving}
                            className="p-1.5 sm:p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all disabled:opacity-50"
                          >
                            <Minus size={14} className="sm:w-4 sm:h-4 text-gray-700" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={currentQuantity}
                            onChange={(e) => {
                              e.stopPropagation();
                              setEditingQuantity({
                                ...editingQuantity,
                                [product.id]: Math.max(0, parseInt(e.target.value) || 0)
                              });
                            }}
                            onClick={(e) => e.stopPropagation()}
                            disabled={isSaving}
                            className="w-16 sm:w-20 text-center px-2 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              incrementQuantity(product.id);
                            }}
                            disabled={isSaving}
                            className="p-1.5 sm:p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all disabled:opacity-50"
                          >
                            <Plus size={14} className="sm:w-4 sm:h-4 text-gray-700" />
                          </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              saveQuantity(product.id);
                            }}
                            disabled={isSaving}
                            className="flex-1 flex items-center justify-center px-3 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50 text-xs sm:text-sm font-medium"
                          >
                            {isSaving ? (
                              <>
                                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-2 hidden sm:inline">Сохранение...</span>
                              </>
                            ) : (
                              <span>Сохранить</span>
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelEditingQuantity(product.id);
                            }}
                            disabled={isSaving}
                            className="p-1.5 sm:p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all disabled:opacity-50"
                          >
                            <X size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingQuantity(product.id, product.inventory.quantity);
                        }}
                        className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all text-xs sm:text-sm font-medium"
                      >
                        Изменить количество
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
