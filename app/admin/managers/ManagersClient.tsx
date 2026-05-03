'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import CustomSelect from '@/app/components/CustomSelect';
import { 
  Users, 
  LogOut, 
  Bell, 
  Search, 
  Plus,
  Edit,
  Trash2,
  X,
  Eye,
  EyeOff,
  MapPin,
  Mail,
  Phone,
  User,
  Lock,
  Building2,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  FileText,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface Branch {
  id: string;
  name: string;
  city: string;
}

interface Manager {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: string;
  branchUsers: {
    branch: Branch;
  }[];
}

interface ManagersClientProps {
  user: User;
}

export default function ManagersClient({ user }: ManagersClientProps) {
  const router = useRouter();
  const [managers, setManagers] = useState<Manager[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'date' | 'branch'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [managerToDelete, setManagerToDelete] = useState<Manager | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    branchId: '',
  });
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    status: '',
    branchId: '',
  });

  useEffect(() => {
    fetchManagers();
    fetchBranches();
  }, []);

  const fetchManagers = async () => {
    try {
      const response = await fetch('/api/admin/managers');
      const data = await response.json();
      if (response.ok) {
        setManagers(data.managers);
      }
    } catch (error) {
      console.error('Error fetching managers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/admin/branches');
      const data = await response.json();
      if (response.ok) {
        setBranches(data.branches);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

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

  const handleAddManager = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowAddModal(false);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          password: '',
          branchId: '',
        });
        fetchManagers();
      } else {
        const data = await response.json();
        alert(data.error || 'Ошибка при создании менеджера');
      }
    } catch (error) {
      console.error('Error adding manager:', error);
      alert('Ошибка при создании менеджера');
    }
  };

  const handleEditManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManager) return;

    try {
      const response = await fetch(`/api/admin/managers/${selectedManager.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedManager(null);
        fetchManagers();
      } else {
        const data = await response.json();
        alert(data.error || 'Ошибка при обновлении менеджера');
      }
    } catch (error) {
      console.error('Error updating manager:', error);
      alert('Ошибка при обновлении менеджера');
    }
  };

  const handleDeleteManager = async (managerId: string) => {
    try {
      const response = await fetch(`/api/admin/managers/${managerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setManagerToDelete(null);
        fetchManagers();
      } else {
        const data = await response.json();
        alert(data.error || 'Ошибка при удалении менеджера');
      }
    } catch (error) {
      console.error('Error deleting manager:', error);
      alert('Ошибка при удалении менеджера');
    }
  };

  const openDeleteModal = (manager: Manager) => {
    setManagerToDelete(manager);
    setShowDeleteModal(true);
  };

  const openEditModal = (manager: Manager) => {
    setSelectedManager(manager);
    setEditFormData({
      fullName: manager.fullName,
      email: manager.email,
      phone: manager.phone || '',
      password: '',
      status: manager.status,
      branchId: manager.branchUsers[0]?.branch.id || '',
    });
    setShowEditModal(true);
  };

  const filteredManagers = managers.filter(manager => {
    // Поиск по тексту
    const matchesSearch = 
      manager.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manager.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manager.phone?.includes(searchQuery);
    
    // Фильтр по статусу
    const matchesStatus = statusFilter === 'all' || manager.status === statusFilter;
    
    // Фильтр по филиалу
    const matchesBranch = branchFilter === 'all' || 
      (branchFilter === 'unassigned' && manager.branchUsers.length === 0) ||
      manager.branchUsers.some(bu => bu.branch.id === branchFilter);
    
    return matchesSearch && matchesStatus && matchesBranch;
  });

  // Сортировка
  const sortedManagers = [...filteredManagers].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.fullName.localeCompare(b.fullName);
        break;
      case 'email':
        comparison = a.email.localeCompare(b.email);
        break;
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'branch':
        const branchA = a.branchUsers[0]?.branch.name || '';
        const branchB = b.branchUsers[0]?.branch.name || '';
        comparison = branchA.localeCompare(branchB);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: 'name' | 'email' | 'date' | 'branch') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setBranchFilter('all');
    setSortBy('date');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const activeFiltersCount = 
    (statusFilter !== 'all' ? 1 : 0) + 
    (branchFilter !== 'all' ? 1 : 0);

  // Пагинация
  const totalPages = Math.ceil(sortedManagers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedManagers = sortedManagers.slice(startIndex, endIndex);

  // Сброс на первую страницу при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, branchFilter, sortBy, sortOrder]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-400';
      case 'inactive':
        return 'bg-gray-500/10 text-gray-400';
      case 'blocked':
        return 'bg-red-500/10 text-red-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активен';
      case 'inactive':
        return 'Неактивен';
      case 'blocked':
        return 'Заблокирован';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-[#151b26] overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#252d3d] border-b border-gray-800/50">
        <div className="px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img 
                src="/logonur.png" 
                alt="Nur-Kitep Logo" 
                className="w-10 h-10 rounded-xl object-cover"
              />
              <div>
                <h1 className="text-lg font-bold text-white">
                  Nur-Kitep
                </h1>
                <p className="text-xs text-gray-400">Управление менеджерами</p>
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

              <button
                onClick={handleLogout}
                className="p-2.5 hover:bg-red-500/10 rounded-xl transition-colors text-gray-400 hover:text-red-400"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex pt-[73px] overflow-x-hidden">
        {/* Sidebar */}
        <aside className="w-80 p-4 flex flex-col sticky top-[73px] h-fit z-40 flex-shrink-0">
          {/* Main Navigation Card */}
          <div className="bg-[#252d3d] rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2 text-gray-400">
                <LayoutDashboard size={18} />
                <span className="text-sm font-semibold">Навигация</span>
              </div>
            </div>
            
            <nav className="space-y-1">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white"
              >
                <LayoutDashboard size={18} className="flex-shrink-0" />
                <span className="text-sm font-medium">Панель управления</span>
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white"
              >
                <Users size={18} className="flex-shrink-0" />
                <span className="text-sm font-medium">Пользователи</span>
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white"
              >
                <Package size={18} className="flex-shrink-0" />
                <span className="text-sm font-medium">Товары</span>
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white"
              >
                <ShoppingCart size={18} className="flex-shrink-0" />
                <span className="text-sm font-medium">Заказы</span>
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white"
              >
                <MapPin size={18} className="flex-shrink-0" />
                <span className="text-sm font-medium">Филиалы</span>
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all bg-violet-500/15 text-violet-400"
              >
                <Users size={18} className="flex-shrink-0" />
                <span className="text-sm font-medium">Менеджеры</span>
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white"
              >
                <FileText size={18} className="flex-shrink-0" />
                <span className="text-sm font-medium">Отчеты</span>
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white"
              >
                <Settings size={18} className="flex-shrink-0" />
                <span className="text-sm font-medium">Настройки</span>
              </button>
            </nav>
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

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <main className="p-4 md:p-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-extrabold text-white mb-2">
                  Менеджеры
                </h2>
                <p className="text-gray-400 font-semibold">
                  Управление менеджерами филиалов
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-semibold transition-all"
              >
                <Plus size={20} />
                Добавить менеджера
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Поиск по имени, email или телефону..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#252d3d] border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-sm text-white placeholder-gray-500"
                />
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  showFilters || activeFiltersCount > 0
                    ? 'bg-violet-500 text-white'
                    : 'bg-[#252d3d] text-gray-300 hover:bg-[#2a3347]'
                }`}
              >
                <Filter size={18} />
                Фильтры
                {activeFiltersCount > 0 && (
                  <span className="bg-white text-violet-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="bg-[#252d3d] rounded-xl p-4 border border-gray-800/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">Фильтры и сортировка</h3>
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    <RefreshCw size={14} />
                    Сбросить
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">
                      Статус
                    </label>
                    <CustomSelect
                      value={statusFilter}
                      onChange={setStatusFilter}
                      options={[
                        { value: 'all', label: 'Все статусы' },
                        { value: 'active', label: 'Активен' },
                        { value: 'inactive', label: 'Неактивен' },
                        { value: 'blocked', label: 'Заблокирован' },
                      ]}
                    />
                  </div>

                  {/* Branch Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">
                      Филиал
                    </label>
                    <CustomSelect
                      value={branchFilter}
                      onChange={setBranchFilter}
                      options={[
                        { value: 'all', label: 'Все филиалы' },
                        { value: 'unassigned', label: 'Не назначен' },
                        ...branches.map((branch) => ({
                          value: branch.id,
                          label: `${branch.name} (${branch.city})`,
                        })),
                      ]}
                    />
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">
                      Сортировать по
                    </label>
                    <CustomSelect
                      value={sortBy}
                      onChange={(value) => setSortBy(value as any)}
                      options={[
                        { value: 'date', label: 'Дате создания' },
                        { value: 'name', label: 'Имени' },
                        { value: 'email', label: 'Email' },
                        { value: 'branch', label: 'Филиалу' },
                      ]}
                    />
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">
                      Порядок
                    </label>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="w-full flex items-center justify-between px-3 py-2 bg-[#1e2533] border border-gray-700/50 rounded-lg hover:bg-[#2a3347] transition-colors text-white text-sm"
                    >
                      <span>{sortOrder === 'asc' ? 'По возрастанию' : 'По убыванию'}</span>
                      {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Active Filters Summary */}
                {activeFiltersCount > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <div className="flex flex-wrap gap-2">
                      {statusFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-violet-500/20 text-violet-300 rounded-lg text-xs font-semibold">
                          Статус: {getStatusText(statusFilter)}
                          <button
                            onClick={() => setStatusFilter('all')}
                            className="hover:text-white transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      )}
                      {branchFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-violet-500/20 text-violet-300 rounded-lg text-xs font-semibold">
                          Филиал: {branchFilter === 'unassigned' ? 'Не назначен' : branches.find(b => b.id === branchFilter)?.name}
                          <button
                            onClick={() => setBranchFilter('all')}
                            className="hover:text-white transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Managers Table */}
          <div className="bg-[#252d3d] rounded-2xl border border-gray-800/50 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-400">
                Загрузка...
              </div>
            ) : sortedManagers.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                {searchQuery || activeFiltersCount > 0 ? 'Менеджеры не найдены' : 'Нет менеджеров'}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-[#1e2533] border-b border-gray-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('name')}
                          className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-white transition-colors"
                        >
                          Менеджер
                          {sortBy === 'name' && (
                            sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('email')}
                          className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-white transition-colors"
                        >
                          Email
                          {sortBy === 'email' && (
                            sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Телефон
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('branch')}
                          className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-white transition-colors"
                        >
                          Филиал
                          {sortBy === 'branch' && (
                            sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Статус
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {paginatedManagers.map((manager) => (
                      <tr 
                        key={manager.id} 
                        onClick={() => router.push(`/admin/managers/${manager.id}`)}
                        className="hover:bg-[#1e2533] transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                              {manager.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">{manager.fullName}</p>
                              <p className="text-xs text-gray-500">ID: {manager.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-300">{manager.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-300">{manager.phone || '—'}</p>
                        </td>
                        <td className="px-6 py-4">
                          {manager.branchUsers.length > 0 ? (
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-violet-400" />
                              <span className="text-sm text-gray-300">
                                {manager.branchUsers[0].branch.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Не назначен</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(manager.status)}`}>
                            {getStatusText(manager.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(manager);
                              }}
                              className="p-2 hover:bg-violet-500/10 text-violet-400 rounded-lg transition-colors"
                              title="Редактировать"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteModal(manager);
                              }}
                              className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                              title="Удалить"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination and Results Count */}
              <div className="px-6 py-4 border-t border-gray-800/50 flex items-center justify-between">
                {/* Pagination Controls */}
                <div className="flex items-center gap-2">
                  {totalPages > 1 && (
                    <>
                      {/* First Page */}
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white hover:bg-[#2a3347]"
                        title="Первая страница"
                      >
                        <ChevronsLeft size={18} />
                      </button>

                      {/* Previous Page */}
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white hover:bg-[#2a3347]"
                        title="Предыдущая страница"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => {
                            // Показываем первую, последнюю и страницы рядом с текущей
                            return (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            );
                          })
                          .map((page, index, array) => (
                            <div key={page} className="flex items-center gap-1">
                              {/* Добавляем многоточие если есть пропуск */}
                              {index > 0 && array[index - 1] !== page - 1 && (
                                <span className="px-2 text-gray-500">...</span>
                              )}
                              <button
                                onClick={() => setCurrentPage(page)}
                                className={`min-w-[36px] px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                                  currentPage === page
                                    ? 'bg-violet-500 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-[#2a3347]'
                                }`}
                              >
                                {page}
                              </button>
                            </div>
                          ))}
                      </div>

                      {/* Next Page */}
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white hover:bg-[#2a3347]"
                        title="Следующая страница"
                      >
                        <ChevronRight size={18} />
                      </button>

                      {/* Last Page */}
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white hover:bg-[#2a3347]"
                        title="Последняя страница"
                      >
                        <ChevronsRight size={18} />
                      </button>
                    </>
                  )}
                </div>

                {/* Results Count */}
                <p className="text-sm text-gray-400">
                  Показано <span className="text-white font-semibold">{startIndex + 1}-{Math.min(endIndex, sortedManagers.length)}</span> из{' '}
                  <span className="text-white font-semibold">{sortedManagers.length}</span> менеджеров
                </p>
              </div>
              </>
            )}
          </div>
        </main>
        </div>
      </div>

      {/* Add Manager Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#252d3d] rounded-2xl max-w-md w-full p-5 border border-gray-800/50 my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Добавить менеджера</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-[#1e2533] rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddManager} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <User size={14} />
                    Полное имя
                  </div>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1e2533] border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white text-sm"
                  placeholder="Иван Иванов"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Mail size={14} />
                    Email
                  </div>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1e2533] border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white text-sm"
                  placeholder="manager@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Phone size={14} />
                    Телефон (необязательно)
                  </div>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1e2533] border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white text-sm"
                  placeholder="+996 XXX XXX XXX"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Lock size={14} />
                    Пароль
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1e2533] border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white pr-10 text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Building2 size={14} />
                    Филиал (необязательно)
                  </div>
                </label>
                <CustomSelect
                  value={formData.branchId}
                  onChange={(value) => setFormData({ ...formData, branchId: value })}
                  options={[
                    { value: '', label: 'Не назначен' },
                    ...branches.map((branch) => ({
                      value: branch.id,
                      label: `${branch.name} (${branch.city})`,
                    })),
                  ]}
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-3 py-2 bg-[#1e2533] hover:bg-[#2a3347] text-white rounded-lg font-semibold text-sm transition-all"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg font-semibold text-sm transition-all"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Manager Modal */}
      {showEditModal && selectedManager && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#252d3d] rounded-2xl max-w-md w-full p-5 border border-gray-800/50 my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Редактировать менеджера</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-[#1e2533] rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditManager} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <User size={14} />
                    Полное имя
                  </div>
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1e2533] border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Mail size={14} />
                    Email
                  </div>
                </label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1e2533] border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Phone size={14} />
                    Телефон
                  </div>
                </label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1e2533] border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Lock size={14} />
                    Новый пароль (оставьте пустым, чтобы не менять)
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={editFormData.password}
                    onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1e2533] border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white pr-10 text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Статус
                </label>
                <CustomSelect
                  value={editFormData.status}
                  onChange={(value) => setEditFormData({ ...editFormData, status: value })}
                  options={[
                    { value: 'active', label: 'Активен' },
                    { value: 'inactive', label: 'Неактивен' },
                    { value: 'blocked', label: 'Заблокирован' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Building2 size={14} />
                    Филиал
                  </div>
                </label>
                <CustomSelect
                  value={editFormData.branchId}
                  onChange={(value) => setEditFormData({ ...editFormData, branchId: value })}
                  options={[
                    { value: '', label: 'Не назначен' },
                    ...branches.map((branch) => ({
                      value: branch.id,
                      label: `${branch.name} (${branch.city})`,
                    })),
                  ]}
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-3 py-2 bg-[#1e2533] hover:bg-[#2a3347] text-white rounded-lg font-semibold text-sm transition-all"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg font-semibold text-sm transition-all"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && managerToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#252d3d] rounded-2xl max-w-md w-full p-6 border border-gray-800/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                  <Trash2 className="text-red-400" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Удалить менеджера</h3>
                  <p className="text-sm text-gray-400">Это действие нельзя отменить</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setManagerToDelete(null);
                }}
                className="p-2 hover:bg-[#1e2533] rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-[#1e2533] rounded-xl p-4 border border-gray-800/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                    {managerToDelete.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{managerToDelete.fullName}</p>
                    <p className="text-gray-400 text-sm">{managerToDelete.email}</p>
                    {managerToDelete.branchUsers.length > 0 && (
                      <p className="text-gray-500 text-xs">
                        Филиал: {managerToDelete.branchUsers[0].branch.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-400 text-sm font-bold">!</span>
                  </div>
                  <div>
                    <p className="text-red-400 font-semibold text-sm mb-1">Внимание!</p>
                    <p className="text-red-300 text-sm">
                      Вы собираетесь удалить менеджера <strong>{managerToDelete.fullName}</strong>. 
                      Это действие нельзя отменить. Все связи с филиалами будут удалены.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setManagerToDelete(null);
                }}
                className="flex-1 px-4 py-3 bg-[#1e2533] hover:bg-[#2a3347] text-white rounded-xl font-semibold transition-all"
              >
                Отмена
              </button>
              <button
                onClick={() => managerToDelete && handleDeleteManager(managerToDelete.id)}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
