
export const GEMINI_TEXT_MODEL = 'gemini-2.0-flash';
export const GEMINI_IMAGE_MODEL = 'imagen-3.0-generate-002';

export const APP_NAME = "智游无界";
export const APP_SLOGAN = "基于大模型的个性化智能旅行规划助手";
export const PLAN_MY_TRIP_BUTTON = "规划我的旅行";

export const MOCK_TASK_ID_PREFIX = "task_";
export const POLLING_INTERVAL = 2000; // 2 seconds - 更快的轮询用于测试

// 高德地图配置
export const AMAP_CONFIG = {
  // 请在高德开放平台(https://lbs.amap.com/)申请您的API Key
  KEY: 'f79d4fa116ec74f2dce7aa0239c893a2', // 请替换为您的高德地图API密钥
  SECURITY_JS_CODE: 'b2a334a4e5d696ee8996ca4bf797e241', // 可选：如果使用了安全密钥，请填入
  VERSION: '2.1Beta',
  PLUGINS: ['AMap.Scale', 'AMap.ControlBar'] // 高德地图2.0版本的控件
};

// 默认地图中心点（北京）
export const DEFAULT_MAP_CENTER = {
  longitude: 116.397428,
  latitude: 39.90923
};
export const MAX_POLLS = 30; // Max 60 seconds of polling - 更长的轮询时间