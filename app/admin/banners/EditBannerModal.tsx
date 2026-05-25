'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Upload, Monitor, Smartphone } from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  desktopImage: string;
  mobileImage: string;
  url: string | null;
  status: 'active' | 'inactive';
}

interface EditBannerModalProps {
  isOpen: boolean;
  banner: Banner;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditBannerModal({ isOpen, banner, onClose, onSuccess }: EditBannerModalProps) {
  const [formData, setFormData] = useState({
    title: banner.title ?? '',
    desktopImage: banner.desktopImage ?? '',
    mobileImage: banner.mobileImage ?? '',
    url: banner.url ?? '',
    status: banner.status ?? 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDraggingDesktop, setIsDraggingDesktop] = useState(false);
  const [isDraggingMobile, setIsDraggingMobile] = useState(false);
  const desktopFileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title ?? '',
        desktopImage: banner.desktopImage ?? '',
        mobileImage: banner.mobileImage ?? '',
        url: banner.url ?? '',
        status: banner.status ?? 'active',
      });
    }
  }, [banner.id]);

  if (!isOpen) return null;

  const validateImageDimensions = (
    file: File,
    expectedWidth: number,
    expectedHeight: number,
    type: 'desktop' | 'mobile'
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        if (img.width !== expectedWidth || img.height !== expectedHeight) {
          setError(
            `Изображение для ${type === 'desktop' ? 'десктопа' : 'мобильных'} должно быть ${expectedWidth}x${expectedHeight}px. Загружено: ${img.width}x${img.height}px`
          );
          resolve(false);
        } else {
          resolve(true);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (file: File, type: 'desktop' | 'mobile') => {
    if (!file.type.startsWith('image/')) {
      setError('Допускаются только изображения');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Размер изображения не должен превышать 10MB');
      return;
    }

    // Проверка размеров
    const expectedWidth = type === 'desktop' ? 1920 : 768;
    const expectedHeight = type === 'desktop' ? 450 : 800;

    const isValid = await validateImageDimensions(file, expectedWidth, expectedHeight, type);
    if (!isValid) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (type === 'desktop') {
        setFormData({ ...formData, desktopImage: base64 });
      } else {
        setFormData({ ...formData, mobileImage: base64 });
      }
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent, type: 'desktop' | 'mobile') => {
    e.preventDefault();
    if (type === 'desktop') {
      setIsDraggingDesktop(true);
    } else {
      setIsDraggingMobile(true);
    }
  };

  const handleDragLeave = (type: 'desktop' | 'mobile') => {
    if (type === 'desktop') {
      setIsDraggingDesktop(false);
    } else {
      setIsDraggingMobile(false);
    }
  };

  const handleDrop = (e: React.DragEvent, type: 'desktop' | 'mobile') => {
    e.preventDefault();
    if (type === 'desktop') {
      setIsDraggingDesktop(false);
    } else {
      setIsDraggingMobile(false);
    }
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file, type);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'desktop' | 'mobile') => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file, type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Введите название баннера');
      return;
    }

    if (!formData.desktopImage) {
      setError('Загрузите изображение для десктопа');
      return;
    }

    if (!formData.mobileImage) {
      setError('Загрузите изображение для мобильных устройств');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || 'Ошибка при обновлении баннера');
      }
    } catch (error) {
      setError('Ошибка при обновлении баннера');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#252d3d] rounded-2xl w-full max-w-4xl my-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Редактировать баннер</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2a3347] rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Изображения в две колонки */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Изображение для десктопа */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Monitor size={16} />
                Изображение для десктопа *
              </label>
              <div
                onClick={() => desktopFileInputRef.current?.click()}
                onDragOver={(e) => handleDragOver(e, 'desktop')}
                onDragLeave={() => handleDragLeave('desktop')}
                onDrop={(e) => handleDrop(e, 'desktop')}
                className={`relative h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  isDraggingDesktop
                    ? 'border-violet-500 bg-violet-500/10'
                    : formData.desktopImage
                    ? 'border-transparent'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                {formData.desktopImage ? (
                  <img
                    src={formData.desktopImage}
                    alt="Desktop Preview"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <Upload size={32} className="mb-2" />
                    <p className="text-sm font-medium">Перетащите или кликните</p>
                    <p className="text-xs text-gray-500 mt-1">1920x450px, макс 10MB</p>
                  </div>
                )}
                <input
                  ref={desktopFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, 'desktop')}
                  className="hidden"
                />
              </div>
            </div>

            {/* Изображение для мобильных */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Smartphone size={16} />
                Изображение для мобильных *
              </label>
              <div
                onClick={() => mobileFileInputRef.current?.click()}
                onDragOver={(e) => handleDragOver(e, 'mobile')}
                onDragLeave={() => handleDragLeave('mobile')}
                onDrop={(e) => handleDrop(e, 'mobile')}
                className={`relative h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  isDraggingMobile
                    ? 'border-violet-500 bg-violet-500/10'
                    : formData.mobileImage
                    ? 'border-transparent'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                {formData.mobileImage ? (
                  <img
                    src={formData.mobileImage}
                    alt="Mobile Preview"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <Upload size={32} className="mb-2" />
                    <p className="text-sm font-medium">Перетащите или кликните</p>
                    <p className="text-xs text-gray-500 mt-1">768x800px, макс 10MB</p>
                  </div>
                )}
                <input
                  ref={mobileFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, 'mobile')}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Информационный блок */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/50 rounded-xl">
            <p className="text-sm text-blue-400">
              <strong>Важно:</strong> Изображения должны быть точно указанных размеров. Десктоп: 1920x450px, Мобильные: 768x800px. Максимальный размер файла: 10MB
            </p>
          </div>

          {/* Название */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Название баннера *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Например: Летняя распродажа"
              className="w-full px-4 py-3 bg-[#2a3347] border-2 border-gray-600 rounded-2xl text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none transition-colors"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ссылка (опционально)
            </label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com/promo"
              className="w-full px-4 py-3 bg-[#2a3347] border-2 border-gray-600 rounded-2xl text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">
              Если указана, при клике на баннер пользователь перейдет по этой ссылке
            </p>
          </div>

          {/* Статус */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Статус</label>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  status: formData.status === 'active' ? 'inactive' : 'active',
                })
              }
              className={`relative w-16 h-8 rounded-full transition-colors ${
                formData.status === 'active' ? 'bg-violet-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  formData.status === 'active' ? 'translate-x-8' : 'translate-x-0'
                }`}
              />
            </button>
            <p className="text-sm text-gray-400 mt-2">
              {formData.status === 'active' ? 'Активен' : 'Неактивен'}
            </p>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors font-medium"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
