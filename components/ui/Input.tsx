
import React, { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  floatingLabel?: boolean;
  error?: string;
  success?: boolean;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  id, 
  className = '', 
  icon, 
  floatingLabel = false,
  error,
  success = false,
  value,
  ...props 
}) => {
  const [focused, setFocused] = useState(false);
  const hasValue = value !== undefined && value !== '';

  if (floatingLabel) {
    return (
      <div className="w-full relative">
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <div className={`transition-colors duration-200 ${
                error ? 'text-red-500' : 
                success ? 'text-green-500' : 
                focused ? 'text-blue-500' : 'text-gray-400'
              }`}>
                {icon}
              </div>
            </div>
          )}
          <input
            id={id}
            value={value}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`
              peer w-full px-3 py-4 pt-6 border rounded-xl placeholder-transparent
              focus:outline-none transition-all duration-200
              ${icon ? 'pl-10' : ''}
              ${error ? 
                'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 
                success ?
                'border-green-300 focus:border-green-500 focus:ring-green-500/20' :
                'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
              }
              ${focused || hasValue ? 'ring-4' : ''}
              bg-white/50 backdrop-blur-sm
              ${className}
            `}
            {...props}
          />
          <label
            htmlFor={id}
            className={`
              absolute transition-all duration-200 pointer-events-none
              ${icon ? 'left-10' : 'left-3'}
              ${focused || hasValue ? 
                'top-1 text-xs transform -translate-y-0.5 px-1 bg-white rounded' : 
                'top-4 text-sm'
              }
              ${error ? 'text-red-500' : 
                success ? 'text-green-500' : 
                focused ? 'text-blue-500' : 'text-gray-500'
              }
              font-medium
            `}
          >
            {label}
          </label>
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </p>
        )}
        {success && !error && (
          <p className="mt-1 text-sm text-green-600 flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>完美！</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className={`transition-colors duration-200 ${
              error ? 'text-red-500' : 
              success ? 'text-green-500' : 
              'text-gray-400'
            }`}>
              {icon}
            </div>
          </div>
        )}
        <input
          id={id}
          value={value}
          className={`
            block w-full px-3 py-3 border rounded-xl placeholder-gray-400 
            focus:outline-none transition-all duration-200 backdrop-blur-sm
            ${icon ? 'pl-10' : ''}
            ${error ? 
              'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 bg-red-50/50' : 
              success ?
              'border-green-300 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 bg-green-50/50' :
              'border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 bg-white/50'
            }
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </p>
      )}
      {success && !error && (
        <p className="mt-2 text-sm text-green-600 flex items-center space-x-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>完美！</span>
        </p>
      )}
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  floatingLabel?: boolean;
  error?: string;
  success?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({ 
  label, 
  id, 
  className = '', 
  floatingLabel = false,
  error,
  success = false,
  value,
  ...props 
}) => {
  const [focused, setFocused] = useState(false);
  const hasValue = value !== undefined && value !== '';

  if (floatingLabel) {
    return (
      <div className="w-full relative">
        <div className="relative">
          <textarea
            id={id}
            value={value}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`
              peer w-full px-3 py-4 pt-6 border rounded-xl placeholder-transparent resize-none
              focus:outline-none transition-all duration-200
              ${error ? 
                'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 
                success ?
                'border-green-300 focus:border-green-500 focus:ring-green-500/20' :
                'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
              }
              ${focused || hasValue ? 'ring-4' : ''}
              bg-white/50 backdrop-blur-sm
              ${className}
            `}
            rows={4}
            {...props}
          />
          <label
            htmlFor={id}
            className={`
              absolute left-3 transition-all duration-200 pointer-events-none
              ${focused || hasValue ? 
                'top-1 text-xs transform -translate-y-0.5 px-1 bg-white rounded' : 
                'top-4 text-sm'
              }
              ${error ? 'text-red-500' : 
                success ? 'text-green-500' : 
                focused ? 'text-blue-500' : 'text-gray-500'
              }
              font-medium
            `}
          >
            {label}
          </label>
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <textarea
        id={id}
        value={value}
        className={`
          block w-full px-3 py-3 border rounded-xl placeholder-gray-400 resize-none
          focus:outline-none transition-all duration-200 backdrop-blur-sm
          ${error ? 
            'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 bg-red-50/50' : 
            success ?
            'border-green-300 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 bg-green-50/50' :
            'border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 bg-white/50'
          }
          ${className}
        `}
        rows={4}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
