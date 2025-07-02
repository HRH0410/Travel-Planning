import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DemandInputPage } from './DemandInputPage';
import { UserDemand } from '../types';
import { startBackendPlanningSession, checkBackendConnection } from '../services/backendService';

const DemandInputPageWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 检查后端连接状态（仅用于日志记录）
  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkBackendConnection();
      console.log(`后端服务状态: ${isConnected ? '已连接' : '未连接'}`);
    };
    
    checkConnection();
  }, []);

  const handleSubmitDemand = useCallback(async (demand: UserDemand) => {
    // 强制检查后端连接状态
    const isConnected = await checkBackendConnection();
    if (!isConnected) {
      alert('后端服务未连接，请确保后端服务正在运行后再试');
      return;
    }

    setIsLoading(true);
    
    try {
      // 直接使用后端Python服务
      console.log('使用后端服务启动规划会话...');
      const result = await startBackendPlanningSession(demand);
      const taskId = result.taskId;
      
      // Navigate to planning page with taskId in URL and demand data in state
      navigate(`/planning/${taskId}`, { 
        state: { 
          taskId, 
          demand,
          useBackend: true,
          timestamp: Date.now()
        } 
      });
    } catch (error: any) {
      console.error('Failed to start planning session:', error);
      setIsLoading(false);
      alert('启动规划会话失败，请检查后端服务状态');
    }
  }, [navigate]);

  return (
    <DemandInputPage 
      onSubmitDemand={handleSubmitDemand} 
      isLoading={isLoading}
    />
  );
};

export default DemandInputPageWrapper;
