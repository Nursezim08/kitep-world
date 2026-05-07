'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useBlockScroll } from '@/app/hooks/useBlockScroll';

interface DeleteCategoryModalProps {
  categoryName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteCategoryModal({
  categoryName,
  onConfirm,
  onCancel,
}: DeleteCategoryModalProps) {
  // Блокируем скролл страницы при открытии модального окна
  useBlockScroll(true);
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-lg max-w-md w-full shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white">
              Подтверждение удаления
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300 mb-2">
            Вы уверены, что хотите удалить категорию
          </p>
          <p className="text-white font-semibold text-lg mb-4">
            "{categoryName}"?
          </p>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400 text-sm">
              ⚠️ Это действие нельзя отменить. Категория будет помечена как удалённая, 
              а изображение будет удалено из хранилища.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}
