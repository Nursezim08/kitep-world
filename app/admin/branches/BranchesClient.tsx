'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import CustomSelect from '@/app/components/CustomSelect';
import ReassignManagersModal from './ReassignManagersModal';
import AddBranchModal from './AddBranchModal';
import CityAutocomplete from '@/app/components/CityAutocomplete';
import DistrictAutocomplete from '@/app/components/DistrictAutocomplete';
import AddressAutocomplete from '@/app/components/AddressAutocomplete';
import PhoneInput from '@/app/components/PhoneInput';
import EmailInput from '@/app/components/EmailInput';
import { 
  Users, 
  LogOut, 
  Bell, 
  Search, 
  Plus,
  Edit,
  Trash2,
  X,
  MapPin,
  Mail,
  Phone,
  Building2,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  FileText,
  Filter,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Code,
  Check,
  FolderTree,
  Image as ImageIcon
} from 'lucide-react';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  branchUsers?: Array<{
    branchId: string;
  }>;
}

interface BranchUser {
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  status: string;
  createdAt: string;
  branchUsers: BranchUser[];
  _count: {
    branchUsers: number;
    orders: number;
  };
}

interface BranchesClientProps {
  user: User;
}

export default function BranchesClient({ user }: BranchesClientProps) {
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'code' | 'city' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const editModalRef = useRef<HTMLDivElement>(null);
  const editModalContainerRef = useRef<HTMLDivElement>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedManagerForEdit, setSelectedManagerForEdit] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    code: '',
    city: '',
    district: '',
    address: '',
    phone: '',
    email: '',
    status: '',
    managerIds: [] as string[],
  });

  useEffect(() => {
    fetchBranches();
    fetchManagers();
  }, []);

  // Отладочный useEffect для отслеживания изменений managerIds
  useEffect(() => {
    console.log('editFormData.managerIds changed:', editFormData.managerIds);
  }, [editFormData.managerIds]);

  // Автоматический скролл вверх при открытии модального окна редактирования
  useEffect(() => {
    if (showEditModal && editModalContainerRef.current) {
      // Небольшая задержка для гарантии, что DOM обновился
      setTimeout(() => {
        if (editModalContainerRef.current) {
          editModalContainerRef.current.scrollTop = 0;
        }
      }, 50);
    }
  }, [showEditModal]);

  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/admin/branches');
      const data = await response.json();
      if (response.ok) {
        setBranches(data.branches);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await fetch('/api/admin/managers');
      const data = await response.json();
      if (response.ok) {
        setManagers(data.managers);
      }
    } catch (error) {
      console.error('Error fetching managers:', error);
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

  const handleEditBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch) return;

    setIsSubmitting(true);
    try {
      console.log('Sending PATCH request with data:', {
        ...editFormData,
        managerIds: editFormData.managerIds,
        managerIdsLength: editFormData.managerIds.length,
      });
      
      const response = await fetch(`/api/admin/branches/${selectedBranch.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editFormData,
          managerIds: editFormData.managerIds, // Явно указываем managerIds
        }),
      });

      const data = await response.json();
      console.log('Response from API:', data);

      if (response.ok) {
        setShowEditModal(false);
        setSelectedBranch(null);
        fetchBranches();
        fetchManagers(); // Обновляем список менеджеров
        setToast({ message: 'Филиал успешно обновлен', type: 'success' });
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast({ message: data.error || 'Ошибка при обновлении филиала', type: 'error' });
        setTimeout(() => setToast(null), 5000);
      }
    } catch (error) {
      console.error('Error updating branch:', error);
      setToast({ message: 'Ошибка при обновлении филиала', type: 'error' });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    try {
      const response = await fetch(`/api/admin/branches/${branchId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setShowDeleteModal(false);
        setBranchToDelete(null);
        fetchBranches();
        setToast({ message: 'Филиал успешно удален', type: 'success' });
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast({ message: data.error || 'Ошибка при удалении филиала', type: 'error' });
        setTimeout(() => setToast(null), 5000);
      }
    } catch (error) {
      console.error('Error deleting branch:', error);
      setToast({ message: 'Ошибка при удалении филиала', type: 'error' });
      setTimeout(() => setToast(null), 5000);
    }
  };

  const openDeleteModal = (branch: Branch) => {
    setBranchToDelete(branch);
    setShowDeleteModal(true);
  };

  const openEditModal = (branch: Branch) => {
    console.log('Opening edit modal for branch:', branch.id);
    console.log('Branch users:', branch.branchUsers);
    
    const managerIds = branch.branchUsers.map(bu => bu.user.id);
    console.log('Extracted manager IDs:', managerIds);
    
    setSelectedBranch(branch);
    setEditFormData({
      name: branch.name,
      code: branch.code,
      city: branch.city,
      district: branch.district,
      address: branch.address,
      phone: branch.phone,
      email: branch.email,
      status: branch.status,
      managerIds: managerIds,
    });
    
    console.log('Set editFormData with managerIds:', managerIds);
    setShowEditModal(true);
  };

  // Добавить менеджера в форму редактирования
  const addManagerToEditForm = (managerId: string) => {
    console.log('addManagerToEditForm called with:', managerId);
    
    if (!managerId) {
      console.log('Manager ID is empty');
      return;
    }
    
    setEditFormData(prev => {
      console.log('Current prev.managerIds:', prev.managerIds);
      
      if (prev.managerIds.includes(managerId)) {
        console.log('Manager already in form:', managerId);
        return prev;
      }
      
      const newManagerIds = [...prev.managerIds, managerId];
      console.log('Adding manager to edit form:', managerId, 'New managerIds:', newManagerIds);
      
      return {
        ...prev,
        managerIds: newManagerIds,
      };
    });
  };

  // Удалить менеджера из формы редактирования
  const removeManagerFromEditForm = (managerId: string) => {
    console.log('Removing manager from edit form:', managerId);
    console.log('Current managerIds:', editFormData.managerIds);
    
    const newManagerIds = editFormData.managerIds.filter(id => id !== managerId);
    console.log('New managerIds after removal:', newManagerIds);
    
    setEditFormData(prev => ({
      ...prev,
      managerIds: newManagerIds,
    }));
  };

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = 
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.phone?.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || branch.status === statusFilter;
    const matchesCity = cityFilter === 'all' || branch.city === cityFilter;
    
    return matchesSearch && matchesStatus && matchesCity;
  });

  const sortedBranches = [...filteredBranches].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'code':
        comparison = a.code.localeCompare(b.code);
        break;
      case 'city':
        comparison = a.city.localeCompare(b.city);
        break;
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: 'name' | 'code' | 'city' | 'date') => {
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
    setCityFilter('all');
    setSortBy('date');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const activeFiltersCount = 
    (statusFilter !== 'all' ? 1 : 0) + 
    (cityFilter !== 'all' ? 1 : 0);

  const totalPages = Math.ceil(sortedBranches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBranches = sortedBranches.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, cityFilter, sortBy, sortOrder]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-400';
      case 'inactive':
        return 'bg-gray-500/10 text-gray-400';
      case 'closed':
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
      case 'closed':
        return 'Закрыт';
      default:
        return status;
    }
  };

  const uniqueCities = Array.from(new Set(branches.map(b => b.city))).sort();

  return (
    <div className="min-h-screen bg-[#151b26] overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#252d3d] border-b border-gray-800/50">
        <div className="px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
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
                <p className="text-xs text-gray-400">Управление филиалами</p>
              </div>
            </div>

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
      <div className="flex pt-[73px]">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-20' : 'w-80'} px-4 pt-4 flex flex-col flex-shrink-0 transition-all duration-300 sticky top-[73px] self-start`}>
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
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white`}
                title={sidebarCollapsed ? 'Панель управления' : ''}
              >
                <LayoutDashboard size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Панель управления</span>}
              </button>
              <button
                onClick={() => router.push('/admin/users')}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white`}
                title={sidebarCollapsed ? 'Пользователи' : ''}
              >
                <Users size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Пользователи</span>}
              </button>
              <button
                onClick={() => router.push('/admin/categories')}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white`}
                title={sidebarCollapsed ? 'Категории' : ''}
              >
                <FolderTree size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Категории</span>}
              </button>
              <button
                onClick={() => router.push('/admin/products')}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white`}
                title={sidebarCollapsed ? 'Товары' : ''}
              >
                <Package size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Товары</span>}
              </button>
              <button
                onClick={() => router.push('/admin/banners')}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white`}
                title={sidebarCollapsed ? 'Баннеры' : ''}
              >
                <ImageIcon size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Баннеры</span>}
              </button>
              <button
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white`}
                title={sidebarCollapsed ? 'Заказы' : ''}
              >
                <ShoppingCart size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Заказы</span>}
              </button>
              <button
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl transition-all bg-violet-500/15 text-violet-400`}
                title={sidebarCollapsed ? 'Филиалы' : ''}
              >
                <MapPin size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Филиалы</span>}
              </button>
              <button
                onClick={() => router.push('/admin/managers')}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white`}
                title={sidebarCollapsed ? 'Менеджеры' : ''}
              >
                <Users size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Менеджеры</span>}
              </button>
              <button
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white`}
                title={sidebarCollapsed ? 'Отчеты' : ''}
              >
                <FileText size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Отчеты</span>}
              </button>
              <button
                onClick={() => router.push('/admin/settings')}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl transition-all text-gray-400 hover:bg-[#2a3347] hover:text-white`}
                title={sidebarCollapsed ? 'Настройки' : ''}
              >
                <Settings size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Настройки</span>}
              </button>
            </nav>
          </div>

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

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <main className="p-4 md:p-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-extrabold text-white mb-2">
                  Филиалы
                </h2>
                <p className="text-gray-400 font-semibold">
                  Управление филиалами компании
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReassignModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-semibold transition-all"
                >
                  <RefreshCw size={20} />
                  Переназначить менеджеров
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-semibold transition-all"
                >
                  <Plus size={20} />
                  Добавить филиал
                </button>
              </div>
            </div>
          </div>

          {/* Filters will be added here */}
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Поиск по названию, коду, городу или телефону..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#252d3d] border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-sm text-white placeholder-gray-500"
                />
              </div>

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
                        { value: 'closed', label: 'Закрыт' },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">
                      Город
                    </label>
                    <CustomSelect
                      value={cityFilter}
                      onChange={setCityFilter}
                      options={[
                        { value: 'all', label: 'Все города' },
                        ...uniqueCities.map((city) => ({
                          value: city,
                          label: city,
                        })),
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">
                      Сортировать по
                    </label>
                    <CustomSelect
                      value={sortBy}
                      onChange={(value) => setSortBy(value as any)}
                      options={[
                        { value: 'date', label: 'Дате создания' },
                        { value: 'name', label: 'Названию' },
                        { value: 'code', label: 'Коду' },
                        { value: 'city', label: 'Городу' },
                      ]}
                    />
                  </div>

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
                      {cityFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-violet-500/20 text-violet-300 rounded-lg text-xs font-semibold">
                          Город: {cityFilter}
                          <button
                            onClick={() => setCityFilter('all')}
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

          {/* Table will be added here */}
          {/* Branches Table */}
          <div className="bg-[#252d3d] rounded-2xl border border-gray-800/50 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-400">
                Загрузка...
              </div>
            ) : sortedBranches.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                {searchQuery || activeFiltersCount > 0 ? 'Филиалы не найдены' : 'Нет филиалов'}
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
                            Филиал
                            {sortBy === 'name' && (
                              sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-4 text-left">
                          <button
                            onClick={() => handleSort('code')}
                            className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-white transition-colors"
                          >
                            Код
                            {sortBy === 'code' && (
                              sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-4 text-left">
                          <button
                            onClick={() => handleSort('city')}
                            className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-white transition-colors"
                          >
                            Город
                            {sortBy === 'city' && (
                              sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Контакты
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Менеджеры
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
                      {paginatedBranches.map((branch) => (
                        <tr 
                          key={branch.id} 
                          onClick={() => router.push(`/admin/branches/${branch.id}`)}
                          className="hover:bg-[#1e2533] transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                                {branch.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white">{branch.name}</p>
                                <p className="text-xs text-gray-500">{branch.district}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Code size={14} className="text-violet-400" />
                              <span className="text-sm text-gray-300 font-mono">{branch.code}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-violet-400" />
                              <span className="text-sm text-gray-300">{branch.city}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Phone size={12} />
                                {branch.phone}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Mail size={12} />
                                {branch.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {branch.branchUsers.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {branch.branchUsers.slice(0, 3).map((bu) => (
                                  <div
                                    key={bu.user.id}
                                    className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                                    title={bu.user.fullName}
                                  >
                                    {bu.user.fullName.charAt(0)}
                                  </div>
                                ))}
                                {branch.branchUsers.length > 3 && (
                                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                    +{branch.branchUsers.length - 3}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">Нет менеджеров</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(branch.status)}`}>
                              {getStatusText(branch.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(branch);
                                }}
                                className="p-2 hover:bg-violet-500/10 text-violet-400 rounded-lg transition-colors"
                                title="Редактировать"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDeleteModal(branch);
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
                
                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {totalPages > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white hover:bg-[#2a3347]"
                        >
                          <ChevronsLeft size={18} />
                        </button>
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white hover:bg-[#2a3347]"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => {
                              return (
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 1 && page <= currentPage + 1)
                              );
                            })
                            .map((page, index, array) => (
                              <div key={page} className="flex items-center gap-1">
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
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white hover:bg-[#2a3347]"
                        >
                          <ChevronRight size={18} />
                        </button>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white hover:bg-[#2a3347]"
                        >
                          <ChevronsRight size={18} />
                        </button>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    Показано <span className="text-white font-semibold">{startIndex + 1}-{Math.min(endIndex, sortedBranches.length)}</span> из{' '}
                    <span className="text-white font-semibold">{sortedBranches.length}</span> филиалов
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Modals will be added here */}
          {/* Add Branch Modal */}
          <AddBranchModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false);
              fetchBranches();
              setToast({ message: 'Филиал успешно создан', type: 'success' });
              setTimeout(() => setToast(null), 3000);
            }}
            managers={managers}
          />

          {/* Edit Branch Modal */}
          {showEditModal && selectedBranch && (
            <div 
              ref={editModalContainerRef}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
            >
              <div 
                ref={editModalRef}
                className="bg-[#252d3d] rounded-2xl max-w-2xl w-full p-5 border border-gray-800/50 my-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Редактировать филиал</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-[#1e2533] rounded-lg text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleEditBranch} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Название филиала
                      </label>
                      <input
                        type="text"
                        required
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="w-full px-3 py-2 bg-[#1e2533] border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Код филиала
                      </label>
                      <input
                        type="text"
                        required
                        value={editFormData.code}
                        onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value })}
                        className="w-full px-3 py-2 bg-[#1e2533] border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white text-sm font-mono"
                      />
                    </div>

                    <CityAutocomplete
                      value={editFormData.city}
                      onChange={(value) => setEditFormData({ ...editFormData, city: value })}
                      placeholder="Введите название города"
                      label="Город"
                      required
                    />

                    <DistrictAutocomplete
                      value={editFormData.district}
                      onChange={(value) => setEditFormData({ ...editFormData, district: value })}
                      placeholder="Выберите район"
                      label="Район"
                      required
                      city={editFormData.city}
                    />
                  </div>

                  <AddressAutocomplete
                    value={editFormData.address}
                    onChange={(value) => setEditFormData({ ...editFormData, address: value })}
                    placeholder="Введите адрес (улица, номер дома)"
                    label="Адрес"
                    required
                    city={editFormData.city}
                    district={editFormData.district}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <PhoneInput
                      value={editFormData.phone}
                      onChange={(value) => setEditFormData({ ...editFormData, phone: value })}
                      placeholder="+996 XXX XXX XXX"
                      label="Телефон"
                      required
                    />

                    <EmailInput
                      value={editFormData.email}
                      onChange={(value) => setEditFormData({ ...editFormData, email: value })}
                      placeholder="branch@example.com"
                      label="Email"
                      required
                    />
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
                        { value: 'closed', label: 'Закрыт' },
                      ]}
                    />
                  </div>

                  {/* Секция менеджеров */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-2">
                      Менеджеры
                    </label>
                    
                    {/* Выбранные менеджеры (чипсы сверху) */}
                    {editFormData.managerIds.length > 0 && (
                      <div className="mb-3 p-3 bg-[#1e2533] rounded-lg border border-gray-700/50">
                        <div className="flex flex-wrap gap-2">
                          {editFormData.managerIds.map((managerId) => {
                            const manager = managers.find(m => m.id === managerId);
                            if (!manager) return null;
                            return (
                              <div
                                key={managerId}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg text-sm font-medium border border-emerald-500/30"
                              >
                                <span>{manager.fullName}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    console.log('Removing manager:', managerId);
                                    removeManagerFromEditForm(managerId);
                                  }}
                                  className="hover:text-emerald-100 transition-colors"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Поиск менеджеров */}
                    <div className="mb-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Поиск менеджера..."
                          value={selectedManagerForEdit}
                          onChange={(e) => setSelectedManagerForEdit(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-[#1e2533] border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm text-white placeholder-gray-500"
                        />
                      </div>
                    </div>

                    {/* Список доступных менеджеров */}
                    <div className="max-h-64 overflow-y-auto space-y-1.5 bg-[#1e2533] rounded-xl border border-gray-700/50 p-2">
                      {managers
                        .filter(m => {
                          // Фильтр по поиску
                          const searchLower = selectedManagerForEdit.toLowerCase();
                          const matchesSearch = !searchLower || 
                            m.fullName.toLowerCase().includes(searchLower) ||
                            m.email.toLowerCase().includes(searchLower);
                          
                          if (!matchesSearch) return false;
                          
                          // Показываем менеджеров без филиала
                          if (!m.branchUsers || m.branchUsers.length === 0) return true;
                          
                          // Показываем менеджеров, назначенных только в текущий редактируемый филиал
                          if (selectedBranch && m.branchUsers.length === 1) {
                            return m.branchUsers[0].branchId === selectedBranch.id;
                          }
                          
                          return false;
                        })
                        .map((manager) => {
                          const isSelected = editFormData.managerIds.includes(manager.id);
                          return (
                            <button
                              key={manager.id}
                              type="button"
                              onClick={() => {
                                console.log('Manager clicked:', manager.id, 'isSelected:', isSelected);
                                if (isSelected) {
                                  removeManagerFromEditForm(manager.id);
                                } else {
                                  addManagerToEditForm(manager.id);
                                }
                              }}
                              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                                isSelected
                                  ? 'bg-emerald-500/15 border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                                  : 'bg-[#252d3d] hover:bg-[#2a3347] border-2 border-transparent hover:border-gray-700/50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                                  isSelected 
                                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' 
                                    : 'bg-gradient-to-br from-blue-500 to-blue-600'
                                }`}>
                                  {manager.fullName.charAt(0)}
                                </div>
                                <div className="text-left">
                                  <p className={`text-sm font-semibold ${isSelected ? 'text-emerald-300' : 'text-white'}`}>
                                    {manager.fullName}
                                  </p>
                                  <p className={`text-xs ${isSelected ? 'text-emerald-400/70' : 'text-gray-500'}`}>
                                    {manager.email}
                                  </p>
                                </div>
                              </div>
                              {isSelected && (
                                <div className="flex-shrink-0 w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center">
                                  <Check className="text-white" size={16} strokeWidth={3} />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      {managers.filter(m => {
                        const searchLower = selectedManagerForEdit.toLowerCase();
                        const matchesSearch = !searchLower || 
                          m.fullName.toLowerCase().includes(searchLower) ||
                          m.email.toLowerCase().includes(searchLower);
                        
                        if (!matchesSearch) return false;
                        
                        if (!m.branchUsers || m.branchUsers.length === 0) return true;
                        
                        if (selectedBranch && m.branchUsers.length === 1) {
                          return m.branchUsers[0].branchId === selectedBranch.id;
                        }
                        
                        return false;
                      }).length === 0 && (
                        <div className="text-center py-8 text-gray-500 text-sm">
                          {selectedManagerForEdit ? 'Менеджеры не найдены' : 'Нет доступных менеджеров'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      disabled={isSubmitting}
                      className="flex-1 px-3 py-2 bg-[#1e2533] hover:bg-[#2a3347] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-sm transition-all"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-3 py-2 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="animate-spin" size={16} />
                          Сохранение...
                        </>
                      ) : (
                        'Сохранить'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && branchToDelete && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#252d3d] rounded-2xl max-w-md w-full p-6 border border-gray-800/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                      <Trash2 className="text-red-400" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Удалить филиал</h3>
                      <p className="text-sm text-gray-400">Это действие нельзя отменить</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setBranchToDelete(null);
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
                        {branchToDelete.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{branchToDelete.name}</p>
                        <p className="text-gray-400 text-sm">{branchToDelete.code}</p>
                        <p className="text-gray-500 text-xs">
                          {branchToDelete.city}, {branchToDelete.district}
                        </p>
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
                          Вы собираетесь удалить филиал <strong>{branchToDelete.name}</strong>. 
                          Это действие нельзя отменить. Все связи с менеджерами будут удалены.
                        </p>
                        {branchToDelete._count.branchUsers > 0 && (
                          <p className="text-red-300 text-sm mt-2">
                            ⚠️ У этого филиала есть {branchToDelete._count.branchUsers} назначенных менеджеров!
                          </p>
                        )}
                        {branchToDelete._count.orders > 0 && (
                          <p className="text-red-300 text-sm mt-2">
                            ⚠️ У этого филиала есть {branchToDelete._count.orders} заказов!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setBranchToDelete(null);
                    }}
                    className="flex-1 px-4 py-3 bg-[#1e2533] hover:bg-[#2a3347] text-white rounded-xl font-semibold transition-all"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => branchToDelete && handleDeleteBranch(branchToDelete.id)}
                    className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reassign Managers Modal */}
          {showReassignModal && (
            <ReassignManagersModal
              branches={branches}
              managers={managers}
              onClose={() => setShowReassignModal(false)}
              onSuccess={() => {
                setShowReassignModal(false);
                fetchBranches();
                setToast({ message: 'Менеджеры успешно переназначены', type: 'success' });
                setTimeout(() => setToast(null), 3000);
              }}
            />
          )}

          {/* Toast Notification */}
          {toast && (
            <div className="fixed bottom-8 right-8 z-[60] animate-in slide-in-from-bottom-5">
              <div
                className={`rounded-xl px-6 py-4 shadow-2xl border backdrop-blur-sm ${
                  toast.type === 'success'
                    ? 'bg-emerald-500/90 border-emerald-400/50 text-white'
                    : 'bg-red-500/90 border-red-400/50 text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {toast.type === 'success' ? (
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                  <p className="font-semibold text-sm">{toast.message}</p>
                  <button
                    onClick={() => setToast(null)}
                    className="ml-2 hover:bg-white/20 rounded-lg p-1 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
        </div>
      </div>
    </div>
  );
}
