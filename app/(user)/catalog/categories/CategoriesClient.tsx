'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home,
  Grid,
  ShoppingCart,
  Package,
  MessageCircle,
  User,
  ChevronRight,
  ChevronLeft,
  LogOut,
  BookOpen,
  Pen,
  Palette,
  Briefcase,
  GraduationCap,
  Scissors,
  ArrowLeft,
} from 'lucide-react';
import UserHeader from '@/app/components/UserHeader';
import { useTranslation } from '@/app/i18n/client';
import { useChat } from '@/app/(user)/ChatContext';

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

interface CategoriesClientProps {
  user: User;
}

export default function CategoriesClient({ user }: CategoriesClientProps) {
  const router = useRouter();
  const { t } = useTranslation('user');
  const { openChat, setSidebarCollapsed: syncSidebarToContext } = useChat();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => { syncSidebarToContext(sidebarCollapsed); }, [sidebarCollapsed, syncSidebarToContext]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchCategories();
    fetchCartCount();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
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

  const getCategoryName = (category: Category) => {
    return category.translations.find((t) => t.locale === 'ru')?.name || 'Без названия';
  };

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('книг') || name.includes('китеп')) return BookOpen;
    if (name.includes('канцеляр') || name.includes('канцтовар')) return Pen;
    if (name.includes('творчест') || name.includes('искусств')) return Palette;
    if (name.includes('офис') || name.includes('бизнес')) return Briefcase;
    if (name.includes('школ') || name.includes('учеб')) return GraduationCap;
    if (name.includes('ножниц') || name.includes('инструмент')) return Scissors;
    return Grid;
  };

  const filteredCategories = categories.filter((category) => {
    const name = getCategoryName(category).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const menuItems = [
    { title: t('nav.home'), icon: Home, href: '/home', active: false },
    { title: t('nav.catalog'), icon: Grid, href: '/catalog', active: true },
    { title: t('nav.orders'), icon: Package, href: '/orders', active: false },
    { title: t('nav.cart'), icon: ShoppingCart, href: '/cart', active: false },
    { title: t('nav.aiChat'), icon: MessageCircle, href: '/ai-chat', active: false, onClick: openChat },
    { title: t('nav.profile'), icon: User, href: '/profile', active: false },
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
      <UserHeader
        user={user}
        cartCount={cartCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex pt-[57px]">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} px-4 pt-4 flex flex-col transition-all duration-300 sticky top-[57px] self-start`}>
          {/* Main Navigation Card */}
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-200">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} mb-4 px-2`}>
              {!sidebarCollapsed && <span className="text-sm font-semibold text-gray-500">{t('sidebar.navigation')}</span>}
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
                  onClick={() => item.onClick ? item.onClick() : router.push(item.href)}
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

          {/* Logout Button Card */}
          <div className="mt-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <button
                onClick={handleLogout}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-center gap-2'} px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-xl font-medium text-sm transition-all`}
                title={sidebarCollapsed ? t('sidebar.logout') : ''}
              >
                <LogOut size={16} />
                {!sidebarCollapsed && <span>{t('sidebar.logout')}</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <main className="p-8">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => router.push('/home')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 font-medium"
              >
                <ArrowLeft size={20} />
                Назад на главную
              </button>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                Все категории
              </h1>
              <p className="text-gray-600">
                Выберите категорию для просмотра товаров
              </p>
            </div>

            {/* Categories Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                    <div className="w-16 h-16 bg-gray-200 rounded-xl mb-4 mx-auto" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
                  </div>
                ))}
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-16">
                <Grid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Категории не найдены
                </h3>
                <p className="text-gray-600">
                  Попробуйте изменить поисковый запрос
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredCategories.map((category) => {
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
          </main>
        </div>
      </div>
    </div>
  );
}
