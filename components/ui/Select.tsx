import React, { useState, useRef, useEffect } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  error?: string;
  floatingLabel?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder,
  icon,
  error,
  floatingLabel = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(opt => opt.value === value);
  const hasValue = value !== undefined && value !== '';

  const id = `select-${label}`;

  if (floatingLabel) {
    return (
        <div className="w-full relative" ref={selectRef}>
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                        <div className={`transition-colors duration-200 ${
                            error ? 'text-red-500' :
                            focused ? 'text-blue-500' : 'text-gray-400'
                        }`}>
                            {icon}
                        </div>
                    </div>
                )}
                <div
                    onClick={() => { setIsOpen(!isOpen); setFocused(true); }}
                    onBlur={() => setFocused(false)}
                    tabIndex={0}
                    className={`
                        peer w-full px-3 py-4 pt-6 border rounded-xl cursor-pointer
                        focus:outline-none transition-all duration-200
                        elder:text-lg elder:px-4 elder:py-5 elder:pt-7
                        ${icon ? 'pl-10 elder:pl-12' : ''}
                        ${error ?
                            'border-red-300 focus:border-red-500 focus:ring-red-500/20' :
                            'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                        }
                        ${focused || hasValue ? 'ring-4' : ''}
                        bg-white/50 backdrop-blur-sm
                        ${className}
                    `}
                >
                    <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <label
                    htmlFor={id}
                    className={`
                        absolute transition-all duration-200 pointer-events-none
                        ${icon ? 'left-10 elder:left-12' : 'left-3 elder:left-4'}
                        ${focused || hasValue ?
                            'top-1 text-xs transform -translate-y-0.5 px-1 bg-white rounded elder:top-1.5 elder:text-sm' :
                            'top-3 text-sm elder:top-5 elder:text-base'
                        }
                        ${error ? 'text-red-500' :
                            focused ? 'text-blue-500' : 'text-gray-500'
                        }
                        font-medium
                    `}
                >
                    {label}
                </label>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
            {isOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    <ul>
                        {options.map(option => (
                            <li
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-gray-800 text-sm"
                            >
                                {option.label}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {error && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 elder:text-base">
                    <svg className="w-4 h-4 elder:w-5 elder:h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                </p>
            )}
        </div>
    );
  }

  // Non-floating label version
  return (
    <div className="w-full" ref={selectRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            block w-full px-3 py-3 border rounded-xl text-left
            focus:outline-none transition-all duration-200 backdrop-blur-sm
            elder:text-lg elder:px-4 elder:py-5
            ${error ?
              'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 bg-red-50/50' :
              'border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 bg-white/50'
            }
            ${className}
          `}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </button>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </div>
      </div>
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          <ul>
            {options.map(option => (
              <li
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-gray-800 text-sm"
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center space-x-1 elder:text-base">
          <svg className="w-4 h-4 elder:w-5 elder:h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
