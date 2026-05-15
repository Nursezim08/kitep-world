'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Bell,
  Heart,
  TrendingUp,
  ChevronLeft,
  LogOut,
  BookOpen,
  Pen,
  Palette,
  Briefcase,
  GraduationCap,
  Scissors,
} from 'lucide-react';

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
  translations: ProductTranslation[];
  images: ProductImage[];
  averageRating: number;
  totalSold: number;
  _count: {
    reviews: number;
  };
}

interface Banner {
  id: string;
  title: string;
  desktopImage: string;
  mobileImage: string;
  url: string | null;
}

interface HomeClientProps {
  user: User;
}

export default function HomeClient({ user }: HomeClientProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [addingToCart, setAddingToCart] = useState<Set<string>>(new Set());
  const [cartCount, setCartCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Определяем тип устройства
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchData();
    fetchCartCount();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Загружаем категории
      const categoriesRes = await fetch('/api/user/categories');
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }

      // Загружаем популярные товары
      const productsRes = await fetch('/api/user/products?popular=true&limit=8');
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      }

      // Загружаем баннеры
      const bannersRes = await fetch('/api/user/banners');
      if (bannersRes.ok) {
        const bannersData = await bannersRes.json();
        setBanners(bannersData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
        // Можно добавить toast уведомление
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

  const getCategoryName = (category: Category) => {
    return category.translations.find((t) => t.locale === 'ru')?.name || 'Без названия';
  };

  const getProductName = (product: Product) => {
    return product.translations.find((t) => t.locale === 'ru')?.name || 'Без названия';
  };

  // Функция для получения иконки категории по названию
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('книг') || name.includes('китеп')) return BookOpen;
    if (name.includes('канцеляр') || name.includes('канцтовар')) return Pen;
    if (name.includes('творчест') || name.includes('искусств')) return Palette;
    if (name.includes('офис') || name.includes('бизнес')) return Briefcase;
    if (name.includes('школ') || name.includes('учеб')) return GraduationCap;
    if (name.includes('ножниц') || name.includes('инструмент')) return Scissors;
    return Grid; // По умолчанию
  };

  const menuItems = [
    { title: 'Главная', icon: Home, href: '/home', active: true },
    { title: 'Каталог', icon: Grid, href: '/catalog', active: false },
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
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-sm text-gray-900 placeholder-gray-400"
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
                  onClick={() => item.href !== '#' && router.push(item.href)}
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
            {/* Banner */}
            {banners.length > 0 ? (
              <div className="mb-8 relative rounded-2xl overflow-hidden shadow-xl">
                <div className="relative h-64 sm:h-80 lg:h-96">
                  {banners.map((banner, index) => (
                    <div
                      key={banner.id}
                      className={`absolute inset-0 transition-opacity duration-1000 ${
                        index === currentBanner ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <img
                        src={isMobile ? banner.mobileImage : banner.desktopImage}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-2">
                          {banner.title}
                        </h2>
                        {banner.url && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(banner.url!);
                            }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-violet-600 rounded-xl font-bold hover:shadow-lg transition-all"
                          >
                            Подробнее
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Banner Indicators */}
                {banners.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {banners.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentBanner(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentBanner
                            ? 'bg-white w-8'
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Fallback banner если нет баннеров в БД
              <div className="mb-8 relative rounded-2xl overflow-hidden shadow-xl">
                <div className="relative h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-violet-600 via-violet-500 to-indigo-600">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
                  
                  <div className="relative h-full flex items-center">
                    <div className="container mx-auto px-6 sm:px-8">
                      <div className="max-w-2xl">
                        <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-bold mb-4">
                          🎉 Новинки сезона
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
                          Добро пожаловать в<br />Nur-Kitep!
                        </h1>
                        <p className="text-lg sm:text-xl text-white/90 mb-6 font-medium">
                          Книги, канцелярия и товары для творчества с доставкой по всему Кыргызстану
                        </p>
                        <button
                          onClick={() => router.push('/catalog')}
                          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-violet-600 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all"
                        >
                          Перейти в каталог
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-10 right-32 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl"></div>
                </div>
              </div>
            )}

            {/* Categories */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
                    Категории
                  </h2>
                  <p className="text-gray-600">
                    Выберите категорию для просмотра товаров
                  </p>
                </div>
                <button
                  onClick={() => router.push('/catalog/categories')}
                  className="flex items-center gap-2 text-violet-600 hover:text-violet-700 font-semibold"
                >
                  Все категории
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                    <div className="w-16 h-16 bg-gray-200 rounded-xl mb-4 mx-auto" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {categories.slice(0, 6).map((category) => {
                  const categoryName = getCategoryName(category);
                  const CategoryIcon = getCategoryIcon(categoryName);
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => router.push(`/catalog?category=${category.id}`)}
                      className="group bg-white rounded-2xl p-6 hover:shadow-xl transition-all border border-gray-100 hover:border-violet-200"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={categoryName}
                            className="w-10 h-10 object-contain"
                          />
                        ) : (
                          <CategoryIcon className="w-8 h-8 text-violet-600" />
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 text-center mb-1">
                        {categoryName}
                      </h3>
                      <p className="text-xs text-gray-500 text-center">
                        {category._count.products} товаров
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
            </section>

            {/* Popular Products */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-6 h-6 text-violet-600" />
                    <h2 className="text-2xl font-extrabold text-gray-900">
                      Популярные товары
                    </h2>
                  </div>
                  <p className="text-gray-600">
                    Самые продаваемые товары за последний месяц
                  </p>
                </div>
                <button
                  onClick={() => router.push('/catalog')}
                  className="flex items-center gap-2 text-violet-600 hover:text-violet-700 font-semibold"
                >
                  Все товары
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                      <div className="aspect-square bg-gray-200" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-10 bg-gray-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => {
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
            )}
          </section>
          </main>
        </div>
      </div>
    </div>
  );
}
