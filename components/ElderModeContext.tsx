import React, { createContext, useContext } from 'react';
import { useElderMode } from '../hooks/useElderMode';

interface ElderModeContextType {
  isElderMode: boolean;
  toggleElderMode: () => void;
}

// 在控制台中记录老人模式的状态变化，方便调试
const logStateChange = (isElderMode: boolean) => {
  console.log(`老人模式状态: ${isElderMode ? '启用' : '禁用'}`);
};

const ElderModeContext = createContext<ElderModeContextType | undefined>(undefined);

export const ElderModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const elderMode = useElderMode();
  
  // 每当状态变化时，记录日志
  React.useEffect(() => {
    logStateChange(elderMode.isElderMode);
  }, [elderMode.isElderMode]);
  
  return <ElderModeContext.Provider value={elderMode}>{children}</ElderModeContext.Provider>;
};

export const useElderModeContext = () => {
  const context = useContext(ElderModeContext);
  if (context === undefined) {
    throw new Error('useElderModeContext must be used within an ElderModeProvider');
  }
  return context;
};
