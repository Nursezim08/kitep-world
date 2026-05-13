'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Upload, Trash2, ChevronDown, Check } from 'lucide-react';
import AdminToast, { ToastType } from '@/app/components/AdminToast';
import { useBlockScroll } from '@/app/hooks/useBlockScroll';

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
  const [isTranslating, setIsTranslating] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  // Блокируем скролл страницы при открытии модального окна
  useBlockScroll(true);

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

  // Закрытие выпадающего списка категорий при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const getCategoryName = (category: Category | undefined) => {
    if (!category || !category.translations) return 'Без категории';
    return category.translations.find((t) => t.locale === 'ru')?.name || 'Без названия';
  };

  const handleTranslate = async () => {
    const ruName = formData.translations['ru']?.name || '';
    const ruDescription = formData.translations['ru']?.description || '';

    if (!ruName.trim()) {
      showToast('Сначала заполните название на русском языке', 'warning');
      return;
    }

    setIsTranslating(true);
    setError('');

    try {
      const response = await fetch('/api/admin/products/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: ruName,
          description: ruDescription,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Обновляем переводы
        setFormData((prev) => ({
          ...prev,
          translations: {
            ...prev.translations,
            kg: {
              name: data.translations.kg.name,
              description: data.translations.kg.description,
            },
          },
        }));

        showToast('Перевод выполнен успешно', 'success');
      } else {
        const data = await response.json();
        showToast(data.error || 'Не удалось выполнить перевод', 'error');
      }
    } catch (error) {
      console.error('Translation error:', error);
      showToast('Произошла ошибка при переводе', 'error');
    } finally {
      setIsTranslating(false);
    }
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
                <div ref={categoryRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm text-left focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all hover:bg-gray-600/50 flex items-center justify-between"
                  >
                    <span className={formData.categoryId ? 'text-white' : 'text-gray-400'}>
                      {formData.categoryId
                        ? getCategoryName(categories.find(c => c.id === formData.categoryId))
                        : 'Выберите категорию'}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        isCategoryOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isCategoryOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-gray-700 border border-gray-600 rounded-lg shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                      {categories.map((category) => {
                        const isSelected = category.id === formData.categoryId;
                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, categoryId: category.id });
                              setIsCategoryOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left text-sm transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-violet-600 text-white'
                                : 'text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            <span>{getCategoryName(category)}</span>
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">{locale.name}</h3>
                  {locale.code === 'ru' && (
                    <button
                      type="button"
                      onClick={handleTranslate}
                      disabled={isTranslating || !formData.translations['ru']?.name.trim() || !formData.translations['ru']?.description.trim()}
                      className={`flex items-center gap-1.5 px-2.5 py-1 text-white text-xs rounded-lg transition-all ${
                        !formData.translations['ru']?.name.trim() || !formData.translations['ru']?.description.trim()
                          ? 'bg-violet-600/30 cursor-not-allowed'
                          : 'bg-violet-600 hover:bg-violet-700 cursor-pointer'
                      } ${isTranslating ? 'opacity-70' : ''}`}
                    >
                        {isTranslating ? (
                          <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Перевод...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" viewBox="0 0 56 56" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                              <path d="M 26.6875 12.6602 C 26.9687 12.6602 27.1094 12.4961 27.1797 12.2383 C 27.9062 8.3242 27.8594 8.2305 31.9375 7.4570 C 32.2187 7.4102 32.3828 7.2461 32.3828 6.9648 C 32.3828 6.6836 32.2187 6.5195 31.9375 6.4726 C 27.8828 5.6524 28.0000 5.5586 27.1797 1.6914 C 27.1094 1.4336 26.9687 1.2695 26.6875 1.2695 C 26.4062 1.2695 26.2656 1.4336 26.1953 1.6914 C 25.3750 5.5586 25.5156 5.6524 21.4375 6.4726 C 21.1797 6.5195 20.9922 6.6836 20.9922 6.9648 C 20.9922 7.2461 21.1797 7.4102 21.4375 7.4570 C 25.5156 8.2774 25.4687 8.3242 26.1953 12.2383 C 26.2656 12.4961 26.4062 12.6602 26.6875 12.6602 Z M 15.3438 28.7852 C 15.7891 28.7852 16.0938 28.5039 16.1406 28.0821 C 16.9844 21.8242 17.1953 21.8242 23.6641 20.5821 C 24.0860 20.5117 24.3906 20.2305 24.3906 19.7852 C 24.3906 19.3633 24.0860 19.0586 23.6641 18.9883 C 17.1953 18.0977 16.9609 17.8867 16.1406 11.5117 C 16.0938 11.0899 15.7891 10.7852 15.3438 10.7852 C 14.9219 10.7852 14.6172 11.0899 14.5703 11.5352 C 13.7969 17.8164 13.4687 17.7930 7.0469 18.9883 C 6.6250 19.0821 6.3203 19.3633 6.3203 19.7852 C 6.3203 20.2539 6.6250 20.5117 7.1406 20.5821 C 13.5156 21.6133 13.7969 21.7774 14.5703 28.0352 C 14.6172 28.5039 14.9219 28.7852 15.3438 28.7852 Z M 31.2344 54.7305 C 31.8438 54.7305 32.2891 54.2852 32.4062 53.6524 C 34.0703 40.8086 35.8750 38.8633 48.5781 37.4570 C 49.2344 37.3867 49.6797 36.8945 49.6797 36.2852 C 49.6797 35.6758 49.2344 35.2070 48.5781 35.1133 C 35.8750 33.7070 34.0703 31.7617 32.4062 18.9180 C 32.2891 18.2852 31.8438 17.8633 31.2344 17.8633 C 30.6250 17.8633 30.1797 18.2852 30.0860 18.9180 C 28.4219 31.7617 26.5938 33.7070 13.9140 35.1133 C 13.2344 35.2070 12.7891 35.6758 12.7891 36.2852 C 12.7891 36.8945 13.2344 37.3867 13.9140 37.4570 C 26.5703 39.1211 28.3281 40.8321 30.0860 53.6524 C 30.1797 54.2852 30.6250 54.7305 31.2344 54.7305 Z"/>
                            </svg>
                            <span>Перевести на все языки</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

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
