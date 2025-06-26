
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { UserDemand, TravelPlan, DailyPlan, Activity, POIDetail } from '../types';
import { GEMINI_TEXT_MODEL, MOCK_TASK_ID_PREFIX } from '../constants';
import { geocodeAddress, extractLocationName, isValidCoordinate } from './geocodingService';
import { v4 as uuidv4 } from 'uuid';

// Ensure API_KEY is available in the environment.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn(
    "API_KEY 环境变量未设置。Gemini API 调用将失败。将使用模拟数据生成计划。"
  );
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const planningRequests: Record<string, UserDemand> = {};
const completedPlans: Record<string, TravelPlan> = {}; // 缓存已完成的计划

// 初始化时从localStorage恢复数据
const initializeFromStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      // 恢复已完成的计划
      const savedPlans = JSON.parse(localStorage.getItem('completedPlans') || '{}');
      Object.assign(completedPlans, savedPlans);
      
      // 恢复请求数据
      const savedRequests = JSON.parse(localStorage.getItem('planningRequests') || '{}');
      Object.assign(planningRequests, savedRequests);
    } catch (e) {
      console.warn('无法从localStorage恢复数据:', e);
    }
  }
};

// 页面加载时初始化
if (typeof window !== 'undefined') {
  initializeFromStorage();
}

export const startPlanningSession = async (demand: UserDemand): Promise<{ taskId: string }> => {
  const taskId = `${MOCK_TASK_ID_PREFIX}${uuidv4()}`;
  planningRequests[taskId] = demand;
  
  // 在localStorage中也保存一份，用于页面刷新后恢复
  if (typeof window !== 'undefined') {
    try {
      const savedRequests = JSON.parse(localStorage.getItem('planningRequests') || '{}');
      savedRequests[taskId] = demand;
      localStorage.setItem('planningRequests', JSON.stringify(savedRequests));
    } catch (e) {
      console.warn('无法保存到localStorage:', e);
    }
  }
  
  await new Promise(resolve => setTimeout(resolve, 10)); 
  return { taskId };
};

const parseGeminiResponseToTravelPlan = (responseText: string, demand: UserDemand, taskId: string): TravelPlan | null => {
  let jsonStr: string = ""; // Declare jsonStr outside the try block and initialize it.
  try {
    jsonStr = responseText.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const matchFence = jsonStr.match(fenceRegex);
    if (matchFence && matchFence[2]) {
      jsonStr = matchFence[2].trim();
    }

    // Pre-process to evaluate arithmetic expressions in totalEstimatedCost
    // Looks for "totalEstimatedCost": number + number + ...,
    jsonStr = jsonStr.replace(/"totalEstimatedCost":\s*([\d\s.+*/-]+)\s*([,}])/g, (match, exprStr, trailingChar) => {
      try {
        // Evaluate simple sums like "580 + 800 + 280"
        if (exprStr.includes('+') && !exprStr.match(/[^\d\s.+]/)) { // Only allow digits, spaces, dots, and plus
          const parts = exprStr.split('+').map((part: string) => parseFloat(part.trim()));
          if (parts.every((p: number) => !isNaN(p))) {
            const calculatedValue = parts.reduce((sum: number, p: number) => sum + p, 0);
            return `"totalEstimatedCost": ${calculatedValue}${trailingChar}`;
          }
        } else if (!isNaN(parseFloat(exprStr))) { // If it's already a single number
            return `"totalEstimatedCost": ${parseFloat(exprStr)}${trailingChar}`;
        }
      } catch (e) {
        console.warn("Could not pre-evaluate totalEstimatedCost expression:", exprStr, e, "Original match:", match);
      }
      // If evaluation fails or not a simple sum, return the original match to let JSON.parse handle it (and potentially fail)
      return match;
    });
    
    const parsed = JSON.parse(jsonStr);

    const plan: TravelPlan = {
      taskId: taskId,
      title: parsed.title || `${demand.destination}之旅`,
      startCity: parsed.startCity || demand.startCity, // Include startCity
      destination: parsed.destination || demand.destination,
      durationDays: parseInt(parsed.durationDays || demand.duration.split(' ')[0] || "1"),
      numberOfPeople: parseInt(parsed.numberOfPeople || demand.people.split(' ')[0] || "1"),
      budget: parseFloat(parsed.budget || demand.budget.split(' ')[0] || "0"),
      currency: parsed.currency || "USD", // Default to USD if not provided
      dailyPlans: (parsed.dailyPlans || []).map((dp: any, dayIndex: number): DailyPlan => ({
        day: dp.day || dayIndex + 1,
        summary: dp.summary || "",
        activities: (dp.activities || []).map((act: any, actIndex: number): Activity => ({
          id: act.id || uuidv4(),
          position: act.position || "未知活动",
          type: act.type || "other",
          startTime: act.startTime || "09:00",
          endTime: act.endTime || "10:00",
          cost: parseFloat(act.cost || "0"),
          pictureUrl: act.pictureUrl || `https://picsum.photos/seed/${encodeURIComponent(act.position || 'activity')}${dayIndex}${actIndex}/300/200`,
          notes: act.notes || "",
          latitude: parseFloat(act.latitude || "0"),
          longitude: parseFloat(act.longitude || "0"),
          transportTo: act.transportTo,
          foodInfo: act.foodInfo,
          accommodationInfo: act.accommodationInfo,
        })),
        dailyCost: parseFloat(dp.dailyCost || "0"),
      })),
      pois: (parsed.pois || []).map((poi: any): POIDetail => ({
        name: poi.name || "未知兴趣点",
        latitude: parseFloat(poi.latitude || "0"),
        longitude: parseFloat(poi.longitude || "0"),
      })),
      intercityTransportStart: parsed.intercityTransportStart,
      intercityTransportEnd: parsed.intercityTransportEnd,
    };
    
    // Use parsed.totalEstimatedCost if available and valid, otherwise calculate
    if (parsed.totalEstimatedCost && typeof parsed.totalEstimatedCost === 'number') {
        plan.totalEstimatedCost = parsed.totalEstimatedCost;
    } else {
        plan.totalEstimatedCost = plan.dailyPlans.reduce((sum, dp) => sum + (dp.dailyCost || 0), 0);
        if (plan.intercityTransportStart?.cost) plan.totalEstimatedCost += plan.intercityTransportStart.cost;
        if (plan.intercityTransportEnd?.cost) plan.totalEstimatedCost += plan.intercityTransportEnd.cost;
    }

    if (parsed.notes) {
      // Add notes to plan if it exists in parsed data.
      // Ensure 'notes' field is part of TravelPlan type or handle appropriately.
      (plan as any).notes = parsed.notes; 
    }


    // Ensure intercity transport reflects startCity
    if (plan.intercityTransportStart && !plan.intercityTransportStart.from && demand.startCity) {
        plan.intercityTransportStart.from = demand.startCity;
    }


    return plan;

  } catch (error) {
    console.error("解析Gemini响应失败：", error);
    console.error("原始响应文本：", responseText);
    // jsonStr is now guaranteed to be in scope here.
    console.error("处理后的JSON字符串（尝试解析前）：", jsonStr);
    return null;
  }
};


const generateMockPlan = (demand: UserDemand, taskId: string): TravelPlan => {
  const duration = parseInt(demand.duration.split(' ')[0] || "1");
  const dailyPlans: DailyPlan[] = [];
  for (let i = 1; i <= duration; i++) {
    dailyPlans.push({
      day: i,
      summary: `第 ${i} 天从 ${demand.startCity} 出发前往 ${demand.destination}。重点：常规观光。`,
      activities: [
        { id: uuidv4(), position: `上午活动 ${i}`, type: 'attraction', startTime: '09:00', endTime: '12:00', cost: 20, pictureUrl: `https://picsum.photos/seed/morning${i}/300/200`, notes: '享受早晨时光。' },
        { id: uuidv4(), position: `午餐地点 ${i}`, type: 'dining', startTime: '12:30', endTime: '13:30', cost: 25, foodInfo: { name: `当地餐馆 ${i}`}, pictureUrl: `https://picsum.photos/seed/lunch${i}/300/200` },
        { id: uuidv4(), position: `下午活动 ${i}`, type: 'attraction', startTime: '14:00', endTime: '17:00', cost: 30, pictureUrl: `https://picsum.photos/seed/afternoon${i}/300/200` },
      ],
      dailyCost: 75,
    });
  }
  return {
    taskId,
    title: `模拟从${demand.startCity}到${demand.destination}的旅程`,
    startCity: demand.startCity,
    destination: demand.destination,
    durationDays: duration,
    numberOfPeople: parseInt(demand.people.split(' ')[0] || "1"),
    budget: parseFloat(demand.budget.split(' ')[0] || "0"),
    currency: "USD",
    dailyPlans,
    totalEstimatedCost: 75 * duration,
    pois: [{name: `${demand.destination} 中心点`, latitude: 0, longitude: 0}],
    intercityTransportStart: {
        mode: "火车",
        from: demand.startCity,
        to: demand.destination,
        duration: "3小时",
        cost: 50,
        details: "G123次列车"
    }
  };
};

// 导入 example.json 内容
const loadExampleData = async () => {
  try {
    const response = await fetch('/example.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('无法加载 example.json:', error);
    return null;
  }
};

// 转换 example.json 格式为 TravelPlan 格式
const convertExampleDataToPlan = async (exampleData: any, demand: UserDemand, taskId: string): Promise<TravelPlan> => {
  const dailyPlans: DailyPlan[] = [];
  
  // 城市坐标映射（用于提供默认坐标）
  const cityCoordinates: Record<string, { lat: number; lng: number }> = {
    '上海': { lat: 31.2304, lng: 121.4737 },
    '杭州': { lat: 30.2741, lng: 120.1551 },
    '北京': { lat: 39.9042, lng: 116.4074 },
    '广州': { lat: 23.1291, lng: 113.2644 },
    '深圳': { lat: 22.5431, lng: 114.0579 },
    '南京': { lat: 32.0603, lng: 118.7969 },
    '苏州': { lat: 31.2989, lng: 120.5853 },
    '成都': { lat: 30.5728, lng: 104.0668 },
    '西安': { lat: 34.3416, lng: 108.9398 },
    '重庆': { lat: 29.5630, lng: 106.5516 }
  };

  // 获取目标城市的基础坐标
  const targetCityCoords = cityCoordinates[exampleData.target_city || demand.destination] || 
                          cityCoordinates['杭州']; // 默认使用杭州坐标
  
  if (exampleData.itinerary && exampleData.itinerary.length > 0) {
    // 使用 for...of 循环来支持异步操作
    for (const dayData of exampleData.itinerary) {
      const dailyPlan: DailyPlan = {
        day: dayData.day,
        summary: `第 ${dayData.day} 天的行程`,
        activities: [],
        dailyCost: 0
      };

      let dailyCost = 0;
      
      if (dayData.activities && Array.isArray(dayData.activities)) {
        // 为了支持异步地理编码，我们需要使用 Promise.all
        const processedActivities = await Promise.all(
          dayData.activities.map(async (activity: any, index: number) => {
            // 确定活动类型，处理火车等特殊情况
            let activityType = activity.type || 'other';
            if (activity.TrainID || (activity.start && activity.end && !activity.position)) {
              activityType = 'train';
            }

            // 初始化坐标（默认使用目标城市坐标）
            let activityLat = targetCityCoords.lat;
            let activityLng = targetCityCoords.lng;

            // 尝试获取真实坐标
            if (activity.position) {
              const cleanName = extractLocationName(activity.position);
              const geocodingResult = await geocodeAddress(cleanName);
              
              if (geocodingResult && isValidCoordinate(geocodingResult.longitude, geocodingResult.latitude)) {
                activityLat = geocodingResult.latitude;
                activityLng = geocodingResult.longitude;
                console.log(`获取到真实坐标: ${activity.position} -> (${activityLng}, ${activityLat})`);
              } else {
                // 如果无法获取真实坐标，使用目标城市周围随机分布
                const randomOffsetLat = (Math.random() - 0.5) * 0.05; // 约5公里范围
                const randomOffsetLng = (Math.random() - 0.5) * 0.05;
                activityLat = targetCityCoords.lat + randomOffsetLat;
                activityLng = targetCityCoords.lng + randomOffsetLng;
                console.warn(`无法获取真实坐标，使用随机坐标: ${activity.position}`);
              }
              
              // 添加延迟避免API限流
              await new Promise(resolve => setTimeout(resolve, 100));
            }

            const convertedActivity: Activity = {
              id: `${taskId}_${dayData.day}_${index}`,
              position: activity.position || (activity.start && activity.end ? `${activity.start} → ${activity.end}` : '未知地点'),
              type: activityType as Activity['type'],
              startTime: activity.start_time,
              endTime: activity.end_time,
              start_time: activity.start_time, // 保留原格式
              end_time: activity.end_time, // 保留原格式
              cost: activity.cost || 0,
              pictureUrl: `https://picsum.photos/seed/${encodeURIComponent(activity.position || activity.start || 'activity')}${dayData.day}${index}/300/200`,
              latitude: activityLat,
              longitude: activityLng,
              // 保存pose字段，如果通过API获取了有效坐标
              ...(isValidCoordinate(activityLng, activityLat) && {
                pose: {
                  latitude: activityLat,
                  longitude: activityLng
                }
              }),
              tickets: activity.tickets
            };

            // 处理火车信息
            if (activity.TrainID) {
              convertedActivity.TrainID = activity.TrainID;
              convertedActivity.start = activity.start;
              convertedActivity.end = activity.end;
              
              // 尝试获取火车站的真实坐标
              if (activity.start) {
                const stationGeocodingResult = await geocodeAddress(activity.start + '火车站');
                if (stationGeocodingResult && isValidCoordinate(stationGeocodingResult.longitude, stationGeocodingResult.latitude)) {
                  convertedActivity.latitude = stationGeocodingResult.latitude;
                  convertedActivity.longitude = stationGeocodingResult.longitude;
                  // 保存pose字段
                  convertedActivity.pose = {
                    latitude: stationGeocodingResult.latitude,
                    longitude: stationGeocodingResult.longitude
                  };
                } else {
                  // 火车站通常在城市中心附近
                  convertedActivity.latitude = targetCityCoords.lat + (Math.random() - 0.5) * 0.02;
                  convertedActivity.longitude = targetCityCoords.lng + (Math.random() - 0.5) * 0.02;
                }
                await new Promise(resolve => setTimeout(resolve, 100));
              }
            }

            // 处理交通信息
            if (activity.transports && Array.isArray(activity.transports)) {
              convertedActivity.transports = activity.transports.map((transport: any) => ({
                mode: transport.mode,
                start: transport.start,
                end: transport.end,
                duration: transport.end_time && transport.start_time ? 
                  `${Math.round((new Date(`1970-01-01T${transport.end_time}:00`).getTime() - new Date(`1970-01-01T${transport.start_time}:00`).getTime()) / 60000)}分钟` : 
                  undefined,
                cost: transport.cost,
                distance: transport.distance,
                start_time: transport.start_time,
                end_time: transport.end_time,
                tickets: transport.tickets
              }));
              
              // 累加交通费用到活动费用中
              const transportCost = activity.transports.reduce((sum: number, t: any) => sum + (t.cost || 0), 0);
              convertedActivity.cost = (convertedActivity.cost || 0) + transportCost;
            }

            return convertedActivity;
          })
        );

        // 添加处理过的活动到每日计划
        processedActivities.forEach(convertedActivity => {
          dailyCost += convertedActivity.cost || 0;
          dailyPlan.activities.push(convertedActivity);
        });
      }

      dailyPlan.dailyCost = dailyCost;
      dailyPlans.push(dailyPlan);
    }
  }

  // 生成POI数据
  const pois: POIDetail[] = [];
  dailyPlans.forEach(day => {
    day.activities.forEach(activity => {
      if (activity.type === 'attraction' && activity.latitude && activity.longitude) {
        const poi: POIDetail = {
          name: activity.position,
          latitude: activity.latitude,
          longitude: activity.longitude
        };
        
        // 如果活动有pose字段，也添加到POI中
        if (activity.pose) {
          poi.pose = activity.pose;
        }
        
        pois.push(poi);
      }
    });
  });

  return {
    taskId,
    title: `从${exampleData.start_city || demand.startCity}到${exampleData.target_city || demand.destination}的旅程`,
    startCity: exampleData.start_city || demand.startCity,
    destination: exampleData.target_city || demand.destination,
    durationDays: dailyPlans.length,
    numberOfPeople: exampleData.people_number || parseInt(demand.people.split(' ')[0] || "1"),
    budget: parseFloat(demand.budget.split(' ')[0] || "0"),
    currency: "CNY",
    dailyPlans,
    totalEstimatedCost: dailyPlans.reduce((sum, dp) => sum + (dp.dailyCost || 0), 0),
    pois
  };
};

export const getPlanningResult = async (taskId: string): Promise<{ success: boolean; plan?: TravelPlan; error?: string }> => {
  // 首先检查是否已有缓存的完成计划
  if (completedPlans[taskId]) {
    return { success: true, plan: completedPlans[taskId] };
  }
  
  // 检查内存中的请求
  let demand = planningRequests[taskId];
  
  // 如果内存中没有，尝试从localStorage恢复
  if (!demand && typeof window !== 'undefined') {
    try {
      const savedRequests = JSON.parse(localStorage.getItem('planningRequests') || '{}');
      demand = savedRequests[taskId];
      if (demand) {
        planningRequests[taskId] = demand; // 恢复到内存中
      }
    } catch (e) {
      console.warn('无法从localStorage恢复数据:', e);
    }
  }
  
  if (!demand) {
    return { success: false, error: "无效的任务ID或任务已过期。" };
  }

  // 直接返回 example.json 内容
  console.log("直接返回 example.json 内容");
  await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟加载时间
  
  try {
    const exampleData = await loadExampleData();
    if (!exampleData) {
      throw new Error('无法加载示例数据');
    }
    
    const plan = await convertExampleDataToPlan(exampleData, demand, taskId);
    
    // 缓存生成的计划
    completedPlans[taskId] = plan;
    
    // 同时保存到localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedPlans = JSON.parse(localStorage.getItem('completedPlans') || '{}');
        savedPlans[taskId] = plan;
        localStorage.setItem('completedPlans', JSON.stringify(savedPlans));
      } catch (e) {
        console.warn('无法保存计划到localStorage:', e);
      }
    }
    
    return { success: true, plan };
  } catch (error) {
    console.error('处理示例数据时出错:', error);
    // 如果加载示例数据失败，回退到模拟计划
    const mockPlan = generateMockPlan(demand, taskId);
    completedPlans[taskId] = mockPlan;
    
    if (typeof window !== 'undefined') {
      try {
        const savedPlans = JSON.parse(localStorage.getItem('completedPlans') || '{}');
        savedPlans[taskId] = mockPlan;
        localStorage.setItem('completedPlans', JSON.stringify(savedPlans));
      } catch (e) {
        console.warn('无法保存计划到localStorage:', e);
      }
    }
    
    return { success: true, plan: mockPlan };
  }
};


export const modifyExistingPlan = async (
  taskId: string, 
  currentPlan: TravelPlan, 
  modificationRequest: string
): Promise<{ success: boolean; plan?: TravelPlan; error?: string }> => {
  const originalDemand = planningRequests[taskId];
  if (!originalDemand) {
    return { success: false, error: "未找到此任务的原始规划请求。" };
  }

  if (!ai) {
    console.warn("Gemini AI客户端未初始化。返回略微修改的模拟计划。");
    await new Promise(resolve => setTimeout(resolve, 10));
    const modifiedMockPlan = { ...currentPlan };
    if (modifiedMockPlan.dailyPlans.length > 0 && modifiedMockPlan.dailyPlans[0].activities.length > 0) {
      modifiedMockPlan.dailyPlans[0].activities[0].notes = `已修改：${modificationRequest}。${modifiedMockPlan.dailyPlans[0].activities[0].notes || ''}`;
      modifiedMockPlan.title = `${modifiedMockPlan.title}（已修改）`;
    }
    return { success: true, plan: modifiedMockPlan };
  }

  const prompt = `
    You are an expert travel planner AI. A user has an existing travel plan and wants to modify it.
    Original User Request used for the current plan:
    - Start City: ${originalDemand.startCity}
    - Destination: ${originalDemand.destination}
    - Duration: ${originalDemand.duration}
    - Number of People: ${originalDemand.people}
    - Budget: ${originalDemand.budget || '未指定'}
    - Original Additional Requirements: "${originalDemand.rawInput || '未指定'}"

    Current Plan Summary (Start: ${currentPlan.startCity || originalDemand.startCity}, Destination: ${currentPlan.destination}, Duration: ${currentPlan.durationDays} days):
    ${currentPlan.dailyPlans.map(dp => `Day ${dp.day}: ${dp.activities.map(act => act.position).join(', ')}`).join('\n')}

    User's New Modification Request: "${modificationRequest}"

    Based on this new request, update the travel plan. Provide the *complete updated travel plan* as a single, valid JSON object, adhering to the same structure as the original plan generation (specified below).
    Do not include any explanatory text before or after the JSON.
    The JSON structure should be:
    {
      "title": "Updated descriptive title",
      "startCity": "${currentPlan.startCity || originalDemand.startCity}", // Keep or update based on modification
      "destination": "${currentPlan.destination}", // Keep or update based on modification
      "durationDays": ${currentPlan.durationDays}, // Keep or update based on modification
      "numberOfPeople": ${currentPlan.numberOfPeople}, // Keep or update
      "budget": ${currentPlan.budget || originalDemand.budget || 0}, // Keep or update
      "currency": "${currentPlan.currency || 'USD'}",
      "intercityTransportStart": { /* ... */ },
      "dailyPlans": [ { /* ...activities... */ } ],
      "intercityTransportEnd": { /* ... */ },
      "pois": [ { /* ... */ } ],
      "totalEstimatedCost": N, // Ensure this is a single number
      "notes": "Optional. Any important overall notes for the user."
    }
    
    If the modification is minor (e.g. change one activity), reflect that. If it's major (e.g. change destination or duration significantly), regenerate relevant parts or the whole plan structure fitting the modification, but try to keep consistent with the original spirit if possible.
    Ensure all fields are filled plausibly.
    The "totalEstimatedCost" must be a single numeric value.
    `;
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    // Use originalDemand as fallback for core properties not in currentPlan (e.g. if modification implies a reset)
    const baseDemandForParsing = {
        ...originalDemand,
        destination: currentPlan.destination || originalDemand.destination, // Prefer current plan's destination if available
        startCity: currentPlan.startCity || originalDemand.startCity,
    };

    const plan = parseGeminiResponseToTravelPlan(response.text || '', baseDemandForParsing, taskId); 
    if (plan) {
      return { success: true, plan: { ...plan, taskId: currentPlan.taskId } }; 
    } else {
      return { success: false, error: "无法从AI响应中解析修改后的计划。" };
    }
  } catch (error: any) {
    console.error("Error calling Gemini API for modification:", error);
    if (error.message && error.message.includes('permission')) {
         return { success: false, error: `Gemini API 修改过程中权限错误： (${error.message})` };
    }
    return { success: false, error: `Gemini API 修改过程中出错：${error.message || '未知错误'}` };
  }
};
