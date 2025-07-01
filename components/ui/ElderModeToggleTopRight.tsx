import React from 'react';
import { useElderModeContext } from '../ElderModeContext';

export const ElderModeToggleTopRight: React.FC = () => {
  const { isElderMode, toggleElderMode } = useElderModeContext();

  return (
    <button
      onClick={toggleElderMode}
      className={`fixed top-6 right-6 z-[99] px-4 py-3 rounded-full shadow-lg 
        focus:outline-none focus:ring-3 focus:ring-offset-2 
        transition-all duration-300 ease-in-out font-medium text-sm
        backdrop-blur-sm border-2
        ${isElderMode 
          ? 'bg-blue-500/90 text-white border-blue-400 hover:bg-blue-600/90 focus:ring-blue-300' 
          : 'bg-white/90 text-gray-700 border-gray-200 hover:bg-gray-50/90 focus:ring-gray-300'
        }`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        minWidth: '120px',
        justifyContent: 'center',
        boxShadow: isElderMode 
          ? '0 8px 25px rgba(59, 130, 246, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)' 
          : '0 4px 15px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)'
      }}
      title={isElderMode ? '退出关怀模式' : '开启老人关怀模式'}
    >
      <span role="img" aria-label="关怀模式图标" style={{ fontSize: '16px' }}>
        {isElderMode ? '👴' : '👵'}
      </span>
      <span>{isElderMode ? '退出关怀' : '关怀模式'}</span>
    </button>
  );
};
