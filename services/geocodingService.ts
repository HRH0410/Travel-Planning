import { BACKEND_CONFIG } from "@/constants";

export interface GeocodingResult {
  longitude: number;
  latitude: number;
  formattedAddress?: string;
}

// 批量地理编码请求接口
export interface BatchGeocodingRequest {
  address: string;
  city?: string;
}

// 批量地理编码结果接口
export interface BatchGeocodingResult {
  address: string;
  longitude: number;
  latitude: number;
  formattedAddress?: string;
  success: boolean;
}

// 调用后端地理编码服务
export const geocodeAddress = async (address: string): Promise<GeocodingResult | null> => {
  if (!address || !address.trim()) {
    console.warn('地址为空，无法进行地理编码');
    return null;
  }

  try {
    const response = await fetch(`${BACKEND_CONFIG.BASE_URL}${BACKEND_CONFIG.ENDPOINTS.GEO_CODING}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: address.trim()
      })
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        return {
          longitude: result.data.longitude,
          latitude: result.data.latitude,
          formattedAddress: result.data.formatted_address
        };
      }
    }
    
    console.warn(`无法获取地址 "${address}" 的地理编码`);
    return null;
  } catch (error) {
    console.error(`地理编码请求失败 (${address}):`, error);
    return null;
  }
};

// 调用后端批量地理编码服务
export const batchGeocodeAddresses = async (requests: BatchGeocodingRequest[]): Promise<BatchGeocodingResult[]> => {
  if (!requests || requests.length === 0) {
    console.warn('批量地理编码请求为空');
    return [];
  }

  try {
    const response = await fetch(`${BACKEND_CONFIG.BASE_URL}${BACKEND_CONFIG.ENDPOINTS.BATCH_GEO_CODING}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requests)
    });

    if (response.ok) {
      const results = await response.json();
      if (Array.isArray(results)) {
        return results.map(result => ({
          address: result.address,
          longitude: result.longitude || 0,
          latitude: result.latitude || 0,
          formattedAddress: result.formatted_address,
          success: !!result.success
        }));
      }
    }
    
    console.warn('批量地理编码请求失败');
    return requests.map(req => ({
      address: req.address,
      longitude: 0,
      latitude: 0,
      success: false
    }));
  } catch (error) {
    console.error('批量地理编码请求异常:', error);
    return requests.map(req => ({
      address: req.address,
      longitude: 0,
      latitude: 0,
      success: false
    }));
  }
};

// 从位置名称中提取地点名称（移除时间、类型等信息）
export const extractLocationName = (position: string): string => {
  if (!position) return '';
  
  // 移除时间信息（如 "09:00-10:00"）
  let cleaned = position.replace(/\d{2}:\d{2}[-\s]*\d{2}:\d{2}/g, '');
  
  // 移除括号内容和常见的描述性文字
  cleaned = cleaned.replace(/[（(].*?[）)]/g, '');
  cleaned = cleaned.replace(/[\s]*[-–—]\s*.*/g, ''); // 移除破折号后的内容
  cleaned = cleaned.replace(/\s*(参观|游览|用餐|入住|前往)\s*/g, '');
  
  // 移除多余空格
  cleaned = cleaned.trim().replace(/\s+/g, ' ');
  
  return cleaned || position; // 如果清理后为空，返回原始位置
};

// 验证经纬度是否有效（排除(0,0)这种默认值）
export const isValidCoordinate = (longitude: number, latitude: number): boolean => {
  return !isNaN(longitude) && !isNaN(latitude) && 
         isFinite(longitude) && isFinite(latitude) &&
         longitude >= -180 && longitude <= 180 &&
         latitude >= -90 && latitude <= 90 &&
         !(longitude === 0 && latitude === 0); // 排除(0,0)这种通常表示未设置坐标的情况
};

// 更新旅行计划中的坐标信息
export const updateTravelPlanCoordinates = async (plan: any): Promise<any> => {
  console.log('开始更新旅行计划坐标:', plan.taskId);
  const updatedPlan = { ...plan };
  let hasUpdates = false;

  // 更新每日活动的坐标
  if (updatedPlan.dailyPlans && Array.isArray(updatedPlan.dailyPlans)) {
    console.log(`检查 ${updatedPlan.dailyPlans.length} 天的活动`);
    for (const dailyPlan of updatedPlan.dailyPlans) {
      if (dailyPlan.activities && Array.isArray(dailyPlan.activities)) {
        console.log(`第${dailyPlan.day}天有 ${dailyPlan.activities.length} 个活动`);
        for (const activity of dailyPlan.activities) {
          console.log(`检查活动: ${activity.position}, pose: ${!!activity.pose}, 坐标: (${activity.longitude}, ${activity.latitude})`);
          
          // 如果活动没有pose字段且坐标无效，则获取坐标
          if (!activity.pose && 
              activity.position && 
              !isValidCoordinate(activity.longitude || 0, activity.latitude || 0)) {
            
            console.log(`需要获取坐标的活动: ${activity.position}`);
            const cleanName = extractLocationName(activity.position);
            console.log(`清理后的地点名称: ${cleanName}`);
            const geocodingResult = await geocodeAddress(cleanName);
            
            if (geocodingResult) {
              activity.latitude = geocodingResult.latitude;
              activity.longitude = geocodingResult.longitude;
              activity.pose = {
                latitude: geocodingResult.latitude,
                longitude: geocodingResult.longitude
              };
              hasUpdates = true;
              console.log(`更新活动坐标: ${activity.position} -> (${geocodingResult.longitude}, ${geocodingResult.latitude})`);
            } else {
              console.warn(`无法获取坐标: ${activity.position}`);
            }
          } else {
            console.log(`跳过活动 ${activity.position}: 已有pose或坐标有效`);
          }
        }
      }
    }
  }

  // 更新POI坐标
  if (updatedPlan.pois && Array.isArray(updatedPlan.pois)) {
    for (const poi of updatedPlan.pois) {
      // 如果POI没有pose字段且坐标无效，则获取坐标
      if (!poi.pose && 
          poi.name && 
          !isValidCoordinate(poi.longitude || 0, poi.latitude || 0)) {
        
        const cleanName = extractLocationName(poi.name);
        const geocodingResult = await geocodeAddress(cleanName);
        
        if (geocodingResult) {
          poi.latitude = geocodingResult.latitude;
          poi.longitude = geocodingResult.longitude;
          poi.pose = {
            latitude: geocodingResult.latitude,
            longitude: geocodingResult.longitude
          };
          hasUpdates = true;
          console.log(`更新POI坐标: ${poi.name} -> (${geocodingResult.longitude}, ${geocodingResult.latitude})`);
        }
      }
    }
  }

  // 如果有更新，保存到localStorage
  if (hasUpdates && updatedPlan.taskId) {
    try {
      const savedPlans = JSON.parse(localStorage.getItem('completedPlans') || '{}');
      savedPlans[updatedPlan.taskId] = updatedPlan;
      localStorage.setItem('completedPlans', JSON.stringify(savedPlans));
      console.log(`已保存更新的坐标到localStorage: ${updatedPlan.taskId}`);
    } catch (error) {
      console.warn('无法保存更新的计划到localStorage:', error);
    }
  }

  return updatedPlan;
};

// 从旅行计划中收集所有需要地理编码的地址
export const collectGeocodingRequests = (plan: any): BatchGeocodingRequest[] => {
  const requests: BatchGeocodingRequest[] = [];
  const addressSet = new Set<string>(); // 避免重复地址

  // 收集每日活动中的地址
  if (plan.dailyPlans && Array.isArray(plan.dailyPlans)) {
    for (const dailyPlan of plan.dailyPlans) {
      if (dailyPlan.activities && Array.isArray(dailyPlan.activities)) {
        for (const activity of dailyPlan.activities) {
          // 只收集没有有效坐标的活动
          if (activity.position && 
              !isValidCoordinate(activity.longitude || 0, activity.latitude || 0)) {
            const cleanName = extractLocationName(activity.position);
            if (cleanName && !addressSet.has(cleanName)) {
              addressSet.add(cleanName);
              requests.push({
                address: cleanName,
                city: plan.destination // 使用目的地城市作为上下文
              });
            }
          }
        }
      }
    }
  }

  // 收集POI中的地址
  if (plan.pois && Array.isArray(plan.pois)) {
    for (const poi of plan.pois) {
      if (poi.name && 
          !isValidCoordinate(poi.longitude || 0, poi.latitude || 0)) {
        const cleanName = extractLocationName(poi.name);
        if (cleanName && !addressSet.has(cleanName)) {
          addressSet.add(cleanName);
          requests.push({
            address: cleanName,
            city: plan.destination
          });
        }
      }
    }
  }

  return requests;
};

// 应用批量地理编码结果到旅行计划
export const applyGeocodingResults = (plan: any, results: BatchGeocodingResult[]): any => {
  const updatedPlan = { ...plan };
  const resultsMap = new Map<string, BatchGeocodingResult>();
  
  // 创建地址到结果的映射
  results.forEach(result => {
    if (result.success) {
      resultsMap.set(result.address, result);
    }
  });

  let hasUpdates = false;

  // 更新每日活动的坐标
  if (updatedPlan.dailyPlans && Array.isArray(updatedPlan.dailyPlans)) {
    for (const dailyPlan of updatedPlan.dailyPlans) {
      if (dailyPlan.activities && Array.isArray(dailyPlan.activities)) {
        for (const activity of dailyPlan.activities) {
          if (activity.position && 
              !isValidCoordinate(activity.longitude || 0, activity.latitude || 0)) {
            const cleanName = extractLocationName(activity.position);
            const result = resultsMap.get(cleanName);
            
            if (result) {
              activity.latitude = result.latitude;
              activity.longitude = result.longitude;
              activity.pose = {
                latitude: result.latitude,
                longitude: result.longitude
              };
              hasUpdates = true;
              console.log(`应用地理编码结果: ${activity.position} -> (${result.longitude}, ${result.latitude})`);
            }
          }
        }
      }
    }
  }

  // 更新POI坐标
  if (updatedPlan.pois && Array.isArray(updatedPlan.pois)) {
    for (const poi of updatedPlan.pois) {
      if (poi.name && 
          !isValidCoordinate(poi.longitude || 0, poi.latitude || 0)) {
        const cleanName = extractLocationName(poi.name);
        const result = resultsMap.get(cleanName);
        
        if (result) {
          poi.latitude = result.latitude;
          poi.longitude = result.longitude;
          poi.pose = {
            latitude: result.latitude,
            longitude: result.longitude
          };
          hasUpdates = true;
          console.log(`应用POI地理编码结果: ${poi.name} -> (${result.longitude}, ${result.latitude})`);
        }
      }
    }
  }

  return updatedPlan;
};
