import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string | number;
  onChange: (value: any) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  className = '',
  buttonClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full py-2.5 px-3.5 rounded-xl border border-white/10 bg-[#171424] hover:bg-[#1f1b30] text-white font-medium text-xs flex items-center justify-between focus:ring-2 focus:ring-violet-500 outline-none transition-all duration-200 cursor-pointer ${
          isOpen ? 'ring-2 ring-violet-500 border-violet-500/50' : ''
        } ${buttonClassName}`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown
          className={`w-4 h-4 text-violet-400 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? 'rotate-180 text-violet-300' : ''
          }`}
        />
      </button>

      {/* Smooth Popover Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[999] p-1.5 rounded-xl border border-white/10 bg-[#171424] backdrop-blur-2xl shadow-2xl shadow-black/80 animate-in fade-in-0 zoom-in-95 duration-150 max-h-60 overflow-y-auto custom-scrollbar">
          {options.map((option) => {
            const isSelected = String(option.value) === String(value);
            return (
              <button
                key={String(option.value)}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-all duration-150 cursor-pointer text-left ${
                  isSelected
                    ? 'bg-violet-600/20 text-violet-300 font-bold border border-violet-500/30'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-violet-400 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
