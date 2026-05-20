'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Search,
  Home,
  Grid,
  ShoppingCart,
  Package,
  MessageCircle,
  User,
  ChevronRight,
  Star,
  Filter,
  X,
  Bell,
  Heart,
  ChevronLeft,
  LogOut,
  SlidersHorizontal,
  ChevronDown,
  Check,
} from 'lucide-react';

// Динамический импорт RangeSliderWithCharts для оптимизации загрузки
const RangeSliderWithCharts = dynamic(
  () => import('@/app/components/RangeSliderWithCharts'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[200px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
      </div>
    )
  }
);

interface User {
  id: string;
  fullName: string;
  email: string;
  avatar: string | null;
}

interface CategoryTranslation {
  locale: 'ru' | 'kg';
  name: string;
}

interface Category {
  id: string;
  image: string | null;
  translations: CategoryTranslation[];
  _count: {
    products: number;
  };
}

interface ProductTranslation {
  locale: 'ru' | 'kg';
  name: string;
  description: string | null;
}

interface ProductImage {
  imageUrl: string;
}

interface Product {
  id: string;
  sku: string;
  price: number;
  brand: string | null;
  translations: ProductTranslation[];
  images: ProductImage[];
  category: {
    translations: CategoryTranslation[];
  };
  averageRating: number;
  totalSold: number;
  _count: {
    reviews: number;
  };
}

interface CatalogClientProps {
  user: User;
}

export default function CatalogClient({ user }: CatalogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 15000]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [tempCategory, setTempCategory] = useState<string>(categoryParam || 'all');
  const [tempSortBy, setTempSortBy] = useState<string>('newest');
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([0, 15000]);
  const [tempRating, setTempRating] = useState<number | null>(null);
  const [maxPrice] = useState<number>(15000); // Фиксированная максимальная цена
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [addingToCart, setAddingToCart] = useState<Set<string>>(new Set());
  const [cartCount, setCartCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  // Очистка overflow при размонтировании компонента
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchCartCount();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy]);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      setTempCategory(categoryParam);
    }
  }, [categoryParam]);

  // Блокировка скролла страницы при открытии модального окна
  useEffect(() => {
    if (showFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Очистка при размонтировании компонента
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showFilters]);

  // Открытие модального окна фильтров
  const openFilters = () => {
    setTempCategory(selectedCategory);
    setTempSortBy(sortBy);
    setTempPriceRange(priceRange);
    setTempRating(selectedRating);
    setShowFilters(true);
  };

  // Применение фильтров
  const applyFilters = () => {
    setSelectedCategory(tempCategory);
    setSortBy(tempSortBy);
    setPriceRange(tempPriceRange);
    setSelectedRating(tempRating);
    setShowFilters(false);
  };

  // Сброс фильтров
  const resetFilters = () => {
    setTempCategory('all');
    setTempSortBy('newest');
    setTempPriceRange([0, 15000]);
    setTempRating(null);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/user/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedCategory !== 'all') {
        params.append('categoryId', selectedCategory);
      }
      
      params.append('limit', '100');

      const res = await fetch(`/api/user/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || data); // Поддержка нового формата API
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const addToCart = async (productId: string) => {
    setAddingToCart((prev) => new Set(prev).add(productId));

    try {
      const response = await fetch('/api/user/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (response.ok) {
        await fetchCartCount();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const getCategoryName = (category?: Category | { translations: CategoryTranslation[] }) => {
    if (!category || !category.translations) return 'Без названия';
    return category.translations.find((t) => t.locale === 'ru')?.name || 'Без названия';
  };

  const getProductName = (product: Product) => {
    return product.translations.find((t) => t.locale === 'ru')?.name || 'Без названия';
  };

  const getProductDescription = (product: Product) => {
    return product.translations.find((t) => t.locale === 'ru')?.description || '';
  };

  // Фильтрация и сортировка товаров
  const filteredProducts = products
    .filter((product) => {
      // Поиск
      if (searchQuery) {
        const name = getProductName(product).toLowerCase();
        const description = getProductDescription(product).toLowerCase();
        const brand = product.brand?.toLowerCase() || '';
        const sku = product.sku.toLowerCase();
        const query = searchQuery.toLowerCase();
        
        if (!name.includes(query) && !description.includes(query) && !brand.includes(query) && !sku.includes(query)) {
          return false;
        }
      }

      // Ценовой диапазон
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      // Рейтинг (пока заглушка, в будущем будет реальный рейтинг)
      if (selectedRating !== null) {
        // TODO: Добавить реальный рейтинг из БД
        const productRating = 4.5; // Заглушка
        if (productRating < selectedRating) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name':
          return getProductName(a).localeCompare(getProductName(b));
        case 'popular':
          return b._count.reviews - a._count.reviews;
        default: // newest
          return 0;
      }
    });

  // Пагинация
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Сброс на первую страницу при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, sortBy, priceRange, selectedRating, searchQuery]);

  const menuItems = [
    { title: 'Главная', icon: Home, href: '/home', active: false },
    { title: 'Каталог', icon: Grid, href: '/catalog', active: true },
    { title: 'Заказы', icon: Package, href: '/orders', active: false },
    { title: 'Корзина', icon: ShoppingCart, href: '/cart', active: false },
    { title: 'AI Чат', icon: MessageCircle, href: '/ai-chat', active: false },
    { title: 'Профиль', icon: User, href: '/profile', active: false },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const sortOptions = [
    { value: 'popular', label: 'Популярные' },
    { value: 'newest', label: 'Сначала новые' },
    { value: 'price-desc', label: 'Сначала дорогие' },
    { value: 'price-asc', label: 'Сначала дешевые' },
  ];

  const ratingOptions = [
    { value: null, label: 'Все' },
    { value: 5, label: '5' },
    { value: 4, label: '4' },
    { value: 3, label: '3' },
    { value: 2, label: '2' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="px-8 py-2.5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 w-72">
              <img 
                src="/logonur.png" 
                alt="Nur-Kitep Logo" 
                className="w-9 h-9 rounded-xl object-cover"
              />
              <div>
                <h1 className="text-base font-bold text-gray-900">
                  Nur-Kitep
                </h1>
                <p className="text-[10px] text-gray-500">Книги и канцелярия</p>
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4 flex-1 max-w-xl mx-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск товаров..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-sm text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            {/* User & Notifications */}
            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-600 hover:text-gray-900">
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-violet-500 rounded-full"></span>
              </button>

              <button 
                onClick={() => router.push('/cart')}
                className="relative p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-600 hover:text-gray-900"
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              <button 
                onClick={() => router.push('/profile')}
                className="flex items-center gap-2.5 hover:bg-gray-50 rounded-xl transition-colors px-2.5 py-1.5"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
                  {user.fullName.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
                  <p className="text-[10px] text-gray-500">{user.email}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-[57px]">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} px-4 pt-4 flex flex-col transition-all duration-300 sticky top-[57px] self-start`}>
          {/* Main Navigation Card */}
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-200">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} mb-4 px-2`}>
              {!sidebarCollapsed && <span className="text-sm font-semibold text-gray-500">Навигация</span>}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-gray-50 rounded-lg transition-all text-gray-500 hover:text-gray-900"
                title={sidebarCollapsed ? 'Развернуть' : 'Свернуть'}
              >
                {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
            </div>
            
            <nav className="space-y-1">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    console.log('Navigating to:', item.href);
                    router.push(item.href);
                  }}
                  className={`w-full flex items-center justify-center ${sidebarCollapsed ? '' : 'justify-start gap-3 px-3'} py-2.5 rounded-xl transition-all ${
                    item.active 
                      ? 'bg-violet-500/15 text-violet-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={sidebarCollapsed ? item.title : ''}
                >
                  <item.icon size={18} className="flex-shrink-0" />
                  {!sidebarCollapsed && <span className="text-sm font-medium">{item.title}</span>}
                </button>
              ))}
            </nav>
          </div>

          {/* Quick Actions Card */}
          {!sidebarCollapsed && (
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4 px-2">
                <span className="text-sm font-semibold text-gray-500">Быстрые действия</span>
              </div>
              
              <div className="space-y-1">
                <button
                  onClick={() => router.push('/catalog')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
                >
                  <Grid size={18} className="flex-shrink-0" />
                  <span className="text-sm font-medium">Каталог</span>
                </button>
                <button
                  onClick={() => router.push('/orders')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
                >
                  <Package size={18} className="flex-shrink-0" />
                  <span className="text-sm font-medium">Мои заказы</span>
                </button>
              </div>
            </div>
          )}

          {/* Categories Card */}
          {!sidebarCollapsed && (
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4 px-2">
                <span className="text-sm font-semibold text-gray-500">Категории</span>
              </div>
              
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-violet-500/15 text-violet-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="text-sm font-medium">Все товары</span>
                  <span className="text-xs font-bold">{products.length}</span>
                </button>
                
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      selectedCategory === category.id
                        ? 'bg-violet-500/15 text-violet-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-sm font-medium">{getCategoryName(category)}</span>
                    <span className="text-xs font-bold">{category._count.products}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Logout Button Card */}
          <div className="mt-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <button
                onClick={handleLogout}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-center gap-2'} px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-xl font-medium text-sm transition-all`}
                title={sidebarCollapsed ? 'Выйти' : ''}
              >
                <LogOut size={16} />
                {!sidebarCollapsed && <span>Выйти</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <main className="p-8">
            {/* Page Header with Search and Filters */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-1">
                {/* Title and Subtitle */}
                <div className="flex-shrink-0">
                  <h1 className="text-3xl font-extrabold text-gray-900">
                    Каталог
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedCategory === 'all' 
                      ? `Найдено ${filteredProducts.length} товаров`
                      : `${getCategoryName(categories.find(c => c.id === selectedCategory))} — ${filteredProducts.length} товаров`
                    }
                  </p>
                </div>

                {/* Spacer */}
                <div className="w-32 flex-shrink-0"></div>

                {/* Search - занимает всё доступное пространство */}
                <div className="relative flex-1 max-w-xl">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Поиск товаров..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-sm text-gray-900 placeholder-gray-400"
                  />
                </div>

                {/* Filters Button */}
                <button
                  onClick={openFilters}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-violet-300 hover:bg-violet-50/50 transition-all text-gray-900 font-semibold text-sm flex-shrink-0"
                >
                  <SlidersHorizontal size={18} />
                  <span>Фильтры</span>
                </button>
              </div>
            </div>

            {/* Filter Modal */}
            {showFilters && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                {/* Backdrop */}
                <div 
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={() => setShowFilters(false)}
                />
                
                {/* Modal */}
                <div className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
                  {/* Handle (mobile) */}
                  <div className="sm:hidden flex justify-center pt-3 pb-2 sticky top-0 bg-white z-10">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                  </div>

                  <div className="p-4 sm:p-5">
                    {/* Header with Close Button */}
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-bold text-gray-900">
                        Сортировка и фильтры
                      </h2>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Categories */}
                    <div className="mb-3">
                      <h3 className="text-xs font-bold text-gray-900 mb-1.5">Категории</h3>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => setTempCategory('all')}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            tempCategory === 'all'
                              ? 'bg-violet-600 text-white'
                              : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-violet-300'
                          }`}
                        >
                          Все
                        </button>
                        {categories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => setTempCategory(category.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              tempCategory === category.id
                                ? 'bg-violet-600 text-white'
                                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-violet-300'
                            }`}
                          >
                            {getCategoryName(category)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="mb-3">
                      <h3 className="text-xs font-bold text-gray-900 mb-1.5">Цена</h3>
                      <RangeSliderWithCharts
                        min={0}
                        max={maxPrice}
                        start={tempPriceRange}
                        onChange={(values) => setTempPriceRange(values)}
                      />
                    </div>

                    {/* Sort By */}
                    <div className="mb-3">
                      <h3 className="text-xs font-bold text-gray-900 mb-1.5">Сортировка</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {sortOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setTempSortBy(option.value)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              tempSortBy === option.value
                                ? 'bg-violet-600 text-white'
                                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-violet-300'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="mb-4">
                      <h3 className="text-xs font-bold text-gray-900 mb-1.5">Рейтинг</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {ratingOptions.map((option) => (
                          <button
                            key={option.value || 'all'}
                            onClick={() => setTempRating(option.value)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              tempRating === option.value
                                ? 'bg-violet-600 text-white'
                                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-violet-300'
                            }`}
                          >
                            {option.value && <Star size={12} className="fill-current" />}
                            <span>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 sticky bottom-0 bg-white pt-2">
                      <button
                        onClick={resetFilters}
                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-900 rounded-full text-sm font-bold hover:bg-gray-200 transition-all"
                      >
                        Сбросить
                      </button>
                      <button
                        onClick={applyFilters}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-full text-sm font-bold hover:shadow-lg hover:scale-105 transition-all"
                      >
                        Применить
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl overflow-hidden animate-pulse border border-gray-200">
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-5 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="flex items-center justify-between pt-1">
                        <div className="h-4 bg-gray-200 rounded w-16" />
                        <div className="h-4 bg-gray-200 rounded w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Товары не найдены
                </h3>
                <p className="text-gray-600 mb-6">
                  Попробуйте изменить параметры поиска или фильтры
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setPriceRange([0, 10000]);
                  }}
                  className="px-6 py-3 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-all font-medium"
                >
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedProducts.map((product) => {
                  const mainImage = product.images[0];
                  return (
                    <div
                      key={product.id}
                      onClick={() => router.push(`/product/${product.id}`)}
                      className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all border border-gray-200 cursor-pointer"
                    >
                      {/* Product Image */}
                      <div className="relative aspect-square bg-white overflow-hidden p-4">
                        {mainImage ? (
                          <img
                            src={mainImage.imageUrl}
                            alt={getProductName(product)}
                            className="w-full h-full object-contain rounded-xl"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center rounded-xl">
                            <Package className="w-24 h-24 text-gray-300" />
                          </div>
                        )}
                        
                        {/* Wishlist Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Add to wishlist
                          }}
                          className="absolute top-6 right-6 p-2.5 bg-white rounded-full hover:bg-gray-50 transition-all shadow-md"
                        >
                          <Heart className="w-5 h-5 text-gray-700" />
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="p-5 space-y-3">
                        <h3 className="text-base font-bold text-gray-900 line-clamp-2 min-h-[3rem]">
                          {getProductName(product)}
                        </h3>

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
                                style={{ width: `${(product.averageRating / 5) * 100}%` }}
                              >
                                <Star className="w-4 h-4 fill-violet-600 text-violet-600" />
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {product.averageRating > 0 ? product.averageRating.toFixed(1) : '0'}
                            </span>
                          </div>

                          {/* Price */}
                          <span className="text-base font-bold text-gray-900">
                            {product.price}с
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => {
                        setCurrentPage((prev) => Math.max(1, prev - 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium text-gray-700"
                    >
                      Назад
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-2">
                      {/* First Page */}
                      {currentPage > 3 && (
                        <>
                          <button
                            onClick={() => {
                              setCurrentPage(1);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium text-gray-700"
                          >
                            1
                          </button>
                          {currentPage > 4 && (
                            <span className="text-gray-400">...</span>
                          )}
                        </>
                      )}

                      {/* Current Page Range */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          return (
                            page === currentPage ||
                            page === currentPage - 1 ||
                            page === currentPage + 1 ||
                            (currentPage <= 2 && page <= 3) ||
                            (currentPage >= totalPages - 1 && page >= totalPages - 2)
                          );
                        })
                        .map((page) => (
                          <button
                            key={page}
                            onClick={() => {
                              setCurrentPage(page);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all text-sm font-medium ${
                              currentPage === page
                                ? 'bg-violet-600 text-white'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}

                      {/* Last Page */}
                      {currentPage < totalPages - 2 && (
                        <>
                          {currentPage < totalPages - 3 && (
                            <span className="text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => {
                              setCurrentPage(totalPages);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium text-gray-700"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => {
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium text-gray-700"
                    >
                      Вперед
                    </button>
                  </div>

                  {/* Page Info */}
                  <p className="text-sm text-gray-600">
                    Страница {currentPage} из {totalPages} · Показано {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} из {filteredProducts.length} товаров
                  </p>
                </div>
              )}
            </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
