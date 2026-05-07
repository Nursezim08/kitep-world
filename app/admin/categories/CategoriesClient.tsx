'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  FolderOpen,
  Package,
  ArrowLeft,
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
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import AddCategoryModal from './AddCategoryModal';
import EditCategoryModal from './EditCategoryModal';
import DeleteCategoryModal from './DeleteCategoryModal';
import CustomSelect from '@/app/components/CustomSelect';
import MultiSelectDropdown from '@/app/components/MultiSelectDropdown';

interface CategoryTranslation {
  id: string;
  locale: 'ru' | 'kg';
  name: string;
}

interface Category {
  id: string;
  parentId: string | null;
  image: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  translations: CategoryTranslation[];
  children?: Category[];
  _count: {
    children: number;
    products: number;
  };
}

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface CategoriesClientProps {
  user: User;
}

export default function CategoriesClient({ user }: CategoriesClientProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all'); // all, active, inactive
  const [hasChildrenFilter, setHasChildrenFilter] = useState<string>('all'); // all, parent, leaf
  const [showFilters, setShowFilters] = useState(false);
  const [selectedParentIds, setSelectedParentIds] = useState<string[]>([]); // Выбранные родительские категории
  const [allCategories, setAllCategories] = useState<Category[]>([]); // Все категории для фильтра
  const [sortBy, setSortBy] = useState<string>('name'); // name, createdAt, updatedAt, productsCount, childrenCount
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // asc = по возрастанию, desc = по убыванию

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
    { title: 'Категории', icon: FolderTree, active: true, href: '/admin/categories' },
    { title: 'Товары', icon: Package, active: false, href: '/admin/products' },
    { title: 'Заказы', icon: ShoppingCart, active: false, href: '#' },
    { title: 'Филиалы', icon: MapPin, active: false, href: '/admin/branches' },
    { title: 'Менеджеры', icon: Users, active: false, href: '/admin/managers' },
    { title: 'Отчеты', icon: FileText, active: false, href: '#' },
    { title: 'Настройки', icon: Settings, active: false, href: '/admin/settings' },
  ];

  useEffect(() => {
    fetchCategories();
    fetchAllCategories(); // Загружаем все категории для фильтра
  }, [selectedParentIds]); // Перезагружаем при изменении выбранных категорий

  useEffect(() => {
    filterCategories();
  }, [searchQuery, categories, statusFilter, hasChildrenFilter, selectedParentIds, sortBy, sortOrder]);

  const fetchAllCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories?parentId=null');
      if (response.ok) {
        const data = await response.json();
        setAllCategories(data);
      }
    } catch (error) {
      console.error('Error fetching all categories:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Если выбраны родительские категории, загружаем их дочерние
      if (selectedParentIds.length > 0) {
        // Загружаем дочерние категории для каждой выбранной родительской
        const childrenPromises = selectedParentIds.map(parentId =>
          fetch(`/api/admin/categories?parentId=${parentId}`).then(res => res.json())
        );
        const childrenArrays = await Promise.all(childrenPromises);
        const allChildren = childrenArrays.flat();
        setCategories(allChildren);
      } else {
        // Иначе показываем корневые категории
        params.append('parentId', 'null');
        const response = await fetch(`/api/admin/categories?${params}`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else if (response.status === 401) {
          router.push('/admin/login');
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = categories;

    // Фильтр по поиску
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((category) => {
        const ruName = category.translations.find((t) => t.locale === 'ru')?.name || '';
        const kgName = category.translations.find((t) => t.locale === 'kg')?.name || '';
        return ruName.toLowerCase().includes(query) || kgName.toLowerCase().includes(query);
      });
    }

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter((category) => category.status === statusFilter);
    }

    // Фильтр по наличию подкатегорий
    if (hasChildrenFilter === 'parent') {
      filtered = filtered.filter((category) => category._count.children > 0);
    } else if (hasChildrenFilter === 'leaf') {
      filtered = filtered.filter((category) => category._count.children === 0);
    }

    // Сортировка
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          const aName = getCategoryName(a, 'ru');
          const bName = getCategoryName(b, 'ru');
          comparison = aName.localeCompare(bName);
          break;
        
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        
        case 'productsCount':
          comparison = a._count.products - b._count.products;
          break;
        
        case 'childrenCount':
          comparison = a._count.children - b._count.children;
          break;
        
        default:
          comparison = 0;
      }

      // Применяем направление сортировки
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredCategories(filtered);
  };

  const handleCategoryClick = (category: Category) => {
    // Переход на страницу товаров с фильтром по категории
    router.push(`/admin/products?categoryId=${category.id}`);
  };

  const handleBreadcrumbClick = (index: number) => {
    // Функция больше не используется, но оставляем для совместимости
  };

  const handleEdit = (category: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (category: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    const categoryName = getCategoryName(category, 'ru');
    setCategoryToDelete({ id: category.id, name: categoryName });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      const response = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIsDeleteModalOpen(false);
        setCategoryToDelete(null);
        fetchCategories();
      } else {
        const data = await response.json();
        alert(data.error || 'Не удалось удалить категорию');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Произошла ошибка при удалении категории');
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  const getCategoryName = (category: Category, locale: 'ru' | 'kg' = 'ru') => {
    return category.translations.find((t) => t.locale === locale)?.name || 'Без названия';
  };

  const resetFilters = () => {
    setStatusFilter('all');
    setHasChildrenFilter('all');
    setSearchQuery('');
    setSelectedParentIds([]);
    setSortBy('name');
    setSortOrder('asc');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (hasChildrenFilter !== 'all') count++;
    if (selectedParentIds.length > 0) count++;
    if (sortBy !== 'name') count++;
    return count;
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
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
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-extrabold text-white mb-2">
                  Категории товаров
                </h2>
                <p className="text-gray-400 font-semibold">
                  Управление категориями и подкатегориями
                </p>
              </div>
              
              {/* Add Button */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                <span>Добавить категорию</span>
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
                    placeholder="Поиск категорий..."
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

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Parent Categories Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Родительские категории
                      </label>
                      <MultiSelectDropdown
                        options={allCategories.map(cat => ({
                          value: cat.id,
                          label: getCategoryName(cat, 'ru')
                        }))}
                        selectedValues={selectedParentIds}
                        onChange={setSelectedParentIds}
                        placeholder="Выберите категории..."
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

                    {/* Has Children Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Тип категории
                      </label>
                      <CustomSelect
                        value={hasChildrenFilter}
                        onChange={(value) => setHasChildrenFilter(value)}
                        options={[
                          { value: 'all', label: 'Все типы' },
                          { value: 'parent', label: 'Родительские' },
                          { value: 'leaf', label: 'Конечные' },
                        ]}
                      />
                    </div>

                    {/* Sort By */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Сортировка
                      </label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <CustomSelect
                            value={sortBy}
                            onChange={(value) => setSortBy(value)}
                            options={[
                              { value: 'name', label: 'По названию' },
                              { value: 'createdAt', label: 'По дате создания' },
                              { value: 'updatedAt', label: 'По дате обновления' },
                              { value: 'productsCount', label: 'По кол-ву товаров' },
                              { value: 'childrenCount', label: 'По кол-ву подкатегорий' },
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
              )}
            </div>

            {/* Categories Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-400">Загрузка категорий...</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
                <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">
                  {searchQuery ? 'Категории не найдены' : 'Нет категорий'}
                </p>
                {!searchQuery && (
                  <>
                    <p className="text-gray-500 text-sm mb-4">
                      Создайте первую категорию для начала работы
                    </p>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                      <Plus className="w-5 h-5" />
                      Создать категорию
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryClick(category)}
                    className="bg-[#252d3d] border border-gray-700/50 rounded-xl overflow-hidden transition-all cursor-pointer hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/20 group"
                  >
                    <div className="flex items-stretch h-full">
                      {/* Левая часть - Изображение */}
                      <div className="w-32 bg-[#252d3d] flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={getCategoryName(category)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-12 h-12 text-gray-600" />
                          </div>
                        )}
                      </div>

                      {/* Правая часть - Информация */}
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        {/* Название и тип категории */}
                        <div className="mb-3">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-white font-bold text-base line-clamp-2 flex-1">
                              {getCategoryName(category, 'ru')}
                            </h3>
                            
                            {/* Тип категории справа от названия */}
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold flex-shrink-0 ${
                              category._count.children > 0
                                ? 'bg-violet-500/15 text-violet-400'
                                : 'bg-blue-500/15 text-blue-400'
                            }`}>
                              <FolderOpen className="w-3 h-3" />
                              {category._count.children > 0 ? 'Родительская' : 'Дочерняя'}
                            </span>
                          </div>

                          {/* Остальные теги */}
                          <div className="flex flex-wrap gap-1.5">
                            {/* Количество товаров */}
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700/50 text-gray-300 rounded-md text-xs font-semibold">
                              <Package className="w-3 h-3" />
                              {category._count.products}
                            </span>

                            {/* Количество подкатегорий */}
                            {category._count.children > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700/50 text-gray-300 rounded-md text-xs font-semibold">
                                <FolderTree className="w-3 h-3" />
                                {category._count.children}
                              </span>
                            )}

                            {/* Статус */}
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
                              category.status === 'active'
                                ? 'bg-green-500/15 text-green-400'
                                : 'bg-gray-500/15 text-gray-400'
                            }`}>
                              {category.status === 'active' ? 'Активна' : 'Неактивна'}
                            </span>
                          </div>
                        </div>

                        {/* Кнопки действий */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => handleEdit(category, e)}
                            className="p-1.5 hover:bg-violet-500/20 text-gray-400 hover:text-violet-400 rounded-lg transition-all"
                            title="Редактировать"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(category, e)}
                            className="p-1.5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-all"
                            title="Удалить"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <AddCategoryModal
          parentId={null}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchCategories();
          }}
        />
      )}

      {isEditModalOpen && selectedCategory && (
        <EditCategoryModal
          category={selectedCategory}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCategory(null);
          }}
          onSuccess={() => {
            setIsEditModalOpen(false);
            setSelectedCategory(null);
            fetchCategories();
          }}
        />
      )}

      {isDeleteModalOpen && categoryToDelete && (
        <DeleteCategoryModal
          categoryName={categoryToDelete.name}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}
