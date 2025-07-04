import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PlanningPage as OriginalPlanningPage } from './PlanningPage';
import { UserDemand, TravelPlan } from '../types';
import { getBackendPlanningResult } from '../services/backendService';
import { collectGeocodingRequests, batchGeocodeAddresses, applyGeocodingResults } from '../services/geocodingService';
import { POLLING_INTERVAL, MAX_POLLS } from '../constants';

interface LocationState {
  taskId: string;
  demand: UserDemand;
  useBackend?: boolean;
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
  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState<boolean>(false);
  const [isModifyingPlan, setIsModifyingPlan] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState<number>(0);
  const [startTime] = useState<number>(Date.now());

  const handleModifyPlan = useCallback(async (_modificationRequest: string) => {
    if (!taskId || !currentPlan) return;
    setIsModifyingPlan(true);
    setError(null);
    try {
      // 修改计划功能暂不支持，显示提示信息
      setError('修改计划功能暂时不可用，请重新生成计划。');
    } catch (e: any) {
      setError(e.message || '修改过程中发生意外错误。');
    } finally {
      setIsModifyingPlan(false);
    }
  }, [taskId, currentPlan]);

  // 处理地理编码的函数
  const handleGeocoding = useCallback(async (plan: TravelPlan) => {
    try {
      setIsLoadingGeocoding(true);
      console.log('开始批量地理编码...');
      
      // 收集需要地理编码的地址
      const requests = collectGeocodingRequests(plan);
      console.log(`需要地理编码的地址数量: ${requests.length}`);
      
      if (requests.length > 0) {
        // 发送批量地理编码请求
        const results = await batchGeocodeAddresses(requests);
        console.log('地理编码结果:', results);
        
        // 应用编码结果到计划
        const updatedPlan = applyGeocodingResults(plan, results);
        
        // 更新计划状态
        setCurrentPlan(updatedPlan);
        
        // 保存到localStorage
        try {
          const savedPlans = JSON.parse(localStorage.getItem('completedPlans') || '{}');
          savedPlans[plan.taskId] = updatedPlan;
          localStorage.setItem('completedPlans', JSON.stringify(savedPlans));
          console.log(`已保存更新的计划到localStorage: ${plan.taskId}`);
        } catch (error) {
          console.warn('无法保存更新的计划到localStorage:', error);
        }
      }
    } catch (error) {
      console.error('地理编码失败:', error);
      // 即使地理编码失败，也不影响计划显示
    } finally {
      setIsLoadingGeocoding(false);
    }
  }, []);

  // 计算预期等待时间（1.5分钟 * 天数）
  const calculateEstimatedTime = (demand?: UserDemand): number => {
    if (!demand?.duration) return 90; // 默认90秒
    
    // 从duration字符串中提取天数
    const durationMatch = demand.duration.match(/(\d+)/);
    const days = durationMatch ? parseInt(durationMatch[1]) : 1;
    
    return days * 90; // 90秒 = 1.5分钟
  };

  const estimatedTime = React.useMemo(() => 
    calculateEstimatedTime(state?.demand), 
    [state?.demand]
  );

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    if (taskId && isLoadingPlan && !currentPlan && pollCount < MAX_POLLS) {
      intervalId = setInterval(async () => {
        try {
          // 如果没有 demand 数据，创建一个默认的 demand 对象用于轮询
          let demandForPolling = state?.demand;
          if (!demandForPolling) {
            // 当用户在新设备上直接访问 URL 时，使用默认参数
            demandForPolling = {
              startCity: '未知',
              destination: '未知',
              duration: '7天',
              people: '2人',
              budget: '5000-10000',
              rawInput: '通过 URL 直接访问'
            };
          }

          // 直接使用后端服务获取结果（不包含地理编码）
          const result = await getBackendPlanningResult(taskId, demandForPolling);
          
          if (result.success && result.plan) {
            // 先设置计划，让用户看到列表
            setCurrentPlan(result.plan);
            setIsLoadingPlan(false);
            clearInterval(intervalId);
            
            // 异步处理地理编码
            handleGeocoding(result.plan);
          } else if (result.error || (!result.success && !result.plan)) {
            // 如果是后端服务且仍在运行中，继续轮询
            if (result.isStillRunning) {
              // 继续轮询，不设置错误
            } else if (result.error) {
              // 处理特定错误情况
              if (result.error.toLowerCase().includes("not ready") || 
                  result.error.toLowerCase().includes("过期") ||
                  result.error.toLowerCase().includes("任务仍在运行中")) {
                // 这些情况继续轮询，不设置错误
              } else if (result.error.toLowerCase().includes("任务id不存在")) {
                const directAccessHint = !state?.demand ? 
                  '\n\n💡 提示：您是通过链接直接访问的。如果任务已过期，请返回首页重新生成计划。' : '';
                setError(`任务不存在或已过期。请重新生成计划。${directAccessHint}`);
                setIsLoadingPlan(false);
                clearInterval(intervalId);
              } else {
                const directAccessHint = !state?.demand ? 
                  '\n\n💡 提示：您是通过链接直接访问的，某些功能可能受限。' : '';
                setError(`${result.error || '获取计划详情失败。'}${directAccessHint}`);
                setIsLoadingPlan(false);
                clearInterval(intervalId);
              }
            }
          }
        } catch (e: any) {
          // 只有在非预期错误时才停止轮询
          if (!e.message?.toLowerCase().includes("not ready") && 
              !e.message?.toLowerCase().includes("任务仍在运行中")) {
            setError(e.message || '轮询计划结果时出错。');
            setIsLoadingPlan(false);
            clearInterval(intervalId);
          }
        }
        setPollCount(prev => prev + 1);
      }, POLLING_INTERVAL);
    } else if (pollCount >= MAX_POLLS && isLoadingPlan) {
      const directAccessHint = !state?.demand ? 
        '\n\n💡 提示：您是通过链接直接访问的。建议返回首页重新生成计划以获得最佳体验。' : '';
      setError(`超时：旅行计划生成时间过长。请尝试重新访问此页面或生成新的计划。${directAccessHint}`);
      setIsLoadingPlan(false);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [taskId, isLoadingPlan, currentPlan, pollCount, state?.demand]);

  return (
    <OriginalPlanningPage 
      plan={currentPlan} 
      isLoading={isLoadingPlan && !currentPlan} 
      isLoadingGeocoding={isLoadingGeocoding}
      error={error}
      onModifyPlan={handleModifyPlan}
      isModifying={isModifyingPlan}
      elapsedTime={Math.floor((Date.now() - startTime) / 1000)}
      estimatedTime={estimatedTime}
    />
  );
};

export default PlanningPageWrapper;
