'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FolderTree,
  Package,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  Search,
  Bell,
  ShoppingCart,
  MapPin,
  FileText,
} from 'lucide-react';
import AddBannerModal from './AddBannerModal';
import EditBannerModal from './EditBannerModal';
import DeleteBannerModal from './DeleteBannerModal';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface Banner {
  id: string;
  title: string;
  desktopImage: string;
  mobileImage: string;
  url: string | null;
  status: 'active' | 'inactive';
}

export default function BannersClient({ user }: { user: User }) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [filteredBanners, setFilteredBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Модальные окна
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

  // Загрузка баннеров
  useEffect(() => {
    fetchBanners();
  }, []);

  // Фильтрация при изменении поиска
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBanners(banners);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredBanners(
        banners.filter((banner) =>
          banner.title.toLowerCase().includes(query) ||
          (banner.url && banner.url.toLowerCase().includes(query))
        )
      );
    }
  }, [searchQuery, banners]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/banners');
      if (response.ok) {
        const data = await response.json();
        setBanners(data.banners);
        setFilteredBanners(data.banners);
      }
    } catch (error) {
      console.error('Ошибка загрузки баннеров:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const openEditModal = (banner: Banner) => {
    setSelectedBanner(banner);
    setShowEditModal(true);
  };

  const openDeleteModal = (banner: Banner) => {
    setSelectedBanner(banner);
    setShowDeleteModal(true);
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
              <button
                onClick={() => router.push('/admin/dashboard')}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start gap-3 px-3'} py-2.5 rounded-xl text-gray-400 hover:bg-[#2a3347] hover:text-white transition-all`}
                title={sidebarCollapsed ? 'Панель управления' : ''}
              >
                <LayoutDashboard size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Панель управления</span>}
              </button>
              <button
                onClick={() => router.push('/admin/users')}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start gap-3 px-3'} py-2.5 rounded-xl text-gray-400 hover:bg-[#2a3347] hover:text-white transition-all`}
                title={sidebarCollapsed ? 'Пользователи' : ''}
              >
                <Users size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Пользователи</span>}
              </button>
              <button
                onClick={() => router.push('/admin/categories')}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start gap-3 px-3'} py-2.5 rounded-xl text-gray-400 hover:bg-[#2a3347] hover:text-white transition-all`}
                title={sidebarCollapsed ? 'Категории' : ''}
              >
                <FolderTree size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Категории</span>}
              </button>
              <button
                onClick={() => router.push('/admin/products')}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start gap-3 px-3'} py-2.5 rounded-xl text-gray-400 hover:bg-[#2a3347] hover:text-white transition-all`}
                title={sidebarCollapsed ? 'Товары' : ''}
              >
                <Package size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Товары</span>}
              </button>
              <button
                onClick={() => router.push('/admin/banners')}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start gap-3 px-3'} py-2.5 rounded-xl bg-violet-500/15 text-violet-400 transition-all`}
                title={sidebarCollapsed ? 'Баннеры' : ''}
              >
                <ImageIcon size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Баннеры</span>}
              </button>
              <button
                onClick={() => router.push('/admin/orders')}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start gap-3 px-3'} py-2.5 rounded-xl text-gray-400 hover:bg-[#2a3347] hover:text-white transition-all`}
                title={sidebarCollapsed ? 'Заказы' : ''}
              >
                <ShoppingCart size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Заказы</span>}
              </button>
              <button
                onClick={() => router.push('/admin/branches')}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start gap-3 px-3'} py-2.5 rounded-xl text-gray-400 hover:bg-[#2a3347] hover:text-white transition-all`}
                title={sidebarCollapsed ? 'Филиалы' : ''}
              >
                <MapPin size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Филиалы</span>}
              </button>
              <button
                onClick={() => router.push('/admin/managers')}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start gap-3 px-3'} py-2.5 rounded-xl text-gray-400 hover:bg-[#2a3347] hover:text-white transition-all`}
                title={sidebarCollapsed ? 'Менеджеры' : ''}
              >
                <Users size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Менеджеры</span>}
              </button>
              <button
                onClick={() => router.push('/admin/reports')}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start gap-3 px-3'} py-2.5 rounded-xl text-gray-400 hover:bg-[#2a3347] hover:text-white transition-all`}
                title={sidebarCollapsed ? 'Отчеты' : ''}
              >
                <FileText size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Отчеты</span>}
              </button>
              <button
                onClick={() => router.push('/admin/settings')}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start gap-3 px-3'} py-2.5 rounded-xl text-gray-400 hover:bg-[#2a3347] hover:text-white transition-all`}
                title={sidebarCollapsed ? 'Настройки' : ''}
              >
                <Settings size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Настройки</span>}
              </button>
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
                <button
                  onClick={() => router.push('/admin/reports')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-[#2a3347] hover:text-white transition-all"
                >
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
            {/* Заголовок и поиск */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-6">Управление баннерами</h2>
              
              <div className="flex gap-4">
                {/* Поиск */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Поиск по названию или URL..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[#2a3347] border-2 border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-violet-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Кнопка добавления */}
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-2xl transition-all font-medium"
                >
                  <Plus size={20} />
                  <span>Добавить баннер</span>
                </button>
              </div>
            </div>

            {/* Список баннеров */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                <p className="text-gray-400 mt-4">Загрузка баннеров...</p>
              </div>
            ) : filteredBanners.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon size={48} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {searchQuery ? 'Баннеры не найдены' : 'Нет баннеров'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {searchQuery
                    ? 'Попробуйте изменить параметры поиска'
                    : 'Добавьте первый баннер для главной страницы'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-2xl transition-all font-medium"
                  >
                    <Plus size={20} />
                    <span>Добавить баннер</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredBanners.map((banner) => (
                  <div
                    key={banner.id}
                    className="bg-[#252d3d] rounded-2xl overflow-hidden border border-gray-700 hover:border-violet-500/50 transition-all relative"
                  >
                    {/* Статус */}
                    <div className="absolute top-4 right-4 z-10">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          banner.status === 'active'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}
                      >
                        {banner.status === 'active' ? 'Активен' : 'Неактивен'}
                      </span>
                    </div>

                    {/* Изображения баннера */}
                    <div className="space-y-3 p-4 bg-[#1e2533]">
                      {/* Десктоп */}
                      <div>
                        <p className="text-xs text-gray-400 mb-2 flex items-center gap-1.5 font-medium">
                          <span>🖥️</span> Десктоп (1920×600)
                        </p>
                        <div className="relative aspect-[16/5] bg-gray-900 rounded-xl overflow-hidden border border-gray-700/50">
                          <img
                            src={banner.desktopImage}
                            alt={`${banner.title} - Desktop`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      
                      {/* Мобильные */}
                      <div>
                        <p className="text-xs text-gray-400 mb-2 flex items-center gap-1.5 font-medium">
                          <span>📱</span> Мобильные (768×1024)
                        </p>
                        <div className="relative aspect-[3/4] bg-gray-900 rounded-xl overflow-hidden border border-gray-700/50 max-w-[200px]">
                          <img
                            src={banner.mobileImage}
                            alt={`${banner.title} - Mobile`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Информация */}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-2">{banner.title}</h3>
                      {banner.url && (
                        <p className="text-sm text-gray-400 mb-4 truncate">
                          <span className="text-gray-500">URL:</span> {banner.url}
                        </p>
                      )}

                      {/* Кнопки действий */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(banner)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                          <span className="text-sm font-medium">Редактировать</span>
                        </button>
                        <button
                          onClick={() => openDeleteModal(banner)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Модальные окна */}
      {showAddModal && (
        <AddBannerModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchBanners();
          }}
        />
      )}

      {showEditModal && selectedBanner && (
        <EditBannerModal
          isOpen={showEditModal}
          banner={selectedBanner}
          onClose={() => {
            setShowEditModal(false);
            setSelectedBanner(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedBanner(null);
            fetchBanners();
          }}
        />
      )}

      {showDeleteModal && selectedBanner && (
        <DeleteBannerModal
          isOpen={showDeleteModal}
          banner={selectedBanner}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedBanner(null);
          }}
          onSuccess={() => {
            setShowDeleteModal(false);
            setSelectedBanner(null);
            fetchBanners();
          }}
        />
      )}
    </div>
  );
}
