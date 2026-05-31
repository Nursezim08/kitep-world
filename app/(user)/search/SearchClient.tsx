'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Package,
  Star,
  Heart,
  Loader2,
} from 'lucide-react';
import UserHeader from '@/app/components/UserHeader';
import UserSidebar from '@/app/components/UserSidebar';
import { useTranslation } from '@/app/i18n/client';
import { useChat } from '@/app/(user)/ChatContext';

interface User {
  id: string;
  fullName: string;
  email: string;
  avatar: string | null;
}

interface ProductTranslation {
  locale: 'ru' | 'kg';
  name: string;
  description: string | null;
}

interface ProductImage {
  imageUrl: string;
}

interface CategoryTranslation {
  locale: 'ru' | 'kg';
  name: string;
}

interface Category {
  id: string;
  translations: CategoryTranslation[];
}

interface Product {
  id: string;
  sku: string;
  brand: string | null;
  price: number;
  status: string;
  translations: ProductTranslation[];
  images: ProductImage[];
  category: Category | null;
  averageRating: number;
  _count: {
    reviews: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface SearchClientProps {
  user: User;
}

export default function SearchClient({ user }: SearchClientProps) {
  const router = useRouter();
  const { t } = useTranslation('user');
  const { setSidebarCollapsed: syncSidebarToContext } = useChat();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => { syncSidebarToContext(sidebarCollapsed); }, [sidebarCollapsed, syncSidebarToContext]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchCartCount();
  }, []);

  useEffect(() => {
    if (queryParam) {
      setSearchQuery(queryParam);
      performSearch(queryParam, 1);
    }
  }, [queryParam]);

  const fetchCartCount = async () => {
    try {
      const response = await fetch('/api/user/cart');
      if (response.ok) {
        const data = await response.json();
        setCartCount(data.cartItems.length);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const performSearch = async (query: string, page: number) => {
    if (!query || query.trim().length < 2) {
      setProducts([]);
      setPagination({ page: 1, limit: 20, total: 0, pages: 0 });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/user/search?q=${encodeURIComponent(query)}&page=${page}&limit=20`
      );
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handlePageChange = (newPage: number) => {
    performSearch(searchQuery, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setProducts([]);
    setPagination({ page: 1, limit: 20, total: 0, pages: 0 });
    router.push('/search');
  };

  const getProductName = (product: Product) => {
    return product.translations.find((t) => t.locale === 'ru')?.name || 'Без названия';
  };

  const getCategoryName = (category: Category | null) => {
    if (!category) return null;
    return category.translations.find((t) => t.locale === 'ru')?.name || 'Без категории';
  };

  // Генерация номеров страниц для пагинации
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const { page, pages: totalPages } = pagination;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader
        user={user}
        cartCount={cartCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearch}
      />

      <div className="flex pt-[57px] pb-16 lg:pb-0">
        <UserSidebar
          active="catalog"
          collapsed={sidebarCollapsed}
          onCollapseChange={setSidebarCollapsed}
          cartCount={cartCount}
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <main className="p-4 sm:p-6 lg:p-8">
            {/* Search Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1 sm:mb-2">Результаты поиска</h1>
              {searchQuery && (
                <p className="text-sm sm:text-base text-gray-600">
                  По запросу <span className="font-semibold text-violet-600">"{searchQuery}"</span>{' '}
                  {loading ? (
                    'идет поиск...'
                  ) : (
                    <>
                      найдено{' '}
                      <span className="font-semibold text-violet-600">{pagination.total}</span>{' '}
                      {pagination.total === 1
                        ? 'товар'
                        : pagination.total < 5
                        ? 'товара'
                        : 'товаров'}
                    </>
                  )}
                </p>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
              </div>
            )}

            {/* Empty State */}
            {!loading && searchQuery && products.length === 0 && (
              <div className="text-center py-20">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ничего не найдено</h3>
                <p className="text-gray-600 mb-6">
                  Попробуйте изменить поисковый запрос или{' '}
                  <button
                    onClick={() => router.push('/catalog')}
                    className="text-violet-600 hover:text-violet-700 font-semibold"
                  >
                    перейти в каталог
                  </button>
                </p>
              </div>
            )}

            {/* No Query State */}
            {!loading && !searchQuery && (
              <div className="text-center py-20">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Введите поисковый запрос</h3>
                <p className="text-gray-600">
                  Используйте поле поиска выше для поиска товаров
                </p>
              </div>
            )}

            {/* Products Grid */}
            {!loading && products.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                  {products.map((product) => {
                    const mainImage = product.images[0];
                    const categoryName = getCategoryName(product.category);

                    return (
                      <div
                        key={product.id}
                        onClick={() => router.push(`/product/${product.id}`)}
                        className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all border border-gray-200 cursor-pointer"
                      >
                        {/* Product Image */}
                        <div className="relative aspect-square bg-white overflow-hidden p-2 sm:p-4">
                          {mainImage ? (
                            <img
                              src={mainImage.imageUrl}
                              alt={getProductName(product)}
                              className="w-full h-full object-contain rounded-xl"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center rounded-xl">
                              <Package className="w-16 h-16 sm:w-24 sm:h-24 text-gray-300" />
                            </div>
                          )}

                          {/* Wishlist Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Add to wishlist
                            }}
                            className="absolute top-3 right-3 sm:top-6 sm:right-6 p-2 sm:p-2.5 bg-white rounded-full hover:bg-gray-50 transition-all shadow-md"
                          >
                            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                          </button>
                        </div>

                        {/* Product Info */}
                        <div className="p-3 sm:p-5 space-y-2 sm:space-y-3">
                          <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
                            {getProductName(product)}
                          </h3>

                          {/* Category */}
                          {categoryName && (
                            <p className="text-[10px] sm:text-xs text-gray-500 truncate">{categoryName}</p>
                          )}

                          {/* Rating and Price */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {/* Star with partial fill */}
                              <div className="relative w-4 h-4">
                                {/* Background star (empty) */}
                                <Star className="w-4 h-4 text-gray-300 absolute top-0 left-0" />
                                {/* Foreground star (filled) with clip */}
                                <div
                                  className="absolute top-0 left-0 overflow-hidden"
                                  style={{
                                    width: `${(product.averageRating / 5) * 100}%`,
                                  }}
                                >
                                  <Star className="w-4 h-4 fill-violet-600 text-violet-600" />
                                </div>
                              </div>
                              <span className="text-xs sm:text-sm font-semibold text-gray-900">
                                {product.averageRating > 0
                                  ? product.averageRating.toFixed(1)
                                  : '0'}
                              </span>
                            </div>

                            {/* Price */}
                            <span className="text-sm sm:text-base font-bold text-gray-900">
                              {product.price}с
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3 sm:px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                    >
                      Назад
                    </button>

                    {/* Page Numbers */}
                    {getPageNumbers().map((pageNum, index) =>
                      typeof pageNum === 'number' ? (
                        <button
                          key={index}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-semibold transition-all text-sm ${
                            pagination.page === pageNum
                              ? 'bg-violet-600 text-white'
                              : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ) : (
                        <span key={index} className="px-1 sm:px-2 text-gray-400">
                          ...
                        </span>
                      )
                    )}

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="px-3 sm:px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                    >
                      Вперед
                    </button>
                  </div>
                )}

                {/* Results Info */}
                <div className="text-center mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500">
                  Показано {(pagination.page - 1) * pagination.limit + 1}-
                  {Math.min(pagination.page * pagination.limit, pagination.total)} из{' '}
                  {pagination.total}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
