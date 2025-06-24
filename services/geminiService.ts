
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { UserDemand, TravelPlan, DailyPlan, Activity, POIDetail, TransportDetail } from '../types';
import { GEMINI_TEXT_MODEL, MOCK_TASK_ID_PREFIX } from '../constants';
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

export const startPlanningSession = async (demand: UserDemand): Promise<{ taskId: string }> => {
  const taskId = `${MOCK_TASK_ID_PREFIX}${uuidv4()}`;
  planningRequests[taskId] = demand;
  await new Promise(resolve => setTimeout(resolve, 500)); 
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
          const parts = exprStr.split('+').map(part => parseFloat(part.trim()));
          if (parts.every(p => !isNaN(p))) {
            const calculatedValue = parts.reduce((sum, p) => sum + p, 0);
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

export const getPlanningResult = async (taskId: string): Promise<{ success: boolean; plan?: TravelPlan; error?: string }> => {
  const demand = planningRequests[taskId];
  if (!demand) {
    return { success: false, error: "无效的任务ID或任务已过期。" };
  }

  if (!ai) {
    console.warn("Gemini AI客户端未初始化。返回模拟计划。");
    await new Promise(resolve => setTimeout(resolve, 1500));
    const mockPlan = generateMockPlan(demand, taskId);
    return { success: true, plan: mockPlan };
  }
  
  const prompt = `
    You are an expert travel planner AI. Generate a personalized travel itinerary based on the following user request.
    User Request:
    - Start City: ${demand.startCity}
    - Destination: ${demand.destination}
    - Duration: ${demand.duration}
    - Number of People: ${demand.people}
    - Budget: ${demand.budget || '未指定'}
    - Additional Requirements (natural language input): "${demand.rawInput || '未指定'}"

    Please provide the output as a single, valid JSON object. Do not include any explanatory text before or after the JSON.
    The JSON structure should be:
    {
      "title": "Descriptive title for the trip (e.g., '3-Day Beijing to Paris Culinary Adventure')",
      "startCity": "${demand.startCity}",
      "destination": "${demand.destination}",
      "durationDays": ${parseInt(demand.duration.split(' ')[0] || "1")},
      "numberOfPeople": ${parseInt(demand.people.split(' ')[0] || "1")},
      "budget": ${parseFloat(demand.budget.split(' ')[0] || "0")},
      "currency": "USD", // Or infer from budget if possible, e.g., CNY, EUR. Default to USD if unsure.
      "intercityTransportStart": { "mode": "Train/Flight/Car", "from": "${demand.startCity}", "to": "${demand.destination}", "duration": "Xh Ym", "cost": N, "departureTime": "HH:MM", "arrivalTime": "HH:MM", "details": "Flight XYZ / Train ABC" }, // Optional but recommended
      "dailyPlans": [
        {
          "day": 1,
          "summary": "Brief summary for Day 1, mentioning activities and flow.",
          "activities": [
            {
              "id": "unique_activity_id_1_1",
              "position": "Name of Place/Activity 1",
              "type": "attraction/dining/accommodation/travel/other",
              "startTime": "HH:MM",
              "endTime": "HH:MM",
              "cost": N, // Estimated cost in specified currency
              "pictureUrl": "https://picsum.photos/seed/UNIQUE_ACTIVITY_NAME_DAY1_1/300/200", // Use picsum.photos as placeholder, ensure UNIQUE_ACTIVITY_NAME is URL friendly
              "notes": "Brief notes about the activity, what makes it interesting, tips.",
              "latitude": 0.0, // Approximate latitude
              "longitude": 0.0, // Approximate longitude
              "transportTo": { "mode": "Subway/Bus/Taxi/Walk", "from": "Previous Activity/Hotel", "to": "Current Activity", "duration": "Xm", "cost": N, "details": "Line X / Bus Y" }, // Optional
              "foodInfo": { "name": "Restaurant Name", "type": "Cuisine Type", "estimatedCost": N, "notes": "Specialty dishes, reservation info..." }, // if type is dining
              "accommodationInfo": { "name": "Hotel Name", "type": "Hotel/Hostel", "cost": N } // if type is accommodation
            }
            // ... More activities for Day 1
          ],
          "dailyCost": N // Estimated total cost for Day 1
        }
        // ... More daily plans
      ],
      "intercityTransportEnd": { "mode": "Train/Flight/Car", "from": "${demand.destination}", "to": "${demand.startCity}", "duration": "Xh Ym", "cost": N, "departureTime": "HH:MM", "arrivalTime": "HH:MM", "details": "Flight XYZ / Train ABC" }, // Optional, for return trip
      "pois": [ { "name": "Key POI Name 1", "latitude": 0.0, "longitude": 0.0 }, { "name": "Key POI Name 2", "latitude": 0.0, "longitude": 0.0 } ], // List of key points of interest with coordinates
      "totalEstimatedCost": N, // Total estimated cost for the trip (sum of daily costs and intercity transport)
      "notes": "Optional. Any important overall notes for the user, like budget considerations, visa requirements, general tips for the destination. If the budget is tight, mention it here."
    }

    // Ensure all fields are plausibly filled. For pictureUrl, use "https://picsum.photos/seed/UNIQUE_NAME/300/200" format, where UNIQUE_NAME is derived from activity name and is URL-encoded.
    // Generate a realistic and engaging itinerary. If a budget is specified, try to stay within it.
    // Prioritize activities mentioned in additional requirements.
    // Ensure latitude and longitude are plausible for the destination.
    // The "totalEstimatedCost" should be a single number.
    `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" } 
    });

    const plan = parseGeminiResponseToTravelPlan(response.text, demand, taskId);
    if (plan) {
      return { success: true, plan };
    } else {
      return { success: false, error: "无法解析生成的计划。AI可能返回了意外的格式。" };
    }
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    if (error.message && error.message.includes('permission')) {
         return { success: false, error: `Gemini API 权限错误：可能是API密钥无效或计费未设置。 (${error.message})` };
    }
    return { success: false, error: `Gemini API 错误：${error.message || '未知错误'}` };
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
    await new Promise(resolve => setTimeout(resolve, 1500));
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

    const plan = parseGeminiResponseToTravelPlan(response.text, baseDemandForParsing, taskId); 
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
