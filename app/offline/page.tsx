import { WifiOff } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-violet-100 rounded-full flex items-center justify-center">
            <WifiOff className="w-12 h-12 text-violet-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Нет подключения к интернету
        </h1>

        <p className="text-gray-600 mb-8">
          Проверьте подключение к интернету и попробуйте снова.
          Некоторые страницы могут быть доступны в оффлайн режиме.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:from-violet-700 hover:to-purple-700 transition-all"
          >
            Попробовать снова
          </button>

          <Link
            href="/"
            className="block w-full px-6 py-3 bg-white text-violet-600 rounded-xl font-medium hover:bg-gray-50 transition-all border-2 border-violet-600"
          >
            На главную
          </Link>
        </div>

        <div className="mt-8 p-4 bg-white rounded-xl border border-violet-200">
          <p className="text-sm text-gray-600">
            💡 <strong>Совет:</strong> Добавьте приложение на главный экран для быстрого доступа
          </p>
        </div>
      </div>
    </div>
  );
}
