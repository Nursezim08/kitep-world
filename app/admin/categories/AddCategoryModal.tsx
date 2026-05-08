'use client';

import { useState, useEffect } from 'react';
import { X, Upload, FolderOpen } from 'lucide-react';
import AdminToast, { ToastType } from '@/app/components/AdminToast';
import { useBlockScroll } from '@/app/hooks/useBlockScroll';

interface AddCategoryModalProps {
  parentId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface Category {
  id: string;
  translations: Array<{
    locale: string;
    name: string;
  }>;
}

// Список языков из enum Locale
const LOCALES = [
  { code: 'ru', name: 'Русский', placeholder: 'Например: Канцелярия' },
  { code: 'kg', name: 'Кыргызча', placeholder: 'Мисалы: Канцелярия' },
] as const;

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

// Счётчик для гарантии уникальности ID
let toastIdCounter = 0;

export default function AddCategoryModal({
  parentId,
  onClose,
  onSuccess,
}: AddCategoryModalProps) {
  const [formData, setFormData] = useState({
    translations: {
      ru: '',
      kg: '',
    },
    image: '',
    status: 'active',
    isSubcategory: false,
    selectedParentId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Блокируем скролл страницы при открытии модального окна
  useBlockScroll(true);

  // Загрузка категорий для выбора родительской
  useEffect(() => {
    if (formData.isSubcategory) {
      fetchCategories();
    }
  }, [formData.isSubcategory]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch('/api/admin/categories?level=0');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const showToast = (message: string, type: ToastType = 'error') => {
    const id = Date.now() + toastIdCounter++;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const hideToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleTranslationChange = (locale: string, value: string) => {
    setFormData({
      ...formData,
      translations: {
        ...formData.translations,
        [locale]: value,
      },
    });
  };

  const processImageFile = (file: File) => {
    // Проверка формата
    if (!file.type.startsWith('image/png')) {
      showToast('Допускаются только PNG изображения', 'error');
      return;
    }

    // Проверка размера (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Размер изображения не должен превышать 5MB', 'error');
      return;
    }

    // Проверка пропорций (должно быть квадратным)
    const img = new Image();
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const base64 = reader.result as string;
      
      img.onload = () => {
        if (img.width !== img.height) {
          showToast('Изображение должно быть квадратным (например: 512x512, 1024x1024)', 'warning');
          return;
        }
        
        // Всё ок, сохраняем - используем функциональное обновление
        setFormData((prev) => ({ ...prev, image: base64 }));
        setImagePreview(base64);
        setError('');
        showToast('Изображение загружено успешно', 'success');
      };
      
      img.src = base64;
    };
    
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // Сбрасываем input, чтобы можно было выбрать тот же файл снова
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

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleClick = () => {
    document.getElementById('image-upload-input')?.click();
  };

  const getCategoryName = (category: Category, locale: string = 'ru') => {
    return category.translations.find((t) => t.locale === locale)?.name || 'Без названия';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Валидация - проверяем все языки
    for (const locale of LOCALES) {
      if (!formData.translations[locale.code as keyof typeof formData.translations]?.trim()) {
        setError(`Введите название на ${locale.name.toLowerCase()}`);
        return;
      }
    }

    if (!formData.image) {
      setError('Загрузите изображение категории');
      return;
    }

    // Если это подкатегория, проверяем выбор родительской категории
    if (formData.isSubcategory && !formData.selectedParentId) {
      setError('Выберите родительскую категорию');
      return;
    }

    setLoading(true);

    try {
      const translationsData: Record<string, { name: string }> = {};
      LOCALES.forEach((locale) => {
        translationsData[locale.code] = {
          name: formData.translations[locale.code as keyof typeof formData.translations],
        };
      });

      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parentId: formData.isSubcategory ? formData.selectedParentId : parentId,
          image: formData.image,
          status: formData.status,
          translations: translationsData,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || 'Не удалось создать категорию');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      setError('Произошла ошибка при создании категории');
    } finally {
      setLoading(false);
    }
  };

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
        <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">
              {parentId ? 'Добавить подкатегорию' : 'Добавить категорию'}
            </h2>
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

            {/* Info block for subcategory */}
            {parentId && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-blue-400 text-sm font-medium mb-1">
                      Создание подкатегории
                    </p>
                    <p className="text-gray-400 text-xs">
                      Подкатегория будет добавлена внутрь выбранной категории для более детальной организации товаров
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Grid: Image Left, Names Right */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Image Upload - 1 колонка */}
              <div className="md:col-span-1">
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Изображение (PNG) *
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleClick}
                  className={`w-full h-[136px] bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer transition-all border-2 border-dashed ${
                    isDragging
                      ? 'border-blue-500 bg-blue-500/10'
                      : imagePreview
                      ? 'border-transparent'
                      : 'border-gray-600 hover:border-gray-500 hover:bg-gray-600/50'
                  }`}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center px-2">
                      <Upload className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                      <p className="text-gray-400 text-[10px] mb-0.5">
                        {isDragging ? 'Отпустите' : 'Перетащите'}
                      </p>
                      <p className="text-gray-500 text-[9px]">
                        или кликните
                      </p>
                      <p className="text-gray-600 text-[9px] mt-0.5">
                        PNG, макс 5MB
                      </p>
                    </div>
                  )}
                  <input
                    id="image-upload-input"
                    type="file"
                    accept="image/png"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Right Column: Translations - 2 колонки */}
              <div className="md:col-span-2">
                {LOCALES.map((locale, index) => (
                  <div key={locale.code} className={index === 1 ? 'mt-10' : ''}>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Название ({locale.name}) *
                    </label>
                    <input
                      type="text"
                      value={formData.translations[locale.code as keyof typeof formData.translations]}
                      onChange={(e) => handleTranslationChange(locale.code, e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={locale.placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Status and Subcategory Toggle - в одной строке */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status - Toggle Switch */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">
                  Статус
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: formData.status === 'active' ? 'inactive' : 'active' })}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                    formData.status === 'active' ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      formData.status === 'active' ? 'translate-x-8' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="ml-3 text-xs text-gray-400">
                  {formData.status === 'active' ? 'Активна' : 'Неактивна'}
                </span>
              </div>

              {/* Subcategory Toggle - только если не передан parentId */}
              {!parentId && (
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-2">
                    Это подкатегория?
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ 
                      ...formData, 
                      isSubcategory: !formData.isSubcategory,
                      selectedParentId: '' 
                    })}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                      formData.isSubcategory ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        formData.isSubcategory ? 'translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="ml-3 text-xs text-gray-400">
                    {formData.isSubcategory ? 'Да' : 'Нет'}
                  </span>
                </div>
              )}
            </div>

            {/* Parent Category Selection */}
            {formData.isSubcategory && !parentId && (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Родительская категория *
                </label>
                {loadingCategories ? (
                  <div className="text-gray-400 text-xs py-2">Загрузка категорий...</div>
                ) : categories.length === 0 ? (
                  <div className="text-gray-400 text-xs py-2">
                    Нет доступных категорий. Сначала создайте основную категорию.
                  </div>
                ) : (
                  <select
                    value={formData.selectedParentId}
                    onChange={(e) => setFormData({ ...formData, selectedParentId: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {getCategoryName(category, 'ru')} / {getCategoryName(category, 'kg')}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4">
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
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Создание...' : 'Создать'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
