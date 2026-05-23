import { useState, useRef, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, MapPin, Clock, Users, Check, Plus, Search } from 'lucide-react';
import { useBlockScroll } from '@/app/hooks/useBlockScroll';
import CustomSelect from '@/app/components/CustomSelect';
import CityAutocomplete from '@/app/components/CityAutocomplete';
import DistrictAutocomplete from '@/app/components/DistrictAutocomplete';
import AddressAutocomplete from '@/app/components/AddressAutocomplete';
import PhoneInput from '@/app/components/PhoneInput';
import EmailInput from '@/app/components/EmailInput';
import CustomCheckbox from '@/app/components/CustomCheckbox';

interface Manager {
  id: string;
  fullName: string;
  email: string;
  branchUsers?: Array<{
    branchId: string;
  }>;
}

interface AddBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  managers: Manager[];
}

interface FormData {
  name: string;
  code: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  latitude: number | null;
  longitude: number | null;
  openTime: string;
  closeTime: string;
  workDays: string[];
  managerIds: string[];
  // Дополнительные данные для Google Places
  cityPlaceId?: string;
  districtPlaceId?: string;
  addressPlaceId?: string;
  // Время работы для каждого дня
  schedule: {
    [key: string]: {
      isWorking: boolean;
      openTime: string;
      closeTime: string;
    };
  };
}

export default function AddBranchModal({
  isOpen,
  onClose,
  onSuccess,
  managers,
}: AddBranchModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Блокируем скролл страницы при открытии модального окна
  useBlockScroll(isOpen);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    code: '',
    city: '',
    district: '',
    address: '',
    phone: '',
    email: '',
    latitude: null,
    longitude: null,
    openTime: '09:00',
    closeTime: '18:00',
    workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    managerIds: [],
    schedule: {
      monday: { isWorking: true, openTime: '09:00', closeTime: '18:00' },
      tuesday: { isWorking: true, openTime: '09:00', closeTime: '18:00' },
      wednesday: { isWorking: true, openTime: '09:00', closeTime: '18:00' },
      thursday: { isWorking: true, openTime: '09:00', closeTime: '18:00' },
      friday: { isWorking: true, openTime: '09:00', closeTime: '18:00' },
      saturday: { isWorking: false, openTime: '09:00', closeTime: '18:00' },
      sunday: { isWorking: false, openTime: '09:00', closeTime: '18:00' },
    },
  });

  const [selectedManagerForAdd, setSelectedManagerForAdd] = useState('');

  // Автоматический скролл вверх при открытии модального окна
  useEffect(() => {
    if (isOpen && modalContainerRef.current) {
      setTimeout(() => {
        if (modalContainerRef.current) {
          modalContainerRef.current.scrollTop = 0;
        }
      }, 50);
    }
  }, [isOpen]);

  const steps = [
    { number: 1, title: 'Основная информация', icon: MapPin },
    { number: 2, title: 'Режим работы', icon: Clock },
    { number: 3, title: 'Менеджеры', icon: Users },
  ];

  const weekDays = [
    { value: 'monday', label: 'Пн' },
    { value: 'tuesday', label: 'Вт' },
    { value: 'wednesday', label: 'Ср' },
    { value: 'thursday', label: 'Чт' },
    { value: 'friday', label: 'Пт' },
    { value: 'saturday', label: 'Сб' },
    { value: 'sunday', label: 'Вс' },
  ];

  // Обработка выбора города
  const handleCitySelect = (value: string, cityData?: any) => {
    setFormData({
      ...formData,
      city: value,
      // Обновляем координаты если есть
      ...(cityData && {
        latitude: cityData.lat,
        longitude: cityData.lon,
      }),
    });
  };

  // Обработка выбора адреса
  const handleAddressSelect = (value: string, addressData?: any) => {
    setFormData({
      ...formData,
      address: value,
      // Обновляем координаты если есть
      ...(addressData && {
        latitude: addressData.lat,
        longitude: addressData.lon,
      }),
    });
  };

  // Переключение рабочих дней
  const toggleWorkDay = (day: string) => {
    setFormData({
      ...formData,
      workDays: formData.workDays.includes(day)
        ? formData.workDays.filter(d => d !== day)
        : [...formData.workDays, day],
    });
  };

  // Переключение рабочего дня в расписании
  const toggleScheduleDay = (day: string) => {
    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule,
        [day]: {
          ...formData.schedule[day],
          isWorking: !formData.schedule[day].isWorking,
        },
      },
    });
  };

  // Обновление времени открытия для дня
  const updateDayOpenTime = (day: string, time: string) => {
    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule,
        [day]: {
          ...formData.schedule[day],
          openTime: time,
        },
      },
    });
  };

  // Обновление времени закрытия для дня
  const updateDayCloseTime = (day: string, time: string) => {
    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule,
        [day]: {
          ...formData.schedule[day],
          closeTime: time,
        },
      },
    });
  };

  // Добавить менеджера
  const addManager = () => {
    if (selectedManagerForAdd && !formData.managerIds.includes(selectedManagerForAdd)) {
      setFormData({
        ...formData,
        managerIds: [...formData.managerIds, selectedManagerForAdd],
      });
      setSelectedManagerForAdd('');
    }
  };

  // Удалить менеджера
  const removeManager = (managerId: string) => {
    setFormData({
      ...formData,
      managerIds: formData.managerIds.filter(id => id !== managerId),
    });
  };

  // Валидация шага
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.name &&
          formData.code &&
          formData.city &&
          formData.district &&
          formData.address &&
          formData.phone &&
          formData.email
        );
      case 2:
        // Проверяем, что хотя бы один день отмечен как рабочий
        const hasWorkingDay = Object.values(formData.schedule).some(day => day.isWorking);
        // Проверяем, что у всех рабочих дней указано время
        const allWorkingDaysHaveTime = Object.values(formData.schedule).every(day => {
          if (!day.isWorking) return true;
          return day.openTime && day.closeTime;
        });
        return hasWorkingDay && allWorkingDaysHaveTime;
      case 3:
        return true; // Менеджеры опциональны
      default:
        return false;
    }
  };

  // Переход к следующему шагу
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Переход к предыдущему шагу
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Отправка формы
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Формируем данные для отправки
      const submitData = {
        ...formData,
        // Отправляем schedule вместо старых полей openTime, closeTime, workDays
        schedule: formData.schedule,
      };

      const response = await fetch('/api/admin/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
        handleClose();
      } else {
        alert(data.error || 'Ошибка при создании филиала');
      }
    } catch (error) {
      console.error('Error creating branch:', error);
      alert('Ошибка при создании филиала');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Закрытие модала
  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      name: '',
      code: '',
      city: '',
      district: '',
      address: '',
      phone: '',
      email: '',
      latitude: null,
      longitude: null,
      openTime: '09:00',
      closeTime: '18:00',
      workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      managerIds: [],
      schedule: {
        monday: { isWorking: true, openTime: '09:00', closeTime: '18:00' },
        tuesday: { isWorking: true, openTime: '09:00', closeTime: '18:00' },
        wednesday: { isWorking: true, openTime: '09:00', closeTime: '18:00' },
        thursday: { isWorking: true, openTime: '09:00', closeTime: '18:00' },
        friday: { isWorking: true, openTime: '09:00', closeTime: '18:00' },
        saturday: { isWorking: false, openTime: '09:00', closeTime: '18:00' },
        sunday: { isWorking: false, openTime: '09:00', closeTime: '18:00' },
      },
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={modalContainerRef}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto no-scrollbar"
    >
        <div 
          ref={modalRef}
          className="bg-[#252d3d] rounded-2xl max-w-3xl w-full border border-gray-800/50 my-4 max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800/50 flex-shrink-0">
            <div>
              <h3 className="text-lg font-bold text-white">Добавить филиал</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Шаг {currentStep} из {steps.length}: {steps[currentStep - 1].title}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-[#1e2533] rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-4 py-2 border-b border-gray-800/50 flex-shrink-0">
            <div className="flex items-center">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;
                
                return (
                  <div key={step.number} className="flex items-center">
                    <div className="flex flex-col items-center" style={{ width: '140px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (step.number !== currentStep) {
                            setCurrentStep(step.number);
                          }
                        }}
                        disabled={isActive}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer hover:scale-110'
                            : isActive
                            ? 'bg-violet-500 text-white cursor-default'
                            : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white cursor-pointer hover:scale-110 border border-blue-500/50'
                        }`}
                        title={
                          isActive
                            ? 'Текущий шаг'
                            : `Перейти к шагу: ${step.title}`
                        }
                      >
                        {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                      </button>
                      <p
                        className={`text-xs font-medium mt-1.5 text-center ${
                          isActive 
                            ? 'text-white' 
                            : isCompleted 
                            ? 'text-emerald-400' 
                            : 'text-blue-400'
                        }`}
                      >
                        {step.title}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-0.5 transition-all ${
                          isCompleted ? 'bg-emerald-500' : 'bg-gray-700'
                        }`}
                        style={{ width: '120px' }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <div className="p-4">
              {/* Шаг 1: Основная информация */}
              {currentStep === 1 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Название филиала *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2.5 bg-[#1e2533] border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white text-sm"
                        placeholder="Филиал №1"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Код филиала *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="w-full px-3 py-2.5 bg-[#1e2533] border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white font-mono text-sm"
                        placeholder="BR001"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <CityAutocomplete
                      value={formData.city}
                      onChange={handleCitySelect}
                      placeholder="Введите название города"
                      label="Город"
                      required
                    />

                    <DistrictAutocomplete
                      value={formData.district}
                      onChange={(value) => setFormData({ ...formData, district: value })}
                      placeholder="Выберите район"
                      label="Район"
                      required
                      city={formData.city}
                    />
                  </div>

                  <AddressAutocomplete
                    value={formData.address}
                    onChange={handleAddressSelect}
                    placeholder="Введите адрес (улица, номер дома)"
                    label="Адрес"
                    required
                    city={formData.city}
                    district={formData.district}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <PhoneInput
                      value={formData.phone}
                      onChange={(value) => setFormData({ ...formData, phone: value })}
                      placeholder="+996 XXX XXX XXX"
                      label="Телефон"
                      required
                    />

                    <EmailInput
                      value={formData.email}
                      onChange={(value) => setFormData({ ...formData, email: value })}
                      placeholder="branch@example.com"
                      label="Email"
                      required
                    />
                  </div>

                  {/* Координаты (опционально) */}
                  {formData.latitude && formData.longitude && (
                    <div className="bg-[#1e2533] rounded-lg p-3 border border-gray-800/30">
                      <p className="text-xs text-gray-400">
                        📍 Координаты: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Шаг 2: Режим работы */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      Режим работы по дням недели *
                    </label>
                    
                    <div className="space-y-2">
                      {weekDays.map((day) => {
                        const daySchedule = formData.schedule[day.value];
                        return (
                          <div
                            key={day.value}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                              daySchedule.isWorking
                                ? 'bg-violet-500/5 border-violet-500/30'
                                : 'bg-[#1e2533] border-gray-700/50'
                            }`}
                          >
                            {/* Чекбокс и название дня */}
                            <div className="w-36">
                              <CustomCheckbox
                                id={`day-${day.value}`}
                                checked={daySchedule.isWorking}
                                onChange={() => toggleScheduleDay(day.value)}
                                label={
                                  day.label === 'Пн' ? 'Понедельник' :
                                  day.label === 'Вт' ? 'Вторник' :
                                  day.label === 'Ср' ? 'Среда' :
                                  day.label === 'Чт' ? 'Четверг' :
                                  day.label === 'Пт' ? 'Пятница' :
                                  day.label === 'Сб' ? 'Суббота' :
                                  'Воскресенье'
                                }
                              />
                            </div>

                            {/* Время работы */}
                            <div className="flex items-center gap-2 flex-1">
                              <div className="flex-1 relative">
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                                  <div className="w-6 h-6 bg-violet-500 rounded-md flex items-center justify-center">
                                    <Clock className="text-white" size={12} />
                                  </div>
                                </div>
                                <input
                                  type="time"
                                  value={daySchedule.openTime}
                                  onChange={(e) => updateDayOpenTime(day.value, e.target.value)}
                                  disabled={!daySchedule.isWorking}
                                  style={{
                                    colorScheme: 'dark'
                                  }}
                                  className={`w-full pl-10 pr-3 py-2 bg-[#1e2533] border rounded-lg text-sm transition-all [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer ${
                                    daySchedule.isWorking
                                      ? 'border-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50'
                                      : 'border-gray-800/50 text-gray-600 cursor-not-allowed'
                                  }`}
                                />
                              </div>
                              <span className={`text-sm ${daySchedule.isWorking ? 'text-gray-400' : 'text-gray-600'}`}>
                                —
                              </span>
                              <div className="flex-1 relative">
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                                  <div className="w-6 h-6 bg-violet-500 rounded-md flex items-center justify-center">
                                    <Clock className="text-white" size={12} />
                                  </div>
                                </div>
                                <input
                                  type="time"
                                  value={daySchedule.closeTime}
                                  onChange={(e) => updateDayCloseTime(day.value, e.target.value)}
                                  disabled={!daySchedule.isWorking}
                                  style={{
                                    colorScheme: 'dark'
                                  }}
                                  className={`w-full pl-10 pr-3 py-2 bg-[#1e2533] border rounded-lg text-sm transition-all [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer ${
                                    daySchedule.isWorking
                                      ? 'border-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50'
                                      : 'border-gray-800/50 text-gray-600 cursor-not-allowed'
                                  }`}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Ошибка валидации */}
                    {!Object.values(formData.schedule).some(day => day.isWorking) && (
                      <p className="text-red-400 text-xs mt-2">
                        Выберите хотя бы один рабочий день
                      </p>
                    )}
                  </div>

                  {/* Предпросмотр */}
                  <div className="bg-[#1e2533] rounded-lg p-4 border border-gray-800/30">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="text-white" size={16} />
                      </div>
                      <div>
                        <h4 className="text-white font-medium text-sm">Предпросмотр режима работы</h4>
                        <p className="text-gray-400 text-xs">Как это будет отображаться</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {weekDays.map((day) => {
                        const daySchedule = formData.schedule[day.value];
                        if (!daySchedule.isWorking) return null;
                        
                        return (
                          <div key={day.value} className="flex items-center justify-between">
                            <span className="text-gray-300 text-xs">
                              {day.label === 'Пн' && 'Понедельник'}
                              {day.label === 'Вт' && 'Вторник'}
                              {day.label === 'Ср' && 'Среда'}
                              {day.label === 'Чт' && 'Четверг'}
                              {day.label === 'Пт' && 'Пятница'}
                              {day.label === 'Сб' && 'Суббота'}
                              {day.label === 'Вс' && 'Воскресенье'}:
                            </span>
                            <span className="text-white font-medium text-xs">
                              {daySchedule.openTime} - {daySchedule.closeTime}
                            </span>
                          </div>
                        );
                      })}
                      {!Object.values(formData.schedule).some(day => day.isWorking) && (
                        <p className="text-gray-500 text-xs text-center py-2">
                          Нет рабочих дней
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Подсказка внизу */}
                  <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="text-blue-400 mt-0.5">💡</div>
                    <p className="text-sm text-blue-300">
                      Если день не отмечен, филиал не работает в этот день
                    </p>
                  </div>
                </div>
              )}

              {/* Шаг 3: Менеджеры */}
              {currentStep === 3 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-2">
                      Менеджеры (опционально)
                    </label>
                    
                    {/* Выбранные менеджеры (чипсы сверху) */}
                    {formData.managerIds.length > 0 && (
                      <div className="mb-3 p-3 bg-[#1e2533] rounded-lg border border-gray-700/50">
                        <div className="flex flex-wrap gap-2">
                          {formData.managerIds.map((managerId) => {
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
                                  onClick={() => removeManager(managerId)}
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
                          value={selectedManagerForAdd}
                          onChange={(e) => setSelectedManagerForAdd(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-[#1e2533] border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm text-white placeholder-gray-500"
                        />
                      </div>
                    </div>

                    {/* Список доступных менеджеров */}
                    <div className="max-h-64 overflow-y-auto space-y-1.5 bg-[#1e2533] rounded-xl border border-gray-700/50 p-2">
                      {managers
                        .filter(m => {
                          // Фильтр по поиску
                          const searchLower = selectedManagerForAdd.toLowerCase();
                          const matchesSearch = !searchLower || 
                            m.fullName.toLowerCase().includes(searchLower) ||
                            m.email.toLowerCase().includes(searchLower);
                          
                          if (!matchesSearch) return false;
                          
                          // Показываем только менеджеров без филиала
                          return !m.branchUsers || m.branchUsers.length === 0;
                        })
                        .map((manager) => {
                          const isSelected = formData.managerIds.includes(manager.id);
                          return (
                            <button
                              key={manager.id}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  removeManager(manager.id);
                                } else {
                                  setFormData({
                                    ...formData,
                                    managerIds: [...formData.managerIds, manager.id],
                                  });
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
                        const searchLower = selectedManagerForAdd.toLowerCase();
                        const matchesSearch = !searchLower || 
                          m.fullName.toLowerCase().includes(searchLower) ||
                          m.email.toLowerCase().includes(searchLower);
                        
                        if (!matchesSearch) return false;
                        
                        return !m.branchUsers || m.branchUsers.length === 0;
                      }).length === 0 && (
                        <div className="text-center py-8 text-gray-500 text-sm">
                          {selectedManagerForAdd ? 'Менеджеры не найдены' : 'Нет доступных менеджеров'}
                        </div>
                      )}
                    </div>
                  </div>

                  {formData.managerIds.length === 0 && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-2">
                      <div className="text-blue-400 mt-0.5">💡</div>
                      <p className="text-sm text-blue-300">
                        Менеджеры не добавлены. Вы можете добавить их сейчас или позже.
                        Менеджеры не добавлены. Вы можете добавить их сейчас или позже.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-800/50 flex-shrink-0">
            <button
              onClick={currentStep === 1 ? handleClose : prevStep}
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-[#1e2533] hover:bg-[#2a3347] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all flex items-center gap-2 text-sm"
            >
              {currentStep === 1 ? (
                <>
                  <X size={16} />
                  Отмена
                </>
              ) : (
                <>
                  <ChevronLeft size={16} />
                  Назад
                </>
              )}
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className="px-4 py-2.5 bg-violet-500 hover:bg-violet-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all flex items-center gap-2 text-sm"
              >
                Далее
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all flex items-center gap-2 text-sm"
              >
                {isSubmitting ? 'Создание...' : 'Создать филиал'}
                <Check size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
  );
}