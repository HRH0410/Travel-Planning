import React, { useState, useEffect } from 'react';

interface EnhancedSliderProps {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  unit?: string;
  formatValue?: (value: number) => string;
  icon?: React.ReactNode;
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'pink';
  className?: string;
}

export const EnhancedSlider: React.FC<EnhancedSliderProps> = ({
  label,
  min,
  max,
  value,
  onChange,
  step = 1,
  unit = '',
  formatValue,
  icon,
  color = 'blue',
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setLocalValue(newValue);
    onChange(newValue);
  };

  const percentage = ((localValue - min) / (max - min)) * 100;

  const colorClasses = {
    blue: {
      bg: 'from-blue-400 to-blue-600',
      shadow: 'shadow-blue-500/50',
      glow: 'shadow-blue-400/30',
      text: 'from-blue-600 to-blue-800'
    },
    purple: {
      bg: 'from-purple-400 to-purple-600',
      shadow: 'shadow-purple-500/50',
      glow: 'shadow-purple-400/30',
      text: 'from-purple-600 to-purple-800'
    },
    green: {
      bg: 'from-green-400 to-green-600',
      shadow: 'shadow-green-500/50',
      glow: 'shadow-green-400/30',
      text: 'from-green-600 to-green-800'
    },
    orange: {
      bg: 'from-orange-400 to-orange-600',
      shadow: 'shadow-orange-500/50',
      glow: 'shadow-orange-400/30',
      text: 'from-orange-600 to-orange-800'
    },
    pink: {
      bg: 'from-pink-400 to-pink-600',
      shadow: 'shadow-pink-500/50',
      glow: 'shadow-pink-400/30',
      text: 'from-pink-600 to-pink-800'
    }
  };

  const currentColor = colorClasses[color];

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* Label and Value Display */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {icon && (
            <div className={`text-gray-600 bg-gradient-to-r ${currentColor.text} bg-clip-text text-transparent`}>
              {icon}
            </div>
          )}
          <label className={`text-base md:text-lg font-semibold bg-gradient-to-r ${currentColor.text} bg-clip-text text-transparent`}>
            {label}
          </label>
        </div>
        <div className={`px-4 py-1.5 rounded-xl bg-gradient-to-r ${currentColor.bg} text-white font-medium shadow-lg ${currentColor.shadow} transform transition-all duration-300 ${isDragging ? 'scale-110' : ''}`}>
          <span className="text-lg md:text-xl font-bold">{formatValue ? formatValue(localValue) : localValue}</span>
          {unit && <span className="ml-1 text-sm font-normal">{unit}</span>}
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative group pt-2 pb-3">
        {/* Min/Max labels */}
        <div className="flex justify-between items-center text-xs text-gray-500 mb-1 px-1">
          <span>{min}{unit}</span>
          <span>{max}{unit}</span>
        </div>
        
        {/* Track */}
        <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
          {/* Progress */}
          <div
            className={`h-full bg-gradient-to-r ${currentColor.bg} transition-all duration-300 ease-out shadow-lg ${currentColor.glow}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Slider Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute inset-0 w-full h-2.5 opacity-0 cursor-pointer appearance-none z-10"
          style={{
            background: 'transparent',
            pointerEvents: 'all',
          }}
        />

        {/* Thumb */}
        <div
          className={`absolute top-6 -translate-y-1/2 w-7 h-7 bg-white rounded-full shadow-xl border-2 transform transition-all duration-300 ${isDragging ? 'scale-125' : 'scale-100'} group-hover:scale-110 ${currentColor.glow} z-5 pointer-events-none`}
          style={{
            left: `calc(${percentage}% - 14px)`,
            borderImage: `linear-gradient(to right, ${color === 'blue' ? '#60a5fa, #3b82f6' : 
                                               color === 'purple' ? '#a78bfa, #8b5cf6' :
                                               color === 'green' ? '#4ade80, #22c55e' :
                                               color === 'orange' ? '#fb923c, #f97316' :
                                               '#f472b6, #ec4899'}) 1`,
            boxShadow: isDragging ? 
              `0 0 20px ${color === 'blue' ? 'rgba(59, 130, 246, 0.5)' : 
                          color === 'purple' ? 'rgba(147, 51, 234, 0.5)' :
                          color === 'green' ? 'rgba(34, 197, 94, 0.5)' :
                          color === 'orange' ? 'rgba(249, 115, 22, 0.5)' :
                          'rgba(236, 72, 153, 0.5)'}` :
              '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          {/* Inner Gradient */}
          <div className={`w-full h-full rounded-full bg-gradient-to-br ${currentColor.bg} opacity-80`} />
        </div>
      </div>
    </div>
  );
};
