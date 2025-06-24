
import React from 'react';

interface TagProps {
  text: string;
  onRemove?: () => void;
  color?: string; // Tailwind color class e.g., 'bg-blue-100 text-blue-800'
}

export const Tag: React.FC<TagProps> = ({ text, onRemove, color }) => {
  const baseColor = color || 'bg-gray-200 text-gray-700';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${baseColor} mr-2 mb-2`}
    >
      {text}
      {onRemove && (
        <button
          type="button"
          className="flex-shrink-0 ml-1.5 -mr-0.5 p-0.5 rounded-full inline-flex items-center justify-center text-gray-400 hover:bg-gray-300 hover:text-gray-500 focus:outline-none focus:bg-gray-500 focus:text-white transition-colors duration-150"
          onClick={onRemove}
        >
          <span className="sr-only">移除</span>
          <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
            <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
          </svg>
        </button>
      )}
    </span>
  );
};
