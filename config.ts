// 应用配置文件
export const config = {
  // 网站信息
  site: {
    name: '智游无界',
    title: '智游无界 - 智能旅行规划助手',
    description: '基于AI的智能旅行规划平台，为您量身定制完美的旅行计划',
    keywords: '旅行规划,旅游计划,AI旅行,智能规划,旅游助手',
    url: 'https://travel-planning.example.com'
  },
  
  // 版权信息
  copyright: {
    year: '2025',
    text: 'Copyright © 2025 智游无界. All rights reserved.',
    icp: '粤ICP备2025443982号-1'
  },
  
  // API配置
  api: {
    baseUrl: 'http://zhiyouwujie.cn/',
    timeout: 30000
  },
  
  // 地图配置
  map: {
    defaultCenter: {
      longitude: 116.397428,
      latitude: 39.90923
    },
    defaultZoom: 13,
    amapKey: 'your-amap-key-here'
  },
  
  // 功能开关
  features: {
    elderMode: true,
    mapView: true,
    exportPlan: true,
    sharePlan: true
  },
  
  // 主题配置
  theme: {
    primaryColor: '#3B82F6',
    secondaryColor: '#EF4444',
    accentColor: '#10B981'
  }
};

export default config;
