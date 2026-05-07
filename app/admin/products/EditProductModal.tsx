'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import AdminToast, { ToastType } from '@/app/components/AdminToast';

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

interface Product {
  id: string;
  sku: string;
  categoryId: string;
  brand: string | null;
  price: number;
  status: string;
  translations: ProductTranslation[];
  images: ProductImage[];
}

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}

const LOCALES = [
  { code: 'ru', name: 'Русский', placeholder: 'Например: Ручка шариковая' },
  { code: 'kg', name: 'Кыргызча', placeholder: 'Мисалы: Шарикалуу калем' },
] as const;

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

let toastIdCounter = 0;

export default function EditProductModal({ product, onClose, onSuccess }: EditProductModalProps) {
  const [formData, setFormData] = useState({
    sku: '',
    categoryId: '',
    brand: '',
    price: '',
    status: 'active',
    translations: {} as Record<string, { name: string; description: string }>,
    existingImages: [] as ProductImage[],
    newImages: [] as string[],
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, type: ToastType = 'error') => {
    const id = Date.now() + toastIdCounter++;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const hideToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    fetchCategories();

    // Заполняем форму данными товара
    const translationsData: Record<string, { name: string; description: string }> = {};
    LOCALES.forEach((locale) => {
      const translation = product.translations.find((t) => t.locale === locale.code);
      translationsData[locale.code] = {
        name: translation?.name || '',
        description: translation?.description || '',
      };
    });

    setFormData({
      sku: product.sku,
      categoryId: product.categoryId,
      brand: product.brand || '',
      price: product.price.toString(),
      status: product.status,
      translations: translationsData,
      existingImages: product.images.filter(img => img.status === 'active'),
      newImages: [],
    });
  }, [product]);

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

  const handleTranslationChange = (locale: string, field: 'name' | 'description', value: string) => {
    setFormData({
      ...formData,
      translations: {
        ...formData.translations,
        [locale]: {
          ...formData.translations[locale],
          [field]: value,
        },
      },
    });
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Допускаются только изображения', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Размер изображения не должен превышать 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setFormData((prev) => ({
        ...prev,
        newImages: [...prev.newImages, base64],
      }));
      showToast('Изображение добавлено', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(processImageFile);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files) {
      Array.from(files).forEach(processImageFile);
    }
  };

  const handleClick = () => {
    document.getElementById('image-upload-input-edit')?.click();
  };

  const removeExistingImage = (imageId: string) => {
    setFormData((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((img) => img.id !== imageId),
    }));
  };

  const removeNewImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      newImages: prev.newImages.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Валидация
    if (!formData.sku.trim()) {
      setError('Введите артикул товара');
      return;
    }

    if (!formData.categoryId) {
      setError('Выберите категорию');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Введите корректную цену');
      return;
    }

    for (const locale of LOCALES) {
      if (!formData.translations[locale.code]?.name.trim()) {
        setError(`Введите название на ${locale.name.toLowerCase()}`);
        return;
      }
    }

    if (formData.existingImages.length === 0 && formData.newImages.length === 0) {
      setError('Добавьте хотя бы одно изображение');
      return;
    }

    setLoading(true);

    try {
      const translationsData: Record<string, { name: string; description: string }> = {};
      LOCALES.forEach((locale) => {
        translationsData[locale.code] = {
          name: formData.translations[locale.code].name,
          description: formData.translations[locale.code].description || '',
        };
      });

      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sku: formData.sku,
          categoryId: formData.categoryId,
          brand: formData.brand || null,
          price: parseFloat(formData.price),
          status: formData.status,
          translations: translationsData,
          existingImageIds: formData.existingImages.map(img => img.id),
          newImages: formData.newImages,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || 'Не удалось обновить товар');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setError('Произошла ошибка при обновлении товара');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (category: Category) => {
    return category.translations.find((t) => t.locale === 'ru')?.name || 'Без названия';
  };

  const allImages = [
    ...formData.existingImages.map(img => ({ type: 'existing' as const, data: img })),
    ...formData.newImages.map(img => ({ type: 'new' as const, data: img })),
  ];

  return (
    <>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ top: `${24 + index * 80}px` }}
          className="fixed right-6 z-[9999]"
        >
          <AdminToast
            message={toast.message}
            type={toast.type}
            onClose={() => hideToast(toast.id)}
          />
        </div>
      ))}

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
            <h2 className="text-2xl font-bold text-white">Редактировать товар</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* SKU & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Артикул (SKU) *
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Например: BK-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Категория *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {getCategoryName(category)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Brand & Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Бренд
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Например: Erich Krause"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Цена (сом) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Translations */}
            {LOCALES.map((locale) => (
              <div key={locale.code} className="space-y-4 p-4 bg-gray-700/30 rounded-lg">
                <h3 className="text-white font-medium">{locale.name}</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Название *
                  </label>
                  <input
                    type="text"
                    value={formData.translations[locale.code]?.name || ''}
                    onChange={(e) => handleTranslationChange(locale.code, 'name', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder={locale.placeholder}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Описание
                  </label>
                  <textarea
                    value={formData.translations[locale.code]?.description || ''}
                    onChange={(e) => handleTranslationChange(locale.code, 'description', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[100px]"
                    placeholder="Описание товара..."
                  />
                </div>
              </div>
            ))}

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Изображения *
              </label>

              {/* Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
                className={`w-full h-32 bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer transition-all border-2 border-dashed ${
                  isDragging
                    ? 'border-violet-500 bg-violet-500/10'
                    : 'border-gray-600 hover:border-gray-500 hover:bg-gray-600/50'
                }`}
              >
                <div className="text-center px-4">
                  <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-xs mb-1">
                    {isDragging ? 'Отпустите файлы' : 'Добавить изображения'}
                  </p>
                  <p className="text-gray-500 text-xs">
                    или кликните для выбора
                  </p>
                </div>
                <input
                  id="image-upload-input-edit"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* Images Preview */}
              {allImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {allImages.map((item, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={item.type === 'existing' ? item.data.imageUrl : item.data}
                        alt={`Preview ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          item.type === 'existing'
                            ? removeExistingImage(item.data.id)
                            : removeNewImage(formData.newImages.indexOf(item.data))
                        }
                        className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-violet-500 text-white text-xs rounded">
                          Главное
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Статус
              </label>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, status: formData.status === 'active' ? 'inactive' : 'active' })
                }
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                  formData.status === 'active' ? 'bg-violet-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    formData.status === 'active' ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="ml-3 text-sm text-gray-400">
                {formData.status === 'active' ? 'Активен' : 'Неактивен'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4 sticky bottom-0 bg-gray-800 pb-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
