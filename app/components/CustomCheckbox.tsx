'use client';

import { Check } from 'lucide-react';

interface CustomCheckboxProps {
  id: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
}

export default function CustomCheckbox({
  id,
  checked,
  onChange,
  label,
  disabled = false,
}: CustomCheckboxProps) {
  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        id={id}
        onClick={onChange}
        disabled={disabled}
        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
          checked
            ? 'bg-violet-500'
            : 'bg-transparent border-2 border-gray-600 hover:border-violet-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {checked && <Check className="text-white" size={14} strokeWidth={2.5} />}
      </button>
      <label
        htmlFor={id}
        className={`text-sm font-medium select-none ${
          disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        } ${checked ? 'text-white' : 'text-gray-500'}`}
        onClick={!disabled ? onChange : undefined}
      >
        {label}
      </label>
    </div>
  );
}
