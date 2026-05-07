'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectDropdownProps {
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export default function MultiSelectDropdown({
  options,
  selectedValues,
  onChange,
  placeholder = 'Выберите...',
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const removeOption = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedValues.filter(v => v !== value));
  };

  const getSelectedLabels = () => {
    return options
      .filter(opt => selectedValues.includes(opt.value))
      .map(opt => opt.label);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-[#2a3347] border-2 border-violet-500 rounded-xl text-left text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all flex items-center justify-between text-sm"
      >
        <div className="flex-1 flex flex-wrap gap-1 mr-2">
          {selectedValues.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            getSelectedLabels().map((label, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-500/20 text-violet-300 rounded-md text-xs font-medium"
              >
                {label}
                <span
                  onClick={(e) => {
                    const value = options.find(opt => opt.label === label)?.value;
                    if (value) removeOption(value, e);
                  }}
                  className="hover:bg-violet-500/30 rounded cursor-pointer inline-flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </span>
              </span>
            ))
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#2a3347] border-2 border-violet-500/50 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-gray-400 text-sm">Нет доступных опций</div>
          ) : (
            options.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleOption(option.value)}
                  className={`w-full px-3 py-2 text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-violet-600 text-white'
                      : 'text-gray-300 hover:bg-[#353d52]'
                  }`}
                >
                  <span className="text-sm font-medium">{option.label}</span>
                  {isSelected && <Check className="w-4 h-4" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
