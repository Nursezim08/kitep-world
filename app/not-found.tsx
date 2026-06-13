import Link from 'next/link';
import { Home, Search, Package } from 'lucide-react';

export const metadata = {
  title: 'Страница не найдена | Nur-kitep',
  description: 'Запрашиваемая страница не найдена. Вернитесь на главную или воспользуйтесь поиском.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Иллюстрация */}
        <div className="mb-8">
          <div className="text-9xl font-extrabold text-violet-600 mb-4">404</div>
          <div className="flex items-center justify-center gap-4 mb-8">
            <Package className="w-16 h-16 text-gray-300 animate-bounce" />
            <Package className="w-20 h-20 text-gray-400 animate-bounce delay-100" />
            <Package className="w-16 h-16 text-gray-300 animate-bounce delay-200" />
          </div>
        </div>

        {/* Заголовок */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Страница не найдена
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          К сожалению, запрашиваемая страница не существует или была перемещена.
        </p>

        {/* Действия */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-500 to-violet-600 text-white font-bold rounded-2xl hover:shadow-lg hover:scale-105 transition-all"
          >
            <Home className="w-5 h-5" />
            На главную
          </Link>

          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-violet-600 font-bold rounded-2xl border-2 border-violet-200 hover:border-violet-500 hover:shadow-lg transition-all"
          >
            <Package className="w-5 h-5" />
            Каталог товаров
          </Link>
        </div>

        {/* Поиск */}
        <div className="mt-12">
          <p className="text-sm text-gray-500 mb-4">Или воспользуйтесь поиском:</p>
          <form action="/search" method="GET" className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="q"
                placeholder="Поиск товаров..."
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </form>
        </div>

        {/* Популярные ссылки */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Популярные разделы:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/catalog"
              className="px-4 py-2 bg-violet-50 text-violet-600 rounded-lg hover:bg-violet-100 transition-colors text-sm font-semibold"
            >
              Каталог
            </Link>
            <Link
              href="/catalog?category=books"
              className="px-4 py-2 bg-violet-50 text-violet-600 rounded-lg hover:bg-violet-100 transition-colors text-sm font-semibold"
            >
              Книги
            </Link>
            <Link
              href="/catalog?category=stationery"
              className="px-4 py-2 bg-violet-50 text-violet-600 rounded-lg hover:bg-violet-100 transition-colors text-sm font-semibold"
            >
              Канцелярия
            </Link>
            <Link
              href="/catalog?category=school"
              className="px-4 py-2 bg-violet-50 text-violet-600 rounded-lg hover:bg-violet-100 transition-colors text-sm font-semibold"
            >
              Школьные товары
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
