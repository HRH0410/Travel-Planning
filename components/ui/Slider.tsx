import React, { useState, useEffect } from 'react';

interface SliderProps {
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

export const Slider: React.FC<SliderProps> = ({
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
      glow: 'shadow-blue-400/30'
    },
    purple: {
      bg: 'from-purple-400 to-purple-600',
      shadow: 'shadow-purple-500/50',
      glow: 'shadow-purple-400/30'
    },
    green: {
      bg: 'from-green-400 to-green-600',
      shadow: 'shadow-green-500/50',
      glow: 'shadow-green-400/30'
    },
    orange: {
      bg: 'from-orange-400 to-orange-600',
      shadow: 'shadow-orange-500/50',
      glow: 'shadow-orange-400/30'
    },
    pink: {
      bg: 'from-pink-400 to-pink-600',
      shadow: 'shadow-pink-500/50',
      glow: 'shadow-pink-400/30'
    }
  };

  const currentColor = colorClasses[color];

  return (
    <div className={`w-full space-y-3 ${className}`}>
      {/* Label and Value Display */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {icon && (
            <div className="text-gray-600 dark:text-gray-400">
              {icon}
            </div>
          )}
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        </div>
        <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${currentColor.bg} text-white text-sm font-medium shadow-lg ${currentColor.shadow} transform transition-all duration-300 ${isDragging ? 'scale-110' : ''}`}>
          {formatValue ? formatValue(localValue) : `${localValue}${unit}`}
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative group">
        {/* Track */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
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
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer appearance-none z-10"
          style={{
            background: 'transparent',
            pointerEvents: 'all',
          }}
        />

        {/* Thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-gradient-to-r ${currentColor.bg} transform transition-all duration-300 ${isDragging ? 'scale-125' : 'scale-100'} group-hover:scale-110 ${currentColor.glow} z-5 pointer-events-none`}
          style={{
            left: `calc(${percentage}% - 12px)`,
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

        {/* Tick Marks */}
        <div className="absolute top-full mt-2 w-full flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{min}{unit}</span>
          <span>{max}{unit}</span>
        </div>
      </div>
    </div>
  );
};

// Range Slider Component for Min-Max selection
interface RangeSliderProps {
  label: string;
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  onChange: (minValue: number, maxValue: number) => void;
  step?: number;
  unit?: string;
  formatValue?: (value: number) => string;
  icon?: React.ReactNode;
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'pink';
  className?: string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  label,
  min,
  max,
  minValue,
  maxValue,
  onChange,
  step = 1,
  unit = '',
  formatValue,
  icon,
  color = 'blue',
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const [tempMin, setTempMin] = useState(minValue);
  const [tempMax, setTempMax] = useState(maxValue);

  useEffect(() => {
    setTempMin(minValue);
    setTempMax(maxValue);
  }, [minValue, maxValue]);

  const minPercentage = ((tempMin - min) / (max - min)) * 100;
  const maxPercentage = ((tempMax - min) / (max - min)) * 100;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinValue = Number(e.target.value);
    if (newMinValue <= tempMax) {
      setTempMin(newMinValue);
      onChange(newMinValue, tempMax);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMaxValue = Number(e.target.value);
    if (newMaxValue >= tempMin) {
      setTempMax(newMaxValue);
      onChange(tempMin, newMaxValue);
    }
  };

  const handleMinMouseDown = () => {
    setIsDragging('min');
  };

  const handleMaxMouseDown = () => {
    setIsDragging('max');
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const colorClasses = {
    blue: {
      bg: 'from-blue-400 to-blue-600',
      shadow: 'shadow-blue-500/50',
      glow: 'shadow-blue-400/30'
    },
    purple: {
      bg: 'from-purple-400 to-purple-600',
      shadow: 'shadow-purple-500/50',
      glow: 'shadow-purple-400/30'
    },
    green: {
      bg: 'from-green-400 to-green-600',
      shadow: 'shadow-green-500/50',
      glow: 'shadow-green-400/30'
    },
    orange: {
      bg: 'from-orange-400 to-orange-600',
      shadow: 'shadow-orange-500/50',
      glow: 'shadow-orange-400/30'
    },
    pink: {
      bg: 'from-pink-400 to-pink-600',
      shadow: 'shadow-pink-500/50',
      glow: 'shadow-pink-400/30'
    }
  };

  const currentColor = colorClasses[color];

  return (
    <div className={`w-full space-y-3 ${className}`}>
      {/* Label and Value Display */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {icon && (
            <div className="text-gray-600 dark:text-gray-400">
              {icon}
            </div>
          )}
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        </div>
        <div className="flex space-x-2">
          <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${currentColor.bg} text-white text-sm font-medium shadow-lg ${currentColor.shadow}`}>
            {formatValue ? formatValue(tempMin) : `${tempMin}${unit}`}
          </div>
          <span className="text-gray-500 dark:text-gray-400">-</span>
          <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${currentColor.bg} text-white text-sm font-medium shadow-lg ${currentColor.shadow}`}>
            {formatValue ? formatValue(tempMax) : `${tempMax}${unit}`}
          </div>
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative group">
        {/* Track */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
          {/* Progress */}
          <div
            className={`absolute h-full bg-gradient-to-r ${currentColor.bg} transition-all duration-300 ease-out shadow-lg ${currentColor.glow}`}
            style={{
              left: `${minPercentage}%`,
              width: `${maxPercentage - minPercentage}%`
            }}
          />
        </div>

        {/* Min Slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={tempMin}
          onChange={handleMinChange}
          onMouseDown={handleMinMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMinMouseDown}
          onTouchEnd={handleMouseUp}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer appearance-none"
          style={{ 
            background: 'transparent',
            pointerEvents: 'all',
            zIndex: isDragging === 'min' ? 40 : 30
          }}
        />

        {/* Max Slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={tempMax}
          onChange={handleMaxChange}
          onMouseDown={handleMaxMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMaxMouseDown}
          onTouchEnd={handleMouseUp}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer appearance-none"
          style={{ 
            background: 'transparent',
            pointerEvents: 'all',
            zIndex: isDragging === 'max' ? 40 : 35
          }}
        />

        {/* Min Thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-gradient-to-r ${currentColor.bg} transform transition-all duration-300 group-hover:scale-110 ${currentColor.glow} ${isDragging === 'min' ? 'scale-125' : ''} pointer-events-none`}
          style={{
            left: `calc(${minPercentage}% - 12px)`,
            zIndex: isDragging === 'min' ? 50 : (tempMin >= tempMax ? 12 : 11)
          }}
        >
          <div className={`w-full h-full rounded-full bg-gradient-to-br ${currentColor.bg} opacity-80`} />
        </div>

        {/* Max Thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-gradient-to-r ${currentColor.bg} transform transition-all duration-300 group-hover:scale-110 ${currentColor.glow} ${isDragging === 'max' ? 'scale-125' : ''} pointer-events-none`}
          style={{
            left: `calc(${maxPercentage}% - 12px)`,
            zIndex: isDragging === 'max' ? 50 : (tempMax >= tempMin ? 12 : 11)
          }}
        >
          <div className={`w-full h-full rounded-full bg-gradient-to-br ${currentColor.bg} opacity-80`} />
        </div>

        {/* Tick Marks */}
        <div className="absolute top-full mt-2 w-full flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{min}{unit}</span>
          <span>{max}{unit}</span>
        </div>
      </div>
    </div>
  );
};
