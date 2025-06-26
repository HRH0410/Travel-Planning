import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DemandInputPage as OriginalDemandInputPage } from './DemandInputPage';
import { UserDemand } from '../types';
import { startPlanningSession } from '../services/geminiService';

const DemandInputPageWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmitDemand = useCallback(async (demand: UserDemand) => {
    setIsLoading(true);
    
    try {
      const { taskId } = await startPlanningSession(demand);
      // Navigate to planning page with taskId in URL and demand data in state
      navigate(`/planning/${taskId}`, { 
        state: { 
          taskId, 
          demand,
          timestamp: Date.now() // Add timestamp to ensure fresh state
        } 
      });
    } catch (error: any) {
      console.error('Failed to start planning session:', error);
      setIsLoading(false);
      // You might want to show an error message here
    }
  }, [navigate]);

  return (
    <OriginalDemandInputPage 
      onSubmitDemand={handleSubmitDemand} 
      isLoading={isLoading} 
    />
  );
};

export default DemandInputPageWrapper;
