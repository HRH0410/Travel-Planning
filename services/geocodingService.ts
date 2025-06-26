import { AMAP_CONFIG } from '../constants';

export interface GeocodingResult {
  longitude: number;
  latitude: number;
  formattedAddress?: string;
}

// 使用高德地图地理编码API获取地点的经纬度
export const geocodeAddress = async (address: string): Promise<GeocodingResult | null> => {
  if (!address || !address.trim()) {
    console.warn('地址为空，无法进行地理编码');
    return null;
  }

  try {
    // 使用高德地图地理编码API
    const url = `https://restapi.amap.com/v3/geocode/geo?key=${AMAP_CONFIG.KEY}&address=${encodeURIComponent(address.trim())}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === '1' && data.geocodes && data.geocodes.length > 0) {
      const result = data.geocodes[0];
      const [longitude, latitude] = result.location.split(',').map(Number);
      
      if (!isNaN(longitude) && !isNaN(latitude) && isFinite(longitude) && isFinite(latitude)) {
        return {
          longitude,
          latitude,
          formattedAddress: result.formatted_address
        };
      }
    }
    
    console.warn(`无法获取地址 "${address}" 的地理编码:`, data);
    return null;
  } catch (error) {
    console.error(`地理编码请求失败 (${address}):`, error);
    return null;
  }
};

// 批量地理编码
export const batchGeocode = async (addresses: string[]): Promise<Map<string, GeocodingResult>> => {
  const results = new Map<string, GeocodingResult>();
  
  // 并发处理，但限制并发数量
  const BATCH_SIZE = 5;
  for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
    const batch = addresses.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async (address) => {
      const result = await geocodeAddress(address);
      if (result) {
        results.set(address, result);
      }
    });
    
    await Promise.all(promises);
    
    // 添加延迟避免API限流
    if (i + BATCH_SIZE < addresses.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
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

// 验证经纬度是否有效
export const isValidCoordinate = (longitude: number, latitude: number): boolean => {
  return !isNaN(longitude) && !isNaN(latitude) && 
         isFinite(longitude) && isFinite(latitude) &&
         longitude >= -180 && longitude <= 180 &&
         latitude >= -90 && latitude <= 90;
};

// 更新旅行计划中的坐标信息
export const updateTravelPlanCoordinates = async (plan: any): Promise<any> => {
  const updatedPlan = { ...plan };
  let hasUpdates = false;

  // 更新每日活动的坐标
  if (updatedPlan.dailyPlans && Array.isArray(updatedPlan.dailyPlans)) {
    for (const dailyPlan of updatedPlan.dailyPlans) {
      if (dailyPlan.activities && Array.isArray(dailyPlan.activities)) {
        for (const activity of dailyPlan.activities) {
          // 如果活动没有pose字段且坐标无效，则获取坐标
          if (!activity.pose && 
              activity.position && 
              !isValidCoordinate(activity.longitude || 0, activity.latitude || 0)) {
            
            const cleanName = extractLocationName(activity.position);
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
              
              // 添加延迟避免API限流
              await new Promise(resolve => setTimeout(resolve, 200));
            }
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
          
          // 添加延迟避免API限流
          await new Promise(resolve => setTimeout(resolve, 200));
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
