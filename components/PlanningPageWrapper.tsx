import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PlanningPage as OriginalPlanningPage } from './PlanningPage';
import { UserDemand, TravelPlan } from '../types';
import { getPlanningResult, modifyExistingPlan } from '../services/geminiService';
import { POLLING_INTERVAL, MAX_POLLS } from '../constants';

interface LocationState {
  taskId: string;
  demand: UserDemand;
  timestamp: number;
}

const PlanningPageWrapper: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { taskId: urlTaskId } = useParams<{ taskId: string }>();
  
  const state = location.state as LocationState;
  
  // 优先使用 URL 中的 taskId，然后是 state 中的 taskId
  const taskId = urlTaskId || state?.taskId;
  
  // 如果没有 taskId，重定向到首页
  if (!taskId) {
    React.useEffect(() => {
      navigate('/');
    }, [navigate]);
    return null;
  }

  // 如果 URL 中没有 taskId 但 state 中有，则更新 URL
  React.useEffect(() => {
    if (!urlTaskId && state?.taskId) {
      navigate(`/planning/${state.taskId}`, { replace: true, state });
    }
  }, [urlTaskId, state, navigate]);
  
  const [currentPlan, setCurrentPlan] = useState<TravelPlan | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState<boolean>(true);
  const [isModifyingPlan, setIsModifyingPlan] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState<number>(0);

  const handleModifyPlan = useCallback(async (modificationRequest: string) => {
    if (!taskId || !currentPlan) return;
    setIsModifyingPlan(true);
    setError(null);
    try {
      const { success, plan: modifiedPlan, error: modificationError } = await modifyExistingPlan(taskId, currentPlan, modificationRequest);
      if (success && modifiedPlan) {
        setCurrentPlan(modifiedPlan);
      } else {
        setError(modificationError || '修改计划失败。');
      }
    } catch (e: any) {
      setError(e.message || '修改过程中发生意外错误。');
    } finally {
      setIsModifyingPlan(false);
    }
  }, [taskId, currentPlan]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    if (taskId && isLoadingPlan && !currentPlan && pollCount < MAX_POLLS) {
      intervalId = setInterval(async () => {
        try {
          const { success, plan, error: fetchError } = await getPlanningResult(taskId);
          if (success && plan) {
            setCurrentPlan(plan);
            setIsLoadingPlan(false);
            clearInterval(intervalId);
          } else if (fetchError || (!success && !plan)) {
            // 如果错误不是"not ready"类型，才设置错误状态
            if (fetchError && !fetchError.toLowerCase().includes("not ready") && !fetchError.toLowerCase().includes("过期")) { 
                setError(fetchError || '获取计划详情失败。');
                setIsLoadingPlan(false);
                clearInterval(intervalId);
            }
          }
        } catch (e: any) {
          // 只有在非预期错误时才停止轮询
          if (!e.message?.toLowerCase().includes("not ready")) {
            setError(e.message || '轮询计划结果时出错。');
            setIsLoadingPlan(false);
            clearInterval(intervalId);
          }
        }
        setPollCount(prev => prev + 1);
      }, POLLING_INTERVAL);
    } else if (pollCount >= MAX_POLLS && isLoadingPlan) {
      setError('超时：旅行计划生成时间过长。请尝试重新访问此页面或生成新的计划。');
      setIsLoadingPlan(false);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [taskId, isLoadingPlan, currentPlan, pollCount]);

  return (
    <OriginalPlanningPage 
      plan={currentPlan} 
      isLoading={isLoadingPlan && !currentPlan} 
      error={error}
      onModifyPlan={handleModifyPlan}
      isModifying={isModifyingPlan}
    />
  );
};

export default PlanningPageWrapper;
