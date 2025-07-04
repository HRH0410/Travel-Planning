import React, { createContext, useContext } from 'react';
import { useElderMode } from '../hooks/useElderMode';

interface ElderModeContextType {
  isElderMode: boolean;
  toggleElderMode: () => void;
}

const ElderModeContext = createContext<ElderModeContextType | undefined>(undefined);

export const ElderModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const elderMode = useElderMode();
  
  return <ElderModeContext.Provider value={elderMode}>{children}</ElderModeContext.Provider>;
};

export const useElderModeContext = () => {
  const context = useContext(ElderModeContext);
  if (context === undefined) {
    throw new Error('useElderModeContext must be used within an ElderModeProvider');
  }
  return context;
};
