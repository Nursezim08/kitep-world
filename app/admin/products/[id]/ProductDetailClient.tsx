'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
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
  Search,
  LayoutDashboard,
  FolderTree,
  Tag,
  DollarSign,
  Box,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import EditProductModal from '../EditProductModal';
import DeleteProductModal from '../DeleteProductModal';

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

interface ProductAttribute {
  id: string;
  name: string;
  value: string;
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
  attributes: ProductAttribute[];
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

interface ProductDetailClientProps {
  user: User;
  productId: string;
}

export default function ProductDetailClient({ user, productId }: ProductDetailClientProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/products/${productId}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        } else if (response.status === 404) {
          router.push('/admin/products');
          return;
        }
        throw new Error('Failed to fetch product');
      }

      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!product) return;

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin/products');
      } else {
        const data = await response.json();
        alert(data.error || 'Не удалось удалить товар');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Произошла ошибка при удалении товара');
    }
  };

  const getProductName = (locale: 'ru' | 'kg' = 'ru') => {
    if (!product) return '';
    return product.translations.find((t) => t.locale === locale)?.name || 'Без названия';
  };

  const getProductDescription = (locale: 'ru' | 'kg' = 'ru') => {
    if (!product) return '';
    return product.translations.find((t) => t.locale === locale)?.description || '';
  };

  const getCategoryName = (locale: 'ru' | 'kg' = 'ru') => {
    if (!product) return '';
    return product.category.translations.find((t) => t.locale === locale)?.name || 'Без категории';
  };

  const nextImage = () => {
    if (!product) return;
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    if (!product) return;
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#151b26] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
          <p className="mt-4 text-gray-400">Загрузка товара...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

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

              <button 
                onClick={() => router.push('/admin/profile')}
                className="flex items-center gap-3 pl-3 hover:bg-[#2a3347] rounded-xl transition-colors px-3 py-2"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                  {user.fullName.charAt(0)}
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-semibold text-white">{user.fullName}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-[73px]">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} px-4 pt-4 flex flex-col transition-all duration-300 sticky top-[73px] self-start`}>
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

          {/* Quick Actions Card */}
          {!sidebarCollapsed && (
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
          )}

          {/* Logout Button Card */}
          <div className="mt-4">
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
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <main className="p-8">
            {/* Back Button */}
            <button
              onClick={() => router.push('/admin/products')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Назад к товарам</span>
            </button>

            {/* Product Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-3xl font-extrabold text-white mb-2">
                  {getProductName('ru')}
                </h1>
                <p className="text-gray-400 font-semibold">
                  {getProductName('kg')}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-all font-medium"
                >
                  <Edit2 className="w-5 h-5" />
                  Редактировать
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all font-medium"
                >
                  <Trash2 className="w-5 h-5" />
                  Удалить
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Images Section */}
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-square">
                  {product.images.length > 0 ? (
                    <>
                      <img
                        src={product.images[currentImageIndex].imageUrl}
                        alt={getProductName('ru')}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Navigation Arrows */}
                      {product.images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>
                        </>
                      )}

                      {/* Image Counter */}
                      <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/70 text-white rounded-lg text-sm">
                        {currentImageIndex + 1} / {product.images.length}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-24 h-24 text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-4">
                    {product.images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          currentImageIndex === index
                            ? 'border-violet-500'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <img
                          src={image.imageUrl}
                          alt={`${getProductName('ru')} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                {/* Price & Status */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Цена</p>
                      <p className="text-3xl font-bold text-violet-400">
                        {product.price.toLocaleString('ru-RU')} сом
                      </p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${
                        product.status === 'active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {product.status === 'active' ? 'Активен' : 'Неактивен'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="bg-gray-800 rounded-xl p-6 space-y-4">
                  <h3 className="text-white font-semibold text-lg mb-4">Детали товара</h3>
                  
                  <div className="flex items-center gap-3 text-gray-300">
                    <Tag className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Артикул</p>
                      <p className="font-medium">{product.sku}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-300">
                    <FolderTree className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Категория</p>
                      <p className="font-medium">{getCategoryName('ru')}</p>
                    </div>
                  </div>

                  {product.brand && (
                    <div className="flex items-center gap-3 text-gray-300">
                      <Box className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Бренд</p>
                        <p className="font-medium">{product.brand}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {(getProductDescription('ru') || getProductDescription('kg')) && (
                  <div className="bg-gray-800 rounded-xl p-6">
                    <h3 className="text-white font-semibold text-lg mb-4">Описание</h3>
                    
                    {getProductDescription('ru') && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Русский</p>
                        <p className="text-gray-300 whitespace-pre-wrap">
                          {getProductDescription('ru')}
                        </p>
                      </div>
                    )}

                    {getProductDescription('kg') && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Кыргызча</p>
                        <p className="text-gray-300 whitespace-pre-wrap">
                          {getProductDescription('kg')}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Attributes */}
                {product.attributes.length > 0 && (
                  <div className="bg-gray-800 rounded-xl p-6">
                    <h3 className="text-white font-semibold text-lg mb-4">Характеристики</h3>
                    <div className="space-y-3">
                      {product.attributes.map((attr) => (
                        <div key={attr.id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                          <span className="text-gray-400">{attr.name}</span>
                          <span className="text-white font-medium">{attr.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Modals */}
      {isEditModalOpen && (
        <EditProductModal
          product={product}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            setIsEditModalOpen(false);
            fetchProduct();
          }}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteProductModal
          productName={getProductName('ru')}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      )}
    </div>
  );
}
