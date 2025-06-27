import React from 'react';

interface SelectionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'indigo' | 'red' | 'yellow';
  className?: string;
  disabled?: boolean;
  badge?: string;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({
  title,
  description,
  icon,
  isSelected,
  onClick,
  color = 'blue',
  className = '',
  disabled = false,
  badge
}) => {
  const colorClasses = {
    blue: {
      selected: 'border-blue-500 bg-blue-50/80 shadow-blue-500/20',
      unselected: 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30',
      icon: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-800'
    },
    purple: {
      selected: 'border-purple-500 bg-purple-50/80 shadow-purple-500/20',
      unselected: 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/30',
      icon: 'text-purple-600',
      badge: 'bg-purple-100 text-purple-800'
    },
    green: {
      selected: 'border-green-500 bg-green-50/80 shadow-green-500/20',
      unselected: 'border-gray-200 hover:border-green-300 hover:bg-green-50/30',
      icon: 'text-green-600',
      badge: 'bg-green-100 text-green-800'
    },
    orange: {
      selected: 'border-orange-500 bg-orange-50/80 shadow-orange-500/20',
      unselected: 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/30',
      icon: 'text-orange-600',
      badge: 'bg-orange-100 text-orange-800'
    },
    pink: {
      selected: 'border-pink-500 bg-pink-50/80 shadow-pink-500/20',
      unselected: 'border-gray-200 hover:border-pink-300 hover:bg-pink-50/30',
      icon: 'text-pink-600',
      badge: 'bg-pink-100 text-pink-800'
    },
    indigo: {
      selected: 'border-indigo-500 bg-indigo-50/80 shadow-indigo-500/20',
      unselected: 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30',
      icon: 'text-indigo-600',
      badge: 'bg-indigo-100 text-indigo-800'
    },
    red: {
      selected: 'border-red-500 bg-red-50/80 shadow-red-500/20',
      unselected: 'border-gray-200 hover:border-red-300 hover:bg-red-50/30',
      icon: 'text-red-600',
      badge: 'bg-red-100 text-red-800'
    },
    yellow: {
      selected: 'border-yellow-500 bg-yellow-50/80 shadow-yellow-500/20',
      unselected: 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50/30',
      icon: 'text-yellow-600',
      badge: 'bg-yellow-100 text-yellow-800'
    }
  };

  const currentColor = colorClasses[color];

  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`
        relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 transform
        backdrop-blur-sm bg-white/50
        ${disabled ? 
          'opacity-50 cursor-not-allowed' : 
          isSelected ? 
            `${currentColor.selected} shadow-lg scale-105` : 
            `${currentColor.unselected} hover:scale-102`
        }
        ${className}
      `}
    >
      {/* Selection Indicator */}
      {isSelected && !disabled && (
        <div className="absolute top-2 right-2">
          <div className={`w-6 h-6 rounded-full bg-gradient-to-r from-${color}-400 to-${color}-600 flex items-center justify-center shadow-lg`}>
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      {/* Badge */}
      {badge && (
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${currentColor.badge}`}>
            {badge}
          </span>
        </div>
      )}

      {/* Icon */}
      <div className={`flex justify-center mb-3 ${badge ? 'mt-4' : ''}`}>
        <div className={`text-3xl ${isSelected && !disabled ? currentColor.icon : 'text-gray-500'} transition-colors duration-300`}>
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="text-center space-y-2">
        <h3 className={`font-semibold text-lg ${isSelected && !disabled ? 'text-gray-900' : 'text-gray-700'}`}>
          {title}
        </h3>
        <p className={`text-sm ${isSelected && !disabled ? 'text-gray-700' : 'text-gray-500'}`}>
          {description}
        </p>
      </div>

      {/* Hover Effect */}
      {!disabled && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      )}
    </div>
  );
};

// Multi-selection card grid
interface SelectionGridProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  columns?: number;
  className?: string;
}

export const SelectionGrid: React.FC<SelectionGridProps> = ({
  title,
  subtitle,
  children,
  columns = 3,
  className = ''
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          {title}
        </h2>
        {subtitle && (
          <p className="text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
      <div className={`grid gap-4 ${gridCols[columns as keyof typeof gridCols]}`}>
        {children}
      </div>
    </div>
  );
};

// Quick selection tags
interface QuickTagProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'indigo';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const QuickTag: React.FC<QuickTagProps> = ({
  label,
  isSelected,
  onClick,
  color = 'blue',
  size = 'md',
  disabled = false
}) => {
  const colorClasses = {
    blue: {
      selected: 'bg-blue-500 text-white shadow-blue-500/30',
      unselected: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200'
    },
    purple: {
      selected: 'bg-purple-500 text-white shadow-purple-500/30',
      unselected: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200'
    },
    green: {
      selected: 'bg-green-500 text-white shadow-green-500/30',
      unselected: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'
    },
    orange: {
      selected: 'bg-orange-500 text-white shadow-orange-500/30',
      unselected: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200'
    },
    pink: {
      selected: 'bg-pink-500 text-white shadow-pink-500/30',
      unselected: 'bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-200'
    },
    indigo: {
      selected: 'bg-indigo-500 text-white shadow-indigo-500/30',
      unselected: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200'
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const currentColor = colorClasses[color];
  const currentSize = sizeClasses[size];

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        ${currentSize} font-medium rounded-full border transition-all duration-200 transform
        ${disabled ? 
          'opacity-50 cursor-not-allowed' : 
          isSelected ? 
            `${currentColor.selected} shadow-lg scale-105` : 
            `${currentColor.unselected} hover:scale-105`
        }
        backdrop-blur-sm
      `}
    >
      {label}
    </button>
  );
};

// Tag cloud for multiple quick selections
interface TagCloudProps {
  title?: string;
  tags: { label: string; value: string; color?: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'indigo' }[];
  selectedTags: string[];
  onTagToggle: (value: string) => void;
  maxSelections?: number;
  className?: string;
}

export const TagCloud: React.FC<TagCloudProps> = ({
  title,
  tags,
  selectedTags,
  onTagToggle,
  maxSelections,
  className = ''
}) => {
  const isMaxReached = maxSelections ? selectedTags.length >= maxSelections : false;

  return (
    <div className={`space-y-3 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {title}
        </h3>
      )}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag.value);
          const isDisabled = !isSelected && isMaxReached;
          
          return (
            <QuickTag
              key={tag.value}
              label={tag.label}
              isSelected={isSelected}
              onClick={() => onTagToggle(tag.value)}
              color={tag.color || 'blue'}
              disabled={isDisabled}
            />
          );
        })}
      </div>
      {maxSelections && (
        <p className="text-sm text-gray-500">
          已选择 {selectedTags.length} / {maxSelections} 个标签
        </p>
      )}
    </div>
  );
};
