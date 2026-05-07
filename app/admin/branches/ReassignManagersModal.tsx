'use client';

import { useState, useEffect } from 'react';
import { X, ArrowRight, RefreshCw, AlertCircle, MoveRight } from 'lucide-react';
import CustomSelect from '@/app/components/CustomSelect';

interface Manager {
  id: string;
  fullName: string;
  email: string;
}

interface BranchUser {
  user: Manager;
}

interface Branch {
  id: string;
  name: string;
  code: string;
  branchUsers: BranchUser[];
}

interface ReassignManagersModalProps {
  branches: Branch[];
  managers: Manager[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReassignManagersModal({
  branches,
  managers,
  onClose,
  onSuccess,
}: ReassignManagersModalProps) {
  const [fromBranchId, setFromBranchId] = useState('');
  const [toBranchId, setToBranchId] = useState('');
  const [selectedManagerIds, setSelectedManagerIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Получить менеджеров выбранного филиала
  const fromBranchManagers = fromBranchId
    ? branches.find(b => b.id === fromBranchId)?.branchUsers.map(bu => bu.user) || []
    : [];

  const toBranchManagers = toBranchId
    ? branches.find(b => b.id === toBranchId)?.branchUsers.map(bu => bu.user) || []
    : [];

  // Сброс выбранных менеджеров при смене филиала
  useEffect(() => {
    setSelectedManagerIds([]);
  }, [fromBranchId]);

  // Переключить выбор менеджера
  const toggleManager = (managerId: string) => {
    setSelectedManagerIds(prev =>
      prev.includes(managerId)
        ? prev.filter(id => id !== managerId)
        : [...prev, managerId]
    );
  };

  // Выполнить переназначение
  const handleReassign = async () => {
    if (!fromBranchId || !toBranchId) {
      setError('Выберите оба филиала');
      return;
    }

    if (selectedManagerIds.length === 0) {
      setError('Выберите хотя бы одного менеджера для переназначения');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/branches/reassign-managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromBranchId,
          toBranchId,
          managerIds: selectedManagerIds,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(data.error || 'Ошибка при переназначении менеджеров');
      }
    } catch (error) {
      console.error('Error reassigning managers:', error);
      setError('Ошибка при переназначении менеджеров');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#252d3d] rounded-2xl max-w-5xl w-full p-6 border border-gray-800/50 my-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <RefreshCw className="text-blue-400" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Переназначить менеджеров</h3>
              <p className="text-sm text-gray-400">Перемещение менеджеров между филиалами</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1e2533] rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Выбор филиалов */}
        <div className="bg-[#1e2533] rounded-xl p-4 mb-6 border border-gray-800/30">
          <h4 className="text-sm font-semibold text-white mb-4">Выберите филиалы</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">
                Из филиала (откуда)
              </label>
              <CustomSelect
                value={fromBranchId}
                onChange={(value) => {
                  setFromBranchId(value);
                  setError('');
                }}
                options={[
                  { value: '', label: 'Выберите филиал' },
                  ...branches
                    .filter(b => b.branchUsers.length > 0)
                    .map(b => ({
                      value: b.id,
                      label: `${b.name} (${b.code}) - ${b.branchUsers.length} менеджеров`,
                    })),
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">
                В филиал (куда)
              </label>
              <CustomSelect
                value={toBranchId}
                onChange={(value) => {
                  setToBranchId(value);
                  setError('');
                }}
                options={[
                  { value: '', label: 'Выберите филиал' },
                  ...branches
                    .filter(b => b.id !== fromBranchId)
                    .map(b => ({
                      value: b.id,
                      label: `${b.name} (${b.code}) - ${b.branchUsers.length} менеджеров`,
                    })),
                ]}
              />
            </div>
          </div>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Списки менеджеров */}
        {fromBranchId && toBranchId && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-white mb-3">
              Выберите менеджеров для переназначения
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Список менеджеров исходного филиала */}
              <div className="bg-[#1e2533] rounded-xl p-4 border border-gray-800/30">
                <h5 className="text-xs font-semibold text-gray-400 mb-3 uppercase">
                  {branches.find(b => b.id === fromBranchId)?.name}
                </h5>
                
                {fromBranchManagers.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Нет менеджеров</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {fromBranchManagers.map((manager) => (
                      <button
                        key={manager.id}
                        onClick={() => toggleManager(manager.id)}
                        className={`w-full p-3 rounded-lg transition-all text-left ${
                          selectedManagerIds.includes(manager.id)
                            ? 'bg-blue-500/20 border-2 border-blue-500/50'
                            : 'bg-[#252d3d] border-2 border-transparent hover:border-gray-700/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {manager.fullName.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                              {manager.fullName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{manager.email}</p>
                          </div>
                          {selectedManagerIds.includes(manager.id) && (
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Стрелка */}
              <div className="flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <MoveRight className="text-blue-400" size={32} />
                  {selectedManagerIds.length > 0 && (
                    <span className="text-xs font-semibold text-blue-400">
                      {selectedManagerIds.length} выбрано
                    </span>
                  )}
                </div>
              </div>

              {/* Список менеджеров целевого филиала */}
              <div className="bg-[#1e2533] rounded-xl p-4 border border-gray-800/30">
                <h5 className="text-xs font-semibold text-gray-400 mb-3 uppercase">
                  {branches.find(b => b.id === toBranchId)?.name}
                </h5>
                
                {toBranchManagers.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Нет менеджеров</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {toBranchManagers.map((manager) => (
                      <div
                        key={manager.id}
                        className="p-3 bg-[#252d3d] rounded-lg border border-gray-800/30"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {manager.fullName.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                              {manager.fullName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{manager.email}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Кнопки действий */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-[#1e2533] hover:bg-[#2a3347] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all"
          >
            Отмена
          </button>
          <button
            onClick={handleReassign}
            disabled={loading || !fromBranchId || !toBranchId || selectedManagerIds.length === 0}
            className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" size={16} />
                Переназначение...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Переназначить ({selectedManagerIds.length})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
