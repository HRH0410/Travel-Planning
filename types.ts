
export interface POIDetail {
  name: string;
  latitude: number;
  longitude: number;
}

export interface TransportDetail {
  mode: string; // e.g., 'Flight', 'Train', 'Car', 'Subway', 'Walk'
  from: string;
  to: string;
  duration?: string; // e.g., '2h 30m'
  cost?: number;
  departureTime?: string;
  arrivalTime?: string;
  details?: string; // e.g., 'Flight AA123' or 'Subway Line 2'
}

export interface FoodInfo {
  name: string;
  type?: string; // e.g., 'Local Specialty', 'Michelin Star', 'Cafe'
  estimatedCost?: number;
  notes?: string;
  pictureUrl?: string;
}

export interface Activity {
  id: string; // Unique ID for the activity
  position: string; // Name of the place, e.g., "Eiffel Tower"
  type: 'attraction' | 'dining' | 'accommodation' | 'travel' | 'other';
  startTime: string; // e.g., "09:00"
  endTime: string; // e.g., "11:00"
  cost?: number;
  pictureUrl?: string; // Placeholder like https://picsum.photos/300/200
  notes?: string;
  transportTo?: TransportDetail; // Transport to this activity
  foodInfo?: FoodInfo; // If the activity is dining
  accommodationInfo?: { name: string; type?: string; cost?: number; };
  latitude?: number;
  longitude?: number;
}

export interface DailyPlan {
  day: number; // e.g., 1, 2, 3
  date?: string; // e.g., "2024-08-15"
  summary?: string;
  activities: Activity[];
  dailyCost?: number;
}

export interface TravelPlan {
  taskId: string;
  title?: string; // e.g., "Paris 3-Day Art & Food Trip"
  startCity?: string; // Added start city for clarity in the plan
  destination: string;
  durationDays: number;
  numberOfPeople: number;
  budget?: number;
  dailyPlans: DailyPlan[];
  totalEstimatedCost?: number;
  currency?: string; // e.g., "USD", "EUR"
  pois?: POIDetail[]; // List of all points of interest with coordinates
  intercityTransportStart?: TransportDetail;
  intercityTransportEnd?: TransportDetail;
}

// For user input form
export interface UserDemand {
  startCity: string; // Added: 出发城市
  destination: string; // 目的地城市
  duration: string; // 旅行天数 e.g., "3天"
  people: string; // 旅行人数 e.g., "2人"
  budget: string; // 预算 (可选) e.g., "2000 USD"
  rawInput: string; // 额外需求描述 (可选) The full natural language input
}

export interface RecognizedTag {
  id: string;
  category: string; // e.g., "Destination", "Duration", "Budget"
  value: string;
}

export enum AppView {
  Home = 'Home',
  DemandInput = 'DemandInput',
  Planning = 'Planning',
}

// For Gemini Service
export interface GeminiRequest {
  model: string;
  contents: string | { parts: Array<{text?: string, inlineData?: {mimeType: string, data: string}}> };
  config?: GeminiModelConfig;
}

export interface GeminiModelConfig {
  systemInstruction?: string;
  topK?: number;
  topP?: number;
  temperature?: number;
  responseMimeType?: string;
  seed?: number;
  thinkingConfig?: { thinkingBudget: number };
  tools?: Array<{googleSearch: Record<string, unknown>}>;
}