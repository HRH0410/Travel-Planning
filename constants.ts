export const APP_NAME = "智游无界";
export const APP_SLOGAN = "基于大模型的个性化智能旅行规划助手";
export const PLAN_MY_TRIP_BUTTON = "规划我的旅行";

export const POLLING_INTERVAL = 1000; // 1 second - 更快的轮询用于测试

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
export const MAX_POLLS = 120; // Max 60 seconds of polling - 更长的轮询时间

// 城市配置
export const CITIES = [
  "上海", "北京", "深圳", "广州", "重庆",
  "苏州", "成都", "杭州", "武汉", "南京"
];

// 后端API配置
export const BACKEND_CONFIG = {
  BASE_URL: 'http://139.224.213.196:8082', // Python Flask服务器地址
  ENDPOINTS: {
    START_PLAN: '/plan/start',
    GET_RESULT: '/plan/result',
    GEO_CODING: '/geocoding',
    BATCH_GEO_CODING: '/geocoding/batch'
  }
};