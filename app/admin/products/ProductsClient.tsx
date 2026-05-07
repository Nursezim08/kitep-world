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
  Image as ImageIcon,
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
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>(categoryIdParam || 'all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

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
    { title: 'Заказы', icon: ShoppingCart, active: false, href: '#' },
    { title: 'Филиалы', icon: MapPin, active: false, href: '/admin/branches' },
    { title: 'Менеджеры', icon: Users, active: false, href: '/admin/managers' },
    { title: 'Отчеты', icon: FileText, active: false, href: '#' },
    { title: 'Настройки', icon: Settings, active: false, href: '/admin/settings' },
  ];

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [categoryFilter]);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, products, categoryFilter, statusFilter]);

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
      
      if (categoryFilter !== 'all') {
        params.append('categoryId', categoryFilter);
      }

      const response = await fetch(`/api/admin/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else if (response.status === 401) {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Фильтр по поиску
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((product) => {
        const ruName = product.translations.find((t) => t.locale === 'ru')?.name || '';
        const kgName = product.translations.find((t) => t.locale === 'kg')?.name || '';
        const sku = product.sku.toLowerCase();
        const brand = (product.brand || '').toLowerCase();
        return ruName.toLowerCase().includes(query) || 
               kgName.toLowerCase().includes(query) ||
               sku.includes(query) ||
               brand.includes(query);
      });
    }

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter((product) => product.status === statusFilter);
    }

    setFilteredProducts(filtered);
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
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (categoryFilter !== 'all') count++;
    if (statusFilter !== 'all') count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-[#151b26]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#252d3d] border-b border-gray-800/50">
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

              <div className="flex items-center gap-3 pl-3 border-l border-gray-700">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                  {user.fullName.charAt(0)}
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-semibold text-white">{user.fullName}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-[73px]">
        {/* Sidebar */}
        <aside className="w-72 p-4 pb-4 flex flex-col sticky top-[73px] h-fit z-40">
          {/* Main Navigation Card */}
          <div className="bg-[#252d3d] rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-sm font-semibold text-gray-400">Навигация</span>
            </div>
            
            <nav className="space-y-1">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => item.href !== '#' && router.push(item.href)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    item.active 
                      ? 'bg-violet-500/15 text-violet-400' 
                      : 'text-gray-400 hover:bg-[#2a3347] hover:text-white'
                  }`}
                >
                  <item.icon size={18} className="flex-shrink-0" />
                  <span className="text-sm font-medium">{item.title}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-[#252d3d] rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-4 px-2">
              <span className="text-sm font-semibold text-gray-400">Быстрые действия</span>
            </div>
            
            <div className="space-y-1">
              <button
                onClick={() => router.push('/admin/branches')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-[#2a3347] hover:text-white transition-all"
              >
                <MapPin size={18} className="flex-shrink-0" />
                <span className="text-sm font-medium">Филиалы</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-[#2a3347] hover:text-white transition-all">
                <FileText size={18} className="flex-shrink-0" />
                <span className="text-sm font-medium">Отчеты</span>
              </button>
            </div>
          </div>

          {/* Logout Button Card */}
          <div className="mt-auto">
            <div className="bg-[#252d3d] rounded-2xl p-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium text-sm transition-all"
              >
                <LogOut size={16} />
                <span>Выйти</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <main className="p-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-white mb-2">
                Товары
              </h2>
              <p className="text-gray-400 font-semibold">
                Управление товарами и их характеристиками
              </p>
            </div>

            {/* Info block when filters are active */}
            {(categoryFilter !== 'all' || statusFilter !== 'all') && (
              <div className="mb-6 bg-gradient-to-r from-violet-600/10 to-purple-600/10 border border-violet-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-violet-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Filter className="w-5 h-5 text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-2">
                      Активные фильтры ({getActiveFiltersCount()})
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {categoryFilter !== 'all' && (
                        <span className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-lg text-sm">
                          {getCategoryName(categories.find(c => c.id === categoryFilter))}
                        </span>
                      )}
                      {statusFilter !== 'all' && (
                        <span className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-lg text-sm">
                          {statusFilter === 'active' ? 'Активные' : 'Неактивные'}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">
                      Отображаются только товары, соответствующие выбранным критериям
                    </p>
                  </div>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Сбросить
                  </button>
                </div>
              </div>
            )}

            {/* Search, Filter and Add */}
            <div className="mb-6">
              {/* Top Row: Search and Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Поиск товаров..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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

                {/* Add Button */}
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 whitespace-nowrap"
                >
                  <Plus className="w-5 h-5" />
                  <span>Добавить товар</span>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Категория
                      </label>
                      <CustomSelect
                        value={categoryFilter}
                        onChange={(value) => setCategoryFilter(value)}
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
                        onChange={(value) => setStatusFilter(value)}
                        options={[
                          { value: 'all', label: 'Все статусы' },
                          { value: 'active', label: 'Активные' },
                          { value: 'inactive', label: 'Неактивные' },
                        ]}
                      />
                    </div>
                  </div>

                  {/* Active Filters Summary */}
                  {getActiveFiltersCount() > 0 && (
                    <div className="pt-4 border-t border-gray-700/50">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-gray-400">Активные фильтры:</span>
                        {categoryFilter !== 'all' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-violet-500/15 text-violet-400 rounded-lg text-sm">
                            {getCategoryName(categories.find(c => c.id === categoryFilter))}
                            <button
                              onClick={() => setCategoryFilter('all')}
                              className="hover:bg-violet-500/20 rounded p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                        {statusFilter !== 'all' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-violet-500/15 text-violet-400 rounded-lg text-sm">
                            {statusFilter === 'active' ? 'Активные' : 'Неактивные'}
                            <button
                              onClick={() => setStatusFilter('all')}
                              className="hover:bg-violet-500/20 rounded p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
                <p className="mt-4 text-gray-400">Загрузка товаров...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => {
                  const mainImage = product.images.find(img => img.status === 'active');
                  return (
                    <div
                      key={product.id}
                      onClick={() => router.push(`/admin/products/${product.id}`)}
                      className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden transition-all hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/20 cursor-pointer"
                    >
                      {/* Image */}
                      <div className="aspect-square bg-gray-700 overflow-hidden relative group">
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
                        
                        {/* Status Badge */}
                        <div className="absolute top-2 right-2 z-10">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            product.status === 'active' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {product.status === 'active' ? 'Активен' : 'Неактивен'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        {/* Info */}
                        <div className="mb-3">
                          <h3 className="text-white font-medium mb-1 truncate">
                            {getProductName(product, 'ru')}
                          </h3>
                          <p className="text-gray-400 text-sm truncate">
                            {getProductName(product, 'kg')}
                          </p>
                        </div>

                        {/* Price & Category */}
                        <div className="mb-3">
                          <p className="text-violet-400 font-bold text-lg">
                            {product.price.toLocaleString('ru-RU')} сом
                          </p>
                          <p className="text-gray-500 text-xs">
                            {getCategoryName(product.category, 'ru')}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleEdit(product, e)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors text-sm font-medium"
                          >
                            <Edit2 className="w-4 h-4" />
                            Изменить
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(product, e)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

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
