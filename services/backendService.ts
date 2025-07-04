import { UserDemand, TravelPlan, DailyPlan, Activity } from '../types';
import { BACKEND_CONFIG } from '../constants';
import { updateTravelPlanCoordinates, collectGeocodingRequests, batchGeocodeAddresses, applyGeocodingResults } from './geocodingService';

// 将前端UserDemand转换为后端期望的格式
const convertDemandToBackendFormat = (demand: UserDemand) => {
  // 解析天数和人数
  const daysCount = parseInt(demand.duration) || 7;
  const peopleCount = parseInt(demand.people) || 2;
  
  return {
    startCity: demand.startCity,
    destinationCity: demand.destination,
    daysCount,
    peopleCount,
    additionalRequirements: demand.rawInput || '无特殊需求'
  };
};

// 将后端返回的结果转换为前端TravelPlan格式
const convertBackendResultToTravelPlan = (backendResult: any, demand: UserDemand, taskId: string): TravelPlan => {
  const plan = backendResult.result;
  
  // 创建基础的TravelPlan结构
  const travelPlan: TravelPlan = {
    taskId,
    startCity: plan.start_city,
    destination: plan.target_city,
    durationDays: plan.itinerary?.length || 0,
    numberOfPeople: plan.people_number,
    budget: parseFloat(demand.budget?.split('-')[0]) || 5000,
    currency: '¥',
    dailyPlans: [],
    totalEstimatedCost: 0,
    pois: []
  };

  // 转换每日计划 - 新的数据结构是 plan.itinerary
  if (plan.itinerary && Array.isArray(plan.itinerary)) {
    travelPlan.dailyPlans = plan.itinerary.map((dayPlan: any) => {
      const dailyPlan: DailyPlan = {
        day: dayPlan.day,
        date: new Date(Date.now() + (dayPlan.day - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        activities: [],
        dailyCost: 0
      };

      // 转换活动
      if (dayPlan.activities && Array.isArray(dayPlan.activities)) {
        dailyPlan.activities = dayPlan.activities.map((activity: any, activityIndex: number) => {
          // 转换活动类型映射
          const typeMapping: { [key: string]: string } = {
            'attraction': 'attraction',
            'dinner': 'dining',
            'lunch': 'dining', 
            'breakfast': 'dining',
            'accommodation': 'accommodation',
            'airplane': 'travel',
            '飞机': 'travel',
            'train': 'travel'
          };

          const mappedActivity: Activity = {
            position: activity.position || activity.name || `${activity.start || ''} → ${activity.end || ''}` || `活动${activityIndex + 1}`,
            type: (typeMapping[activity.type] || activity.type || 'attraction') as any,
            startTime: activity.start_time || '09:00',
            endTime: activity.end_time || '10:00',
            cost: activity.cost || 0,
            pictureUrl: activity.photos || activity.picture || `https://picsum.photos/seed/${encodeURIComponent(activity.position || 'activity')}${dayPlan.day}${activityIndex}/300/200`,
            latitude: activity.latitude || 0,
            longitude: activity.longitude || 0,
            tickets: activity.tickets || 0,
            // 添加航班或交通ID
            ...(activity.ID && { id: activity.ID }),
            // 添加起终点信息（用于交通类型）
            ...(activity.start && { start: activity.start }),
            ...(activity.end && { end: activity.end }),
            // 添加房间信息（用于住宿类型）
            ...(activity.room_type && { 
              accommodationInfo: { 
                name: activity.position || '住宿',
                type: `${activity.room_type}人间`,
                cost: activity.cost || 0
              }
            }),
            // 如果有坐标，保存pose字段
            ...(activity.latitude && activity.longitude && {
              pose: {
                latitude: activity.latitude,
                longitude: activity.longitude
              }
            })
          };

          // 处理交通信息
          if (activity.transports && Array.isArray(activity.transports)) {
            mappedActivity.transports = activity.transports.map((transport: any) => ({
              mode: transport.mode || 'unknown',
              start: transport.start,
              end: transport.end,
              start_time: transport.start_time,
              end_time: transport.end_time,
              cost: transport.cost || 0,
              distance: transport.distance,
              details: transport.nL_desc || transport.details,
              tickets: transport.tickets
            }));
          }

          return mappedActivity;
        });

        // 计算每日费用
        dailyPlan.dailyCost = dailyPlan.activities.reduce((sum: number, activity: any) => sum + (activity.cost || 0), 0);
      }

      return dailyPlan;
    });
  }

  // 计算总费用
  travelPlan.totalEstimatedCost = travelPlan.dailyPlans.reduce((sum: number, day: any) => sum + (day.dailyCost || 0), 0);

  return travelPlan;
};

// 启动规划会话
export const startBackendPlanningSession = async (demand: UserDemand): Promise<{ taskId: string }> => {
  try {
    const backendRequest = convertDemandToBackendFormat(demand);
    
    const response = await fetch(`${BACKEND_CONFIG.BASE_URL}${BACKEND_CONFIG.ENDPOINTS.START_PLAN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(backendRequest)
    });

    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.id) {
      throw new Error('后端返回的任务ID无效');
    }

    return { taskId: result.id };
  } catch (error) {
    console.error('启动后端规划会话失败:', error);
    throw new Error(`无法连接到后端服务: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

// 获取规划结果（不包含地理编码）
export const getBackendPlanningResult = async (taskId: string, demand: UserDemand): Promise<{ 
  success: boolean; 
  plan?: TravelPlan; 
  error?: string; 
  isStillRunning?: boolean 
}> => {
  try {
    const response = await fetch(`${BACKEND_CONFIG.BASE_URL}${BACKEND_CONFIG.ENDPOINTS.GET_RESULT}/${taskId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: '任务ID不存在' };
      }
      throw new Error(`HTTP错误: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.status === 'running') {
      return { success: false, isStillRunning: true, error: '任务仍在运行中' };
    }
    
    if (result.status === 'error') {
      return { success: false, error: result.result || '后端任务执行失败' };
    }
    
    if (result.status === 'success' && result.result) {
      const plan = convertBackendResultToTravelPlan(result, demand, taskId);
      return { success: true, plan };
    }
    
    return { success: false, error: '后端返回了无效的结果格式' };
  } catch (error) {
    console.error('获取后端规划结果失败:', error);
    return { 
      success: false, 
      error: `无法获取后端结果: ${error instanceof Error ? error.message : '未知错误'}` 
    };
  }
};

// 获取规划结果并同步更新坐标信息（使用批量地理编码）
export const getBackendPlanningResultWithCoordinates = async (taskId: string, demand: UserDemand): Promise<{ 
  success: boolean; 
  plan?: TravelPlan; 
  error?: string; 
  isStillRunning?: boolean 
}> => {
  const result = await getBackendPlanningResult(taskId, demand);
  
  if (result.success && result.plan) {
    try {
      const updatedPlan = await updateTravelPlanCoordinates(result.plan);
      return { success: true, plan: updatedPlan };
    } catch (error) {
      return result; // 如果坐标更新失败，仍然返回原始计划
    }
  }
  
  return result;
};

// 检查后端连接状态
export const checkBackendConnection = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时
    
    const response = await fetch(`${BACKEND_CONFIG.BASE_URL}/`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
};
