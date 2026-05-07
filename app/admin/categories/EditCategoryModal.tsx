'use client';

import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import AdminToast, { ToastType } from '@/app/components/AdminToast';

interface CategoryTranslation {
  id: string;
  locale: 'ru' | 'kg';
  name: string;
}

interface Category {
  id: string;
  parentId: string | null;
  image: string | null;
  status: string;
  translations: CategoryTranslation[];
}

interface EditCategoryModalProps {
  category: Category;
  onClose: () => void;
  onSuccess: () => void;
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

export default function EditCategoryModal({
  category,
  onClose,
  onSuccess,
}: EditCategoryModalProps) {
  const [formData, setFormData] = useState({
    translations: {} as Record<string, string>,
    image: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');
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
    // Заполняем форму данными категории
    const translationsData: Record<string, string> = {};
    LOCALES.forEach((locale) => {
      const translation = category.translations.find((t) => t.locale === locale.code);
      translationsData[locale.code] = translation?.name || '';
    });

    setFormData({
      translations: translationsData,
      image: category.image || '',
      status: category.status,
    });

    if (category.image) {
      setImagePreview(category.image);
    }
  }, [category]);

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
    document.getElementById('image-upload-input-edit')?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Валидация - проверяем все языки
    for (const locale of LOCALES) {
      if (!formData.translations[locale.code]?.trim()) {
        setError(`Введите название на ${locale.name.toLowerCase()}`);
        return;
      }
    }

    if (!formData.image) {
      setError('Загрузите изображение категории');
      return;
    }

    setLoading(true);

    try {
      const translationsData: Record<string, { name: string }> = {};
      LOCALES.forEach((locale) => {
        translationsData[locale.code] = {
          name: formData.translations[locale.code],
        };
      });

      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: formData.image,
          status: formData.status,
          translations: translationsData,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || 'Не удалось обновить категорию');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setError('Произошла ошибка при обновлении категории');
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
          <h2 className="text-2xl font-bold text-white">Редактировать категорию</h2>
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

          {/* Image Upload - Drag and Drop */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Изображение (PNG) *
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleClick}
              className={`w-full h-32 bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer transition-all border-2 border-dashed ${
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
                <div className="text-center px-4">
                  <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-xs mb-1">
                    {isDragging ? 'Отпустите файл' : 'Перетащите изображение'}
                  </p>
                  <p className="text-gray-500 text-xs">
                    или кликните для выбора
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    PNG, квадратное, макс 5MB
                  </p>
                </div>
              )}
              <input
                id="image-upload-input-edit"
                type="file"
                accept="image/png"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Translations - Dynamic based on LOCALES */}
          {LOCALES.map((locale) => (
            <div key={locale.code}>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Название ({locale.name}) *
              </label>
              <input
                type="text"
                value={formData.translations[locale.code] || ''}
                onChange={(e) => handleTranslationChange(locale.code, e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={locale.placeholder}
              />
            </div>
          ))}

          {/* Status - Toggle Switch */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Статус
            </label>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, status: formData.status === 'active' ? 'inactive' : 'active' })}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                formData.status === 'active' ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  formData.status === 'active' ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="ml-3 text-sm text-gray-400">
              {formData.status === 'active' ? 'Активна' : 'Неактивна'}
            </span>
          </div>

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
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
      </div>
    </>
  );
}
