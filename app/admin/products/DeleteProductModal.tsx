'use client';

import { AlertTriangle, X } from 'lucide-react';

interface DeleteProductModalProps {
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteProductModal({
  productName,
  onConfirm,
  onCancel,
}: DeleteProductModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      <div className="bg-gray-800 rounded-xl max-w-md w-full shadow-2xl relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white">Подтверждение удаления</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-300">
            Вы уверены, что хотите удалить товар{' '}
            <span className="font-bold text-white">"{productName}"</span>?
          </p>

          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-300">
                <p className="font-medium mb-1">Это действие нельзя отменить</p>
                <ul className="list-disc list-inside space-y-1 text-red-400">
                  <li>Товар будет удален из всех филиалов</li>
                  <li>Изображения будут удалены из хранилища</li>
                  <li>История заказов сохранится</li>
                </ul>
              </div>
            </div>
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
