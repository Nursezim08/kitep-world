'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  Users,
  ShoppingCart,
  Settings,
  FileText,
  MapPin,
  LogOut,
  Bell,
  LayoutDashboard,
  FolderTree,
  Filter,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import DeleteProductModal from './DeleteProductModal';
import CustomSelect from '@/app/components/CustomSelect';

interface ProductTranslation {
  id: string;
  locale: 'ru' | 'kg';
  name: string;
  description: string | null;
}

interface ProductImage {
  id: string;
  imageUrl: string;
  status: string;
}

interface Category {
  id: string;
  translations: {
    locale: string;
    name: string;
  }[];
}

interface Product {
  id: string;
  sku: string;
  categoryId: string;
  brand: string | null;
  price: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  translations: ProductTranslation[];
  images: ProductImage[];
  category: Category;
  _count: {
    reviews: number;
  };
}

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface ProductsClientProps {
  user: User;
}

export default function ProductsClient({ user }: ProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryIdParam = searchParams.get('categoryId');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>(categoryIdParam || 'all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [brands, setBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const itemsPerPage = 100;

  const isAnyModalOpen = isAddModalOpen || isEditModalOpen || isDeleteModalOpen;

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { title: 'Панель управления', icon: LayoutDashboard, active: false, href: '/admin/dashboard' },
    { title: 'Пользователи', icon: Users, active: false, href: '/admin/users' },
    { title: 'Категории', icon: FolderTree, active: false, href: '/admin/categories' },
    { title: 'Товары', icon: Package, active: true, href: '/admin/products' },
    { title: 'Баннеры', icon: ImageIcon, active: false, href: '/admin/banners' },
    { title: 'Заказы', icon: ShoppingCart, active: false, href: '#' },
    { title: 'Филиалы', icon: MapPin, active: false, href: '/admin/branches' },
    { title: 'Менеджеры', icon: Users, active: false, href: '/admin/managers' },
    { title: 'Отчеты', icon: FileText, active: false, href: '#' },
    { title: 'Настройки', icon: Settings, active: false, href: '/admin/settings' },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  // Debounce для поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, statusFilter, brandFilter, sortBy, sortOrder, searchQuery, currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories?parentId=null');
      if (response.ok) {
        const data = await response.json();
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
      
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      
      if (categoryFilter !== 'all') {
        params.append('categoryId', categoryFilter);
      }
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      if (brandFilter !== 'all') {
        params.append('brand', brandFilter);
      }
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await fetch(`/api/admin/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
        setTotalPages(data.pagination.pages);
        setTotalProducts(data.pagination.total);
        
        // Извлекаем уникальные бренды из текущих товаров
        const uniqueBrands = [...new Set(data.products.map((p: Product) => p.brand).filter(Boolean))];
        setBrands(uniqueBrands as string[]);
      } else if (response.status === 401) {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const productName = getProductName(product, 'ru');
    setProductToDelete({ id: product.id, name: productName });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(`/api/admin/products/${productToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
        fetchProducts();
      } else {
        const data = await response.json();
        alert(data.error || 'Не удалось удалить товар');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Произошла ошибка при удалении товара');
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const getProductName = (product: Product, locale: 'ru' | 'kg' = 'ru') => {
    return product.translations.find((t) => t.locale === locale)?.name || 'Без названия';
  };

  const getCategoryName = (category: Category | undefined, locale: 'ru' | 'kg' = 'ru') => {
    if (!category) return 'Без категории';
    return category.translations.find((t) => t.locale === locale)?.name || 'Без категории';
  };

  const resetFilters = () => {
    setCategoryFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
    setSearchInput('');
    setBrandFilter('all');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (categoryFilter !== 'all') count++;
    if (statusFilter !== 'all') count++;
    if (brandFilter !== 'all') count++;
    if (sortBy !== 'createdAt') count++;
    return count;
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="h-screen flex flex-col bg-[#151b26] overflow-hidden" style={{ position: 'relative' }}>
      {/* Header */}
      <header className="flex-shrink-0 bg-[#252d3d] border-b border-gray-800/50">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 w-72">
              <img 
                src="/logonur.png" 
                alt="Nur-Kitep Logo" 
                className="w-10 h-10 rounded-xl object-cover"
              />
              <div>
                <h1 className="text-lg font-bold text-white">
                  Nur-Kitep
                </h1>
                <p className="text-xs text-gray-400">Панель управления</p>
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4 flex-1 max-w-xl mx-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Поиск..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1e2533] border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-sm text-white placeholder-gray-500"
                />
              </div>
            </div>

            {/* User & Notifications */}
            <div className="flex items-center gap-3">
              <button className="relative p-2.5 hover:bg-[#252d3d] rounded-xl transition-colors text-gray-400 hover:text-white">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full"></span>
              </button>

              <button 
                onClick={() => router.push('/admin/profile')}
                className="flex items-center gap-3 pl-3 hover:bg-[#2a3347] rounded-xl transition-colors px-3 py-2"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                  {user.fullName.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-white">{user.fullName}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} flex-shrink-0 bg-[#151b26] overflow-y-auto no-scrollbar transition-all duration-300`}>
          <div className="p-4 flex flex-col min-h-full">
          {/* Main Navigation Card */}
          <div className="bg-[#252d3d] rounded-2xl p-4 mb-4">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} mb-4 px-2`}>
              {!sidebarCollapsed && <span className="text-sm font-semibold text-gray-400">Навигация</span>}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-[#2a3347] rounded-lg transition-all text-gray-400 hover:text-white"
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
                      ? 'bg-violet-500/15 text-violet-400' 
                      : 'text-gray-400 hover:bg-[#2a3347] hover:text-white'
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
          <div className="mt-auto mb-2">
            <div className="bg-[#252d3d] rounded-2xl p-4">
              <button
                onClick={handleLogout}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-center gap-2'} px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium text-sm transition-all`}
                title={sidebarCollapsed ? 'Выйти' : ''}
              >
                <LogOut size={16} />
                {!sidebarCollapsed && <span>Выйти</span>}
              </button>
            </div>
          </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <main className="p-8">
            {/* Welcome Section */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-extrabold text-white mb-2">
                  Товары
                </h2>
                <p className="text-gray-400 font-semibold">
                  Управление товарами и их характеристиками
                </p>
              </div>
              
              {/* Add Button */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                <span>Добавить товар</span>
              </button>
            </div>

            {/* Search, Filter and Add */}
            <div className="mb-6">
              {/* Top Row: Search and Filter Button */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Поиск товаров..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#252d3d] border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                  />
                </div>

                {/* Filter Toggle Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all font-medium relative ${
                    showFilters
                      ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30'
                      : 'bg-[#252d3d] text-gray-400 border border-gray-700/50 hover:border-violet-500/30 hover:text-violet-400'
                  }`}
                >
                  <Filter className="w-5 h-5" />
                  <span>Фильтры</span>
                  {getActiveFiltersCount() > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="bg-[#252d3d] border border-gray-700/50 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Filter className="w-5 h-5 text-violet-400" />
                      <h3 className="text-white font-semibold">Параметры фильтрации</h3>
                    </div>
                    {getActiveFiltersCount() > 0 && (
                      <button
                        onClick={resetFilters}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all text-sm font-medium"
                      >
                        <X className="w-4 h-4" />
                        Сбросить все
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* First Row: Category, Status, Brand */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Category Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Категория
                        </label>
                        <CustomSelect
                          value={categoryFilter}
                          onChange={(value) => {
                            setCategoryFilter(value);
                            setCurrentPage(1);
                          }}
                          options={[
                            { value: 'all', label: 'Все категории' },
                            ...categories.map(cat => ({
                              value: cat.id,
                              label: getCategoryName(cat, 'ru')
                            }))
                          ]}
                        />
                      </div>

                      {/* Status Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Статус
                        </label>
                        <CustomSelect
                          value={statusFilter}
                          onChange={(value) => {
                            setStatusFilter(value);
                            setCurrentPage(1);
                          }}
                          options={[
                            { value: 'all', label: 'Все статусы' },
                            { value: 'active', label: 'Активные' },
                            { value: 'inactive', label: 'Неактивные' },
                          ]}
                        />
                      </div>

                      {/* Brand Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Бренд
                        </label>
                        <CustomSelect
                          value={brandFilter}
                          onChange={(value) => {
                            setBrandFilter(value);
                            setCurrentPage(1);
                          }}
                          options={[
                            { value: 'all', label: 'Все бренды' },
                            ...brands.map(brand => ({
                              value: brand,
                              label: brand
                            }))
                          ]}
                        />
                      </div>
                    </div>

                    {/* Sort By */}
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Сортировка
                        </label>
                        <div className="flex gap-2">
                          <div className="flex-1 overflow-y-auto">
                            <CustomSelect
                              value={sortBy}
                              onChange={(value) => setSortBy(value)}
                              options={[
                                { value: 'name', label: 'По названию' },
                                { value: 'price', label: 'По цене' },
                                { value: 'createdAt', label: 'По дате создания' },
                                { value: 'updatedAt', label: 'По дате обновления' },
                                { value: 'reviewsCount', label: 'По кол-ву отзывов' },
                              ]}
                            />
                          </div>
                          
                          {/* Sort Order Toggle Button */}
                          <button
                            type="button"
                            onClick={toggleSortOrder}
                            className="px-3 py-2 bg-[#2a3347] border-2 border-violet-500 rounded-xl text-violet-400 hover:bg-[#2f3850] transition-all flex items-center justify-center"
                            title={sortOrder === 'asc' ? 'По возрастанию (клик для убывания)' : 'По убыванию (клик для возрастания)'}
                          >
                            {sortOrder === 'asc' ? (
                              <ArrowUp className="w-4 h-4" />
                            ) : (
                              <ArrowDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
                <p className="mt-4 text-gray-400">Загрузка товаров...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
                <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">
                  {searchQuery ? 'Товары не найдены' : 'Нет товаров'}
                </p>
                {!searchQuery && (
                  <>
                    <p className="text-gray-500 text-sm mb-4">
                      Создайте первый товар для начала работы
                    </p>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors font-medium"
                    >
                      <Plus className="w-5 h-5" />
                      Создать товар
                    </button>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((product) => {
                  const mainImage = product.images.find(img => img.status === 'active');
                  return (
                    <div
                      key={product.id}
                      onClick={() => router.push(`/admin/products/${product.id}`)}
                      className="bg-gradient-to-br from-[#252d3d] to-[#1e2533] border border-gray-700/30 rounded-2xl overflow-hidden transition-all hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-500/10 cursor-pointer group backdrop-blur-sm"
                    >
                      {/* Image */}
                      <div className="aspect-square bg-[#1e2533] overflow-hidden relative">
                        {mainImage ? (
                          <img
                            src={mainImage.imageUrl}
                            alt={getProductName(product)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-16 h-16 text-gray-600" />
                          </div>
                        )}
                        
                        {/* Status Badge - Top Right */}
                        <div className="absolute top-2 right-2 z-10">
                          <div className={`px-2 py-0.5 rounded text-[9px] font-semibold ${
                            product.status === 'active' 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-500 text-white'
                          }`}>
                            {product.status === 'active' ? 'Активно' : 'Неактивно'}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3">
                        {/* Title */}
                        <div className="-mb-4">
                          <h3 className="text-white font-medium text-xs leading-tight line-clamp-2 min-h-[2rem]">
                            {getProductName(product, 'ru')}
                          </h3>
                        </div>

                        {/* Price */}
                        <div className="mb-2">
                          <p className="text-violet-400 font-bold text-base">
                            {product.price.toLocaleString('ru-RU')} <span className="text-xs font-medium text-violet-400/70">сом</span>
                          </p>
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-1">
                          {/* Category */}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 backdrop-blur-sm text-gray-300 rounded text-[10px] font-medium border border-white/10">
                            <FolderTree className="w-2.5 h-2.5" />
                            {getCategoryName(product.category, 'ru')}
                          </span>

                          {/* Brand */}
                          {product.brand && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 backdrop-blur-sm text-gray-300 rounded text-[10px] font-medium border border-white/10">
                              {product.brand}
                            </span>
                          )}

                          {/* Reviews Count */}
                          {product._count.reviews > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-500/10 backdrop-blur-sm text-violet-300 rounded text-[10px] font-medium border border-violet-500/20">
                              ⭐ {product._count.reviews}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Пагинация */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  {/* Предыдущая страница */}
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                      currentPage === 1
                        ? 'bg-[#252d3d] text-gray-600 cursor-not-allowed'
                        : 'bg-[#252d3d] text-gray-300 hover:bg-violet-500/20 hover:text-violet-400'
                    }`}
                  >
                    Назад
                  </button>

                  {/* Номера страниц */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => goToPage(page as number)}
                          className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                            currentPage === page
                              ? 'bg-violet-600 text-white'
                              : 'bg-[#252d3d] text-gray-300 hover:bg-violet-500/20 hover:text-violet-400'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ))}
                  </div>

                  {/* Следующая страница */}
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                      currentPage === totalPages
                        ? 'bg-[#252d3d] text-gray-600 cursor-not-allowed'
                        : 'bg-[#252d3d] text-gray-300 hover:bg-violet-500/20 hover:text-violet-400'
                    }`}
                  >
                    Вперед
                  </button>
                </div>
              )}

              {/* Информация о пагинации */}
              <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                <p>
                  Показано {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalProducts)} из {totalProducts} товаров
                </p>
                <p>
                  Страница {currentPage} из {totalPages}
                </p>
              </div>
            </>
            )}
          </main>
        </div>
      </div>

      {/* Blur overlay */}
      {isAnyModalOpen && (
        <div className="absolute inset-0 z-40 backdrop-blur-sm bg-black/40 pointer-events-none" />
      )}

      {/* Modals */}
      {isAddModalOpen && (
        <AddProductModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchProducts();
          }}
        />
      )}

      {isEditModalOpen && selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProduct(null);
          }}
          onSuccess={() => {
            setIsEditModalOpen(false);
            setSelectedProduct(null);
            fetchProducts();
          }}
        />
      )}

      {isDeleteModalOpen && productToDelete && (
        <DeleteProductModal
          productName={productToDelete.name}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}
