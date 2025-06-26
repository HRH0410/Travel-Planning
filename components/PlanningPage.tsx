import React, { useState, useEffect } from 'react';
import { TravelPlan, Activity, DailyPlan, POIDetail } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { LoadingSpinner, SkeletonLoader } from './ui/LoadingSpinner';
import { Splitter } from './ui/Splitter';
import { Modal } from './ui/Modal';
import { AmapComponent } from './ui/AmapComponent';
import { geocodeAddress, extractLocationName, isValidCoordinate, updateTravelPlanCoordinates } from '../services/geocodingService';

interface ItineraryViewProps {
  dailyPlans: DailyPlan[];
  currency?: string;
  onShowGlobalModal: () => void;
  activeDay: number;
  setActiveDay: (day: number) => void;
  hideTransport: boolean;
  setHideTransport: (hide: boolean) => void;
}

const getActivityEmoji = (activity: Activity): string => {
  switch (activity.type) {
    case 'travel':
    case 'train':
      if (activity.TrainID) return '🚆'; // 火车
      switch (activity.transportTo?.mode?.toLowerCase() || activity.transports?.[0]?.mode?.toLowerCase()) {
        case 'flight': return '✈️';
        case 'train': return '🚆';
        case 'car': case 'taxi': case 'ride-share': return '🚗';
        case 'bus': return '🚌';
        case 'subway': case 'metro': return '🚇';
        case 'walk': return '🚶';
        case 'ferry': case 'boat': return '🚢';
        default: return '📍'; 
      }
    case 'dining':
    case 'lunch':
    case 'dinner':
      return '🍽️';
    case 'accommodation':
      return '🏨';
    case 'attraction':
      return '✨';
    case 'other':
    default:
      return '📝';
  }
};

const formatActivityTime = (activity: Activity): string => {
  const startTime = activity.startTime || activity.start_time;
  const endTime = activity.endTime || activity.end_time;
  
  if (startTime && endTime) {
    return `${startTime} - ${endTime}`;
  }
  if (startTime) {
    return `从 ${startTime}`;
  }
  if (endTime) {
    return `直到 ${endTime}`;
  }
  return '时间未定';
};

// 新增：判断是否为开始/结束通勤
const isStartOrEndTravel = (activities: Activity[], index: number): boolean => {
  const activity = activities[index];
  const isTravel = activity.type === 'travel' || activity.type === 'train';
  
  if (!isTravel) return false;
  
  // 检查前一个和后一个活动
  const nextActivity = index < activities.length - 1 ? activities[index + 1] : null;
  const prevActivity = index > 0 ? activities[index - 1] : null;
  
  // 如果是第一个活动，且后面有非通勤活动，则为开始通勤
  if (index === 0 && nextActivity && nextActivity.type !== 'travel' && nextActivity.type !== 'train') {
    return true;
  }
  
  // 如果是最后一个活动，且前面有非通勤活动，则为结束通勤
  if (index === activities.length - 1 && prevActivity && prevActivity.type !== 'travel' && prevActivity.type !== 'train') {
    return true;
  }
  
  // 其他情况都是景点间通勤
  return false;
};

// 新增：TransportChain组件 - 带折叠功能的通勤链条
interface TransportChainProps {
  activity: Activity;
  displayCurrency: string;
}

const TransportChain: React.FC<TransportChainProps> = ({ activity, displayCurrency }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!activity.transports || activity.transports.length === 0) {
    return null;
  }

  // 计算总时长和总费用
  const totalCost = activity.transports.reduce((sum, t) => sum + (t.cost || 0), 0);
  const firstTransport = activity.transports[0];
  const lastTransport = activity.transports[activity.transports.length - 1];
  const totalDuration = firstTransport.start_time && lastTransport.end_time 
    ? calculateDuration(firstTransport.start_time, lastTransport.end_time)
    : null;

  // 获取主要交通方式的图标
  const getPrimaryTransportIcon = () => {
    if (!activity.transports || activity.transports.length === 0) return '🚇';
    const mainTransport = activity.transports.find(t => t.mode !== 'walk') || activity.transports[0];
    return mainTransport.mode === 'walk' ? '🚶' : 
           mainTransport.mode === 'metro' ? '🚇' : 
           mainTransport.mode === 'train' ? '🚆' : 
           mainTransport.mode === 'flight' ? '✈️' : 
           mainTransport.mode === 'bus' ? '🚌' : 
           mainTransport.mode === 'car' || mainTransport.mode === 'taxi' ? '🚗' : '🚌';
  };

  return (
    <div className="relative mb-4 flex">
      <div className="flex items-start relative w-full min-h-full">
        {/* 左侧连接线和图标 */}
        <div className="flex flex-col items-center mr-4 flex-shrink-0 relative" style={{ minHeight: '100%' }}>
          {/* 上方连接线 */}
          <div className="w-0.5 bg-gradient-to-b from-gray-300 to-blue-400 h-4"></div>
          <div className="bg-white rounded-full p-2 border-2 border-blue-400 text-blue-600 shadow-md z-10">
            <span className="text-sm block w-5 h-5 text-center leading-5">{getPrimaryTransportIcon()}</span>
          </div>
          {/* 下方连接线 - 根据展开状态动态调整高度，确保延伸到容器底部 */}
          <div className={`w-0.5 bg-gradient-to-b from-blue-400 to-gray-300 ${isExpanded ? 'flex-1' : 'h-4'}`} style={{ minHeight: isExpanded ? '200px' : '16px' }}></div>
        </div>
        
        {/* 右侧气泡框 */}
        <div className="flex-1 bg-white rounded-lg shadow-md border border-gray-200 p-3 relative">
          {/* 指向图标的小箭头 - 对准圆形图标中心 */}
          <div className="absolute left-[-8px] top-[24px] w-0 h-0 border-t-[8px] border-b-[8px] border-r-[8px] border-transparent border-r-gray-200"></div>
          <div className="absolute left-[-7px] top-[24px] w-0 h-0 border-t-[7px] border-b-[7px] border-r-[7px] border-transparent border-r-white"></div>
          
          {/* 点击区域 */}
          <div 
            className="cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">
                  前往 {activity.position ? activity.position.split(' → ')[0] : (activity.start || '目的地')}
                </span>
                <svg 
                  className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* 折叠状态显示的摘要信息 */}
            {!isExpanded && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  {totalDuration && (
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-600 text-sm">{totalDuration}</span>
                    </div>
                  )}
                  {totalCost > 0 && (
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span className="text-green-600 font-medium text-sm">{totalCost} {displayCurrency}</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400">点击展开</div>
              </div>
            )}
          </div>
          
          {/* 展开状态显示的详细信息 */}
          {isExpanded && (
            <div className="mt-3 space-y-3">
              {/* 交通链条 */}
              <div>
                <div className="space-y-2">
                  {activity.transports.map((transport, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                      {/* 交通方式和费用标题行 */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">
                            {transport.mode === 'walk' ? '🚶' : 
                             transport.mode === 'metro' ? '🚇' : 
                             transport.mode === 'train' ? '🚆' : 
                             transport.mode === 'flight' ? '✈️' : 
                             transport.mode === 'bus' ? '🚌' : 
                             transport.mode === 'car' || transport.mode === 'taxi' ? '🚗' : '🚌'}
                          </span>
                          <span className="font-medium text-sm">
                            {transport.mode === 'walk' ? '步行' : 
                             transport.mode === 'metro' ? '地铁' : 
                             transport.mode === 'train' ? '火车' : 
                             transport.mode === 'flight' ? '飞行' : 
                             transport.mode === 'bus' ? '公交' : 
                             transport.mode === 'car' || transport.mode === 'taxi' ? '出行' : transport.mode}
                          </span>
                        </div>
                        {transport.cost && transport.cost > 0 && (
                          <span className="text-green-600 font-medium text-sm">{transport.cost}{displayCurrency}</span>
                        )}
                      </div>
                      
                      {/* 响应式详情信息 - 使用 flex-wrap 让内容自动换行 */}
                      <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                        {transport.start && transport.end && (
                          <div className="flex items-center gap-1 min-w-0">
                            <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 32 32">
                              <defs></defs><path d="M16 2A11.013 11.013 0 0 0 5 13a10.889 10.889 0 0 0 2.216 6.6s.3.395.349.452L16 30l8.439-9.953c.044-.053.345-.447.345-.447l.001-.003A10.885 10.885 0 0 0 27 13A11.013 11.013 0 0 0 16 2zm0 15a4 4 0 1 1 4-4a4.005 4.005 0 0 1-4 4z" fill="currentColor"></path><circle id="_Inner-Path_" cx="16" cy="13" r="4" fill="none"></circle>
                            </svg>
                            <span className="truncate">从 {transport.start} 到 {transport.end}</span>
                          </div>
                        )}
                        {transport.start_time && transport.end_time && (
                          <div className="flex items-center gap-1 min-w-0">
                            <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span>{transport.start_time} - {transport.end_time}</span>
                          </div>
                        )}
                        {transport.distance && (
                          <div className="flex items-center gap-1 min-w-0">
                            <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 576 512">
                              <path d="M573.19 402.67l-139.79-320C428.43 71.29 417.6 64 405.68 64h-97.59l2.45 23.16c.5 4.72-3.21 8.84-7.96 8.84h-29.16c-4.75 0-8.46-4.12-7.96-8.84L267.91 64h-97.59c-11.93 0-22.76 7.29-27.73 18.67L2.8 402.67C-6.45 423.86 8.31 448 30.54 448h196.84l10.31-97.68c.86-8.14 7.72-14.32 15.91-14.32h68.8c8.19 0 15.05 6.18 15.91 14.32L348.62 448h196.84c22.23 0 36.99-24.14 27.73-45.33zM260.4 135.16a8 8 0 0 1 7.96-7.16h39.29c4.09 0 7.53 3.09 7.96 7.16l4.6 43.58c.75 7.09-4.81 13.26-11.93 13.26h-40.54c-7.13 0-12.68-6.17-11.93-13.26l4.59-43.58zM315.64 304h-55.29c-9.5 0-16.91-8.23-15.91-17.68l5.07-48c.86-8.14 7.72-14.32 15.91-14.32h45.15c8.19 0 15.05 6.18 15.91 14.32l5.07 48c1 9.45-6.41 17.68-15.91 17.68z" fill="currentColor"></path>
                            </svg>
                            <span>{transport.distance}km</span>
                          </div>
                        )}
                        {transport.duration && (
                          <div className="flex items-center gap-1 min-w-0">
                            <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 16 16">
                              <g fill="none"><path d="M5 1.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5zM7.5 15a6 6 0 1 0 0-12a6 6 0 0 0 0 12zm0-10a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 1 .5-.5zm4.953-2.358a.5.5 0 1 0-.707.707l1.403 1.403a.5.5 0 1 0 .707-.707l-1.403-1.403z" fill="currentColor"></path></g>
                            </svg>
                            <span>{transport.duration}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* 连接箭头（除了最后一个） */}
                      {idx < (activity.transports?.length || 0) - 1 && (
                        <div className="flex justify-center mt-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 费用和时间总计 */}
              <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                {totalDuration && (
                  <div className="flex items-center gap-1 text-sm">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-600">总用时: {totalDuration}</span>
                  </div>
                )}
                {totalCost > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span className="text-green-600 font-medium">总花费: {totalCost} {displayCurrency}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 计算时间差的辅助函数
const calculateDuration = (startTime: string, endTime: string): string => {
  try {
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    const diffMs = end.getTime() - start.getTime();
    const diffMinutes = Math.round(diffMs / 60000);
    
    if (diffMinutes < 60) {
      return `${diffMinutes}分钟`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return minutes > 0 ? `${hours}小时${minutes}分钟` : `${hours}小时`;
    }
  } catch (error) {
    return '';
  }
};

// 新增：TravelTimeline组件
interface TravelTimelineProps {
  activities: Activity[];
  displayCurrency: string;
  hideTransport?: boolean;
}

const TravelTimeline: React.FC<TravelTimelineProps> = ({ activities, displayCurrency, hideTransport = false }) => {
  // 添加调试信息
  console.log('所有活动:', activities.map((act, idx) => ({
    index: idx,
    type: act.type,
    position: act.position,
    isTravel: act.type === 'travel' || act.type === 'train',
    hasTransports: !!(act.transports && act.transports.length > 0)
  })));

  // 检查是否有任何形式的通勤数据
  const hasAnyTravel = activities.some(act => 
    act.type === 'travel' || 
    act.type === 'train' || 
    (act.transports && act.transports.length > 0)
  );
  
  console.log('是否有通勤数据:', hasAnyTravel);
  
  return (
    <div className="space-y-0">
      {activities.map((activity, index) => {
        const isTravel = activity.type === 'travel' || activity.type === 'train';
        const isStartEnd = isStartOrEndTravel(activities, index);
        
        console.log(`活动 ${index}:`, {
          type: activity.type,
          position: activity.position,
          isTravel,
          isStartEnd,
          hasTransports: !!(activity.transports && activity.transports.length > 0)
        });
        
        return (
          <div key={activity.id || index} className="relative">
            {/* 显示通勤链条 - 在当前非旅行活动前显示前往此地的交通信息 */}
            {!hideTransport && !isTravel && index > 0 && activity.transports && activity.transports.length > 0 && (
              <TransportChain 
                activity={activity} 
                displayCurrency={displayCurrency} 
              />
            )}
            
            {/* 景点/活动卡片 */}
            {!isTravel && (
              <div 
                className="flex items-center gap-3 sm:gap-4 bg-white rounded-lg shadow-sm p-2 sm:p-3 transition-all duration-200 hover:ring-2 hover:ring-blue-200 mb-2 relative z-10"
                data-activity={activity.position || `activity-${index}`}
              >
                {activity.pictureUrl && (
                  <img src={activity.pictureUrl} alt={activity.position} className="rounded-lg object-cover h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xl">{getActivityEmoji(activity)}</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-500">{formatActivityTime(activity)}</span>
                  </div>
                  <div className="font-semibold text-gray-800 text-sm sm:text-base mb-0.5 truncate">
                    {activity.position || '未知位置'}
                  </div>
                  {activity.notes && <div className="text-xs sm:text-sm text-gray-600 truncate">{activity.notes}</div>}
                  {activity.cost && activity.cost > 0 && <div className="text-xs sm:text-sm font-medium text-green-600">花费：{activity.cost} {displayCurrency}</div>}
                </div>
              </div>
            )}

            {/* 显示从当前景点到返程的通勤链条 - 如果下一个活动是返程的旅行活动 */}
            {!hideTransport && !isTravel && index < activities.length - 1 && 
             activities[index + 1] && 
             (activities[index + 1].type === 'travel' || activities[index + 1].type === 'train') &&
             isStartOrEndTravel(activities, index + 1) && 
             activities[index + 1].transports && 
             activities[index + 1].transports!.length > 0 && (
              <TransportChain 
                activity={activities[index + 1]} 
                displayCurrency={displayCurrency} 
              />
            )}
            
            {/* 通勤：开始/结束用卡片，景点间用连接线 */}
            {!hideTransport && isTravel && (
              <>
                {isStartEnd ? (
                  /* 开始/结束通勤卡片 */
                  <div className="flex items-center gap-3 sm:gap-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm p-2 sm:p-3 transition-all duration-200 hover:ring-2 hover:ring-blue-300 mb-2">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg text-blue-600">{getActivityEmoji(activity)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs sm:text-sm font-medium text-blue-600">
                          {index === 0 ? '出发' : '返程'}
                        </span>
                        {activity.TrainID && (
                          <span className="text-xs sm:text-sm font-medium text-blue-600">
                            车次: {activity.TrainID}
                          </span>
                        )}
                        <span className="text-xs sm:text-sm font-medium text-gray-500">{formatActivityTime(activity)}</span>
                      </div>
                      <div className="font-semibold text-gray-800 text-sm sm:text-base mb-0.5 truncate">
                        {activity.position ? activity.position.split(' → ')[0] : (activity.start && activity.end ? `${activity.start} → ${activity.end}` : '路线信息')}
                      </div>
                      {/* 只有在没有transports数据或者是出发时才显示交通信息 */}
                      {(!activity.transports || activity.transports.length === 0 || index === 0) && activity.transports && activity.transports.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          <span>交通: </span>
                          {activity.transports.map((transport, idx) => (
                            <span key={idx} className="mr-2">
                              {transport.mode === 'walk' ? '🚶' : 
                               transport.mode === 'metro' ? '🚇' : 
                               transport.mode === 'train' ? '🚆' : '🚗'}
                              {transport.mode}
                              {transport.cost && transport.cost > 0 && (
                                <span className="text-green-600 ml-1">({transport.cost}{displayCurrency})</span>
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                      {activity.cost && activity.cost > 0 && <div className="text-xs sm:text-sm font-medium text-green-600">花费：{activity.cost} {displayCurrency}</div>}
                    </div>
                  </div>
                ) : (
                  /* 景点间通勤连接线 - 完整展示 */
                  <div className="flex items-start py-3 relative">
                    {/* 左侧连接线 */}
                    <div className="flex flex-col items-center mr-4 flex-shrink-0">
                      <div className="w-0.5 h-8 bg-gradient-to-b from-blue-200 via-blue-400 to-blue-200 relative">
                        <div className="absolute left-1/2 top-2 transform -translate-x-1/2 w-1 h-1 bg-blue-300 rounded-full"></div>
                        <div className="absolute left-1/2 bottom-2 transform -translate-x-1/2 w-1 h-1 bg-blue-300 rounded-full"></div>
                      </div>
                      <div className="mt-2 bg-white rounded-full p-2 border-2 border-blue-400 text-blue-600 shadow-md">
                        <span className="text-sm block w-5 h-5 text-center leading-5">{getActivityEmoji(activity)}</span>
                      </div>
                    </div>
                    
                    {/* 右侧气泡框 - 始终展开显示详细信息 */}
                    <div className="flex-1 bg-white rounded-lg shadow-md border border-gray-200 p-3 relative">
                      {/* 指向连接线的小箭头 */}
                      <div className="absolute left-[-8px] top-4 w-0 h-0 border-t-[8px] border-b-[8px] border-r-[8px] border-transparent border-r-gray-200"></div>
                      <div className="absolute left-[-7px] top-4 w-0 h-0 border-t-[7px] border-b-[7px] border-r-[7px] border-transparent border-r-white"></div>
                      
                      {/* 显示详细链条 */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700">通勤详情</span>
                          </div>
                          <span className="text-xs text-gray-500">{formatActivityTime(activity)}</span>
                        </div>
                        
                        <div className="text-sm font-medium text-gray-800 mb-3">
                          {activity.position ? activity.position.split(' → ')[0] : (activity.start && activity.end ? `${activity.start} → ${activity.end}` : '路线信息')}
                        </div>
                        
                        {activity.TrainID && (
                          <div className="flex items-center gap-1 mb-3 bg-blue-50 p-2 rounded">
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                            </svg>
                            <span className="text-xs text-blue-600 font-medium">车次: {activity.TrainID}</span>
                          </div>
                        )}
                        
                        {activity.notes && (
                          <div className="text-xs text-gray-600 mb-3 italic bg-gray-50 p-2 rounded">{activity.notes}</div>
                        )}
                        
                        {/* 交通链条 */}
                        {activity.transports && activity.transports.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs text-gray-500 mb-2">交通方式链条:</div>
                            <div className="space-y-2">
                              {activity.transports.map((transport, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded text-xs">
                                  <div className="flex items-center gap-1 flex-1">
                                    <span className="text-base">
                                      {transport.mode === 'walk' ? '🚶' : 
                                       transport.mode === 'metro' ? '🚇' : 
                                       transport.mode === 'train' ? '🚆' : 
                                       transport.mode === 'flight' ? '✈️' : 
                                       transport.mode === 'bus' ? '🚌' : 
                                       transport.mode === 'car' || transport.mode === 'taxi' ? '🚗' : '🚌'}
                                    </span>
                                    <span className="font-medium">
                                      {transport.mode === 'walk' ? '步行' : 
                                       transport.mode === 'metro' ? '地铁' : 
                                       transport.mode === 'train' ? '火车' : 
                                       transport.mode === 'flight' ? '飞行' : 
                                       transport.mode === 'bus' ? '公交' : 
                                       transport.mode === 'car' || transport.mode === 'taxi' ? '出行' : transport.mode}
                                    </span>
                                    {transport.duration && (
                                      <span className="text-gray-500">• {transport.duration}</span>
                                    )}
                                  </div>
                                  {transport.cost && transport.cost > 0 && (
                                    <span className="text-green-600 font-medium">{transport.cost}{displayCurrency}</span>
                                  )}
                                  {idx < (activity.transports?.length || 0) - 1 && (
                                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* 费用总计 */}
                        {activity.cost && activity.cost > 0 && (
                          <div className="flex items-center gap-1 bg-green-50 p-2 rounded">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            <span className="text-xs font-medium text-green-700">总花费：{activity.cost} {displayCurrency}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

const ItineraryView: React.FC<ItineraryViewProps> = ({ 
  dailyPlans, 
  currency, 
  onShowGlobalModal, 
  activeDay, 
  setActiveDay,
  hideTransport,
  setHideTransport
}) => {
  const displayCurrency = currency || '元';

  useEffect(() => {
    if (dailyPlans && dailyPlans.length > 0 && !dailyPlans.find(dp => dp.day === activeDay)) {
      setActiveDay(dailyPlans[0].day);
    }
  }, [dailyPlans, activeDay, setActiveDay]);

  if (!dailyPlans || dailyPlans.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        行程详情将在此处显示。
      </div>
    );
  }

  const currentDayPlan = dailyPlans.find(dp => dp.day === activeDay);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-100 flex items-center gap-2 flex-wrap flex-shrink-0">
        {dailyPlans.map(dp => (
          <Button
            key={dp.day}
            variant={dp.day === activeDay ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveDay(dp.day)}
            className="whitespace-nowrap"
          >
            第 {dp.day} 天
          </Button>
        ))}
        <div className="flex-1"></div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setHideTransport(!hideTransport)}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          title={hideTransport ? "显示通勤" : "隐藏通勤"}
        >
          {hideTransport ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <g fill="none"><path d="M2.22 2.22a.75.75 0 0 0-.073.976l.073.084l4.034 4.035a9.986 9.986 0 0 0-3.955 5.75a.75.75 0 0 0 1.455.364a8.49 8.49 0 0 1 3.58-5.034l1.81 1.81A4 4 0 0 0 14.8 15.86l5.919 5.92a.75.75 0 0 0 1.133-.977l-.073-.084l-6.113-6.114l.001-.002l-1.2-1.198l-2.87-2.87h.002L8.719 7.658l.001-.002l-1.133-1.13L3.28 2.22a.75.75 0 0 0-1.06 0zm7.984 9.045l3.535 3.536a2.5 2.5 0 0 1-3.535-3.535zM12 5.5c-1 0-1.97.148-2.889.425l1.237 1.236a8.503 8.503 0 0 1 9.899 6.272a.75.75 0 0 0 1.455-.363A10.003 10.003 0 0 0 12 5.5zm.195 3.51l3.801 3.8a4.003 4.003 0 0 0-3.801-3.8z" fill="currentColor"></path></g>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <g fill="none"><path d="M12 9.005a4 4 0 1 1 0 8a4 4 0 0 1 0-8zm0 1.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5zM12 5.5c4.613 0 8.596 3.15 9.701 7.564a.75.75 0 1 1-1.455.365a8.504 8.504 0 0 0-16.493.004a.75.75 0 0 1-1.456-.363A10.003 10.003 0 0 1 12 5.5z" fill="currentColor"></path></g>
            </svg>
          )}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onShowGlobalModal}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          title="修改行程"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </Button>
      </div>
      <div className="flex-1 p-2 sm:p-4 bg-gray-50 rounded-b-lg overflow-y-auto min-h-0">
        {currentDayPlan?.activities && currentDayPlan.activities.length > 0 ? (
          <TravelTimeline 
            activities={currentDayPlan.activities} 
            displayCurrency={displayCurrency}
            hideTransport={hideTransport}
          />
        ) : (
          <p className="text-gray-500 text-center py-4 pb-4">此日无活动安排。</p>
        )}
      </div>
    </div>
  );
};

interface MapViewProps {
  pois?: POIDetail[];
  hoveredActivityId: string | null;
  onActivityHover: (activityId: string | null) => void;
  dailyPlans?: DailyPlan[];
  activeDay?: number;
  setActiveDay?: (day: number) => void;
}

const MapView: React.FC<MapViewProps> = ({ 
  pois, 
  hoveredActivityId, 
  onActivityHover,
  dailyPlans,
  activeDay,
  setActiveDay 
}) => {
  const [markers, setMarkers] = useState<Array<{
    longitude: number;
    latitude: number;
    name: string;
    type?: 'attraction' | 'dining' | 'accommodation' | 'travel' | 'other';
  }>>([]);
  const [isLoadingCoordinates, setIsLoadingCoordinates] = useState(false);
  
  // 检查是否有pose字段（已保存的坐标）
  const hasValidPose = (item: any): boolean => {
    return item.pose && 
           typeof item.pose === 'object' && 
           isValidCoordinate(item.pose.longitude, item.pose.latitude);
  };

  // 保存坐标到localStorage
  const saveCoordinatesToStorage = (key: string, coordinates: { [name: string]: { longitude: number; latitude: number } }) => {
    try {
      const existingData = JSON.parse(localStorage.getItem('saved_coordinates') || '{}');
      existingData[key] = { ...existingData[key], ...coordinates };
      localStorage.setItem('saved_coordinates', JSON.stringify(existingData));
    } catch (error) {
      console.warn('无法保存坐标到localStorage:', error);
    }
  };

  // 从localStorage获取保存的坐标
  const getSavedCoordinates = (key: string): { [name: string]: { longitude: number; latitude: number } } => {
    try {
      const savedData = JSON.parse(localStorage.getItem('saved_coordinates') || '{}');
      return savedData[key] || {};
    } catch (error) {
      console.warn('无法从localStorage读取坐标:', error);
      return {};
    }
  };
  
  // 修复坐标的函数
  const fixInvalidCoordinates = async (initialMarkers: Array<{
    longitude: number;
    latitude: number;
    name: string;
    type?: 'attraction' | 'dining' | 'accommodation' | 'travel' | 'other';
    hasPose?: boolean;
  }>) => {
    if (initialMarkers.length === 0) return initialMarkers;
    
    const fixedMarkers = [...initialMarkers];
    const newCoordinates: { [name: string]: { longitude: number; latitude: number } } = {};
    const storageKey = `plan_${activeDay}_${new Date().toDateString()}`;
    const savedCoordinates = getSavedCoordinates(storageKey);
    
    // 只处理没有pose字段且坐标无效的标记
    const markersNeedingFix = fixedMarkers.filter(marker => 
      !marker.hasPose && 
      !isValidCoordinate(marker.longitude, marker.latitude) &&
      !savedCoordinates[marker.name]
    );
    
    if (markersNeedingFix.length === 0) {
      // 应用已保存的坐标
      fixedMarkers.forEach((marker, index) => {
        if (savedCoordinates[marker.name]) {
          fixedMarkers[index] = {
            ...marker,
            longitude: savedCoordinates[marker.name].longitude,
            latitude: savedCoordinates[marker.name].latitude
          };
        }
      });
      return fixedMarkers;
    }
    
    setIsLoadingCoordinates(true);
    
    for (let i = 0; i < fixedMarkers.length; i++) {
      const marker = fixedMarkers[i];
      
      // 先检查是否有保存的坐标
      if (savedCoordinates[marker.name]) {
        fixedMarkers[i] = {
          ...marker,
          longitude: savedCoordinates[marker.name].longitude,
          latitude: savedCoordinates[marker.name].latitude
        };
        continue;
      }
      
      // 只对没有pose字段且坐标无效的标记进行API调用
      if (!marker.hasPose && !isValidCoordinate(marker.longitude, marker.latitude)) {
        console.log(`修复无效坐标: ${marker.name}`);
        
        // 提取清洁的地点名称
        const cleanName = extractLocationName(marker.name);
        const geocodingResult = await geocodeAddress(cleanName);
        
        if (geocodingResult) {
          fixedMarkers[i] = {
            ...marker,
            longitude: geocodingResult.longitude,
            latitude: geocodingResult.latitude
          };
          
          // 保存新获取的坐标
          newCoordinates[marker.name] = {
            longitude: geocodingResult.longitude,
            latitude: geocodingResult.latitude
          };
          
          console.log(`成功修复坐标: ${marker.name} -> (${geocodingResult.longitude}, ${geocodingResult.latitude})`);
        } else {
          console.warn(`无法修复坐标: ${marker.name}`);
        }
        
        // 添加延迟避免API限流
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // 保存新获取的坐标
    if (Object.keys(newCoordinates).length > 0) {
      saveCoordinatesToStorage(storageKey, newCoordinates);
    }
    
    setIsLoadingCoordinates(false);
    return fixedMarkers;
  };

  // 初始化标记点
  useEffect(() => {
    const initializeMarkers = async () => {
      const initialMarkers: Array<{
        longitude: number;
        latitude: number;
        name: string;
        type?: 'attraction' | 'dining' | 'accommodation' | 'travel' | 'other';
        hasPose?: boolean;
      }> = [];

      // 添加POI点
      if (pois && pois.length > 0) {
        pois.forEach(poi => {
          const hasPose = hasValidPose(poi);
          initialMarkers.push({
            longitude: hasPose && poi.pose ? poi.pose.longitude : (poi.longitude || 0),
            latitude: hasPose && poi.pose ? poi.pose.latitude : (poi.latitude || 0),
            name: poi.name,
            type: 'attraction',
            hasPose
          });
        });
      }

      // 添加当日活动点
      if (dailyPlans && activeDay) {
        const currentDayPlan = dailyPlans.find(dp => dp.day === activeDay);
        if (currentDayPlan?.activities) {
          currentDayPlan.activities.forEach(activity => {
            const hasPose = hasValidPose(activity);
            initialMarkers.push({
              longitude: hasPose && activity.pose ? activity.pose.longitude : (activity.longitude || 0),
              latitude: hasPose && activity.pose ? activity.pose.latitude : (activity.latitude || 0),
              name: activity.position || '活动位置',
              type: getActivityMapType(activity.type),
              hasPose
            });
          });
        }
      }

      // 修复坐标并设置标记
      const fixedMarkers = await fixInvalidCoordinates(initialMarkers);
      setMarkers(fixedMarkers);
    };

    initializeMarkers();
  }, [pois, dailyPlans, activeDay]);

  // 计算地图中心点
  const getMapCenter = () => {
    if (markers.length > 0) {
      // 过滤掉无效的经纬度数据
      const validMarkers = markers.filter(marker => 
        isValidCoordinate(marker.longitude, marker.latitude)
      );
      
      if (validMarkers.length > 0) {
        const avgLng = validMarkers.reduce((sum, marker) => sum + marker.longitude, 0) / validMarkers.length;
        const avgLat = validMarkers.reduce((sum, marker) => sum + marker.latitude, 0) / validMarkers.length;
        
        // 确保计算出的中心点是有效的
        if (isValidCoordinate(avgLng, avgLat)) {
          return { longitude: avgLng, latitude: avgLat };
        }
      }
    }
    return undefined; // 使用默认中心点
  };

  const handleMarkerClick = (marker: any) => {
    console.log('标记被点击:', marker.name);
    
    // 设置悬停状态
    onActivityHover(marker.name);
    
    // 查找包含此标记的活动和对应的天数
    if (dailyPlans) {
      for (const dayPlan of dailyPlans) {
        const matchingActivity = dayPlan.activities?.find(activity => {
          // 尝试通过多种方式匹配活动
          return activity.position === marker.name ||
                 activity.start === marker.name ||
                 activity.end === marker.name ||
                 (activity.notes && activity.notes.includes(marker.name));
        });
        
        if (matchingActivity) {
          console.log(`在第${dayPlan.day}天找到匹配的活动:`, matchingActivity.position);
          
          // 如果不是当前活动的天数，切换到对应的天数
          if (dayPlan.day !== activeDay && setActiveDay) {
            setActiveDay(dayPlan.day);
            console.log(`切换到第${dayPlan.day}天`);
          }
          
          // 优化滚动逻辑，避免影响外层布局
          setTimeout(() => {
            const activityElement = document.querySelector(`[data-activity="${marker.name}"]`);
            if (activityElement) {
              console.log('找到活动元素:', activityElement);
              
              // 优先查找具有 overflow-y-auto 类的滚动容器
              let scrollContainer = activityElement.closest('.overflow-y-auto') as HTMLElement;
              
              if (!scrollContainer) {
                // 如果没找到，尝试查找其他可滚动的容器
                scrollContainer = activityElement.closest('.overflow-auto, .overflow-scroll') as HTMLElement;
              }
              
              if (scrollContainer) {
                console.log('找到滚动容器:', scrollContainer);
                
                // 在指定容器内滚动
                const containerRect = scrollContainer.getBoundingClientRect();
                const elementRect = activityElement.getBoundingClientRect();
                
                // 计算元素相对于容器的位置
                const containerTop = containerRect.top;
                const elementTop = elementRect.top;
                const relativeTop = elementTop - containerTop;
                
                // 计算目标滚动位置（将元素居中显示）
                const containerHeight = containerRect.height;
                const elementHeight = elementRect.height;
                const centerOffset = (containerHeight - elementHeight) / 2;
                const targetScrollTop = scrollContainer.scrollTop + relativeTop - centerOffset;
                
                // 确保滚动位置在有效范围内
                const maxScrollTop = scrollContainer.scrollHeight - containerHeight;
                const finalScrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop));
                
                // 平滑滚动到目标位置
                scrollContainer.scrollTo({
                  top: finalScrollTop,
                  behavior: 'smooth'
                });
                console.log('在容器内滚动到活动元素', { 
                  relativeTop, 
                  centerOffset, 
                  targetScrollTop, 
                  finalScrollTop,
                  containerHeight,
                  elementHeight
                });
              } else {
                console.log('未找到滚动容器，尝试查找父级容器');
                
                // 使用更简单的滚动策略，避免影响页面布局
                activityElement.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'center', // 尝试居中显示
                  inline: 'nearest'
                });
                console.log('使用默认滚动到活动元素');
              }
            } else {
              console.warn(`未找到 data-activity="${marker.name}" 的元素`);
            }
          }, 200); // 增加等待时间，确保天数切换和DOM更新完成
          
          break;
        }
      }
    }
  };

  // 过滤有效的标记点
  const validMarkers = markers.filter(marker => 
    isValidCoordinate(marker.longitude, marker.latitude)
  );

  return (
    <div className="h-full relative">
      {/* 加载指示器 */}
      {isLoadingCoordinates && (
        <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-lg shadow-lg p-2 z-20">
          <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-gray-600">正在获取位置信息...</span>
          </div>
        </div>
      )}
      
      {/* 只有在有有效标记时才渲染地图 */}
      {(validMarkers.length > 0 || getMapCenter()) ? (
        <AmapComponent
          center={getMapCenter()}
          markers={validMarkers}
          zoom={validMarkers.length > 1 ? 12 : 14}
          onMarkerClick={handleMarkerClick}
          height="100%"
          className="rounded-lg overflow-hidden"
        />
      ) : (
        <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0l-6-2" />
            </svg>
            <p className="text-lg font-medium mb-2">正在加载地图数据</p>
            <p className="text-sm">请稍候，我们正在为您获取位置信息</p>
          </div>
        </div>
      )}
      
      {/* 地图信息面板 */}
      {validMarkers.length > 0 && (
        <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg shadow-lg p-3 max-w-xs">
          <h4 className="font-semibold text-sm mb-2">地图标记 ({validMarkers.length}个)</h4>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {validMarkers.map((marker, index) => (
              <div 
                key={`${marker.name}-${index}`}
                className={`text-xs p-2 rounded cursor-pointer transition-colors ${
                  hoveredActivityId === marker.name 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'hover:bg-gray-100'
                }`}
                onMouseEnter={() => onActivityHover(marker.name)}
                onMouseLeave={() => onActivityHover(null)}
                onClick={() => handleMarkerClick(marker)}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getMarkerColor(marker.type) }}></span>
                  <span className="font-medium">{marker.name}</span>
                </div>
                <div className="text-gray-500 mt-1">{getTypeLabel(marker.type)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 高亮显示信息 */}
      {hoveredActivityId && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl p-3">
          <p className="text-sm font-semibold text-blue-600">高亮显示：{hoveredActivityId}</p>
          <p className="text-xs text-gray-500">点击标记查看详情</p>
        </div>
      )}
    </div>
  );
};

// 获取标记颜色
const getMarkerColor = (type?: string) => {
  const colorMap: Record<string, string> = {
    attraction: '#FF5722',  // 景点 - 红色
    dining: '#4CAF50',      // 餐饮 - 绿色
    accommodation: '#2196F3', // 住宿 - 蓝色
    travel: '#9C27B0',      // 交通 - 紫色
    other: '#FF9800'        // 其他 - 橙色
  };
  return colorMap[type || 'other'] || colorMap.other;
};

// 获取类型标签
const getTypeLabel = (type?: string) => {
  const labelMap: Record<string, string> = {
    attraction: '景点',
    dining: '餐饮',
    accommodation: '住宿',
    travel: '交通',
    other: '其他'
  };
  return labelMap[type || 'other'] || labelMap.other;
};

// 将活动类型映射到地图标记类型
const getActivityMapType = (activityType: string): 'attraction' | 'dining' | 'accommodation' | 'travel' | 'other' => {
  switch (activityType) {
    case 'lunch':
    case 'dinner':
    case 'dining':
      return 'dining';
    case 'train':
    case 'travel':
      return 'travel';
    case 'attraction':
      return 'attraction';
    case 'accommodation':
      return 'accommodation';
    default:
      return 'other';
  }
};

interface PlanningPageProps {
  plan: TravelPlan | null;
  isLoading: boolean;
  error: string | null;
  onModifyPlan: (modificationRequest: string) => void;
  isModifying: boolean;
}

export const PlanningPage: React.FC<PlanningPageProps> = ({ plan, isLoading, error, onModifyPlan, isModifying }) => {
  const [hoveredActivityId, setHoveredActivityId] = useState<string | null>(null);
  const [leftWidth, setLeftWidth] = useState(380); // px, 默认左侧宽度
  const [showGlobalModal, setShowGlobalModal] = useState(false);
  const [globalInput, setGlobalInput] = useState('');
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [activeDay, setActiveDay] = useState<number>(1);
  const [hideTransport, setHideTransport] = useState(false);
  const [updatedPlan, setUpdatedPlan] = useState<TravelPlan | null>(null);
  const [isUpdatingCoordinates, setIsUpdatingCoordinates] = useState(false);

  // 自动更新计划坐标
  useEffect(() => {
    const updateCoordinates = async () => {
      if (plan && !isUpdatingCoordinates) {
        setIsUpdatingCoordinates(true);
        try {
          const updated = await updateTravelPlanCoordinates(plan);
          setUpdatedPlan(updated);
        } catch (error) {
          console.error('更新坐标失败:', error);
          setUpdatedPlan(plan); // 使用原始计划
        } finally {
          setIsUpdatingCoordinates(false);
        }
      }
    };

    updateCoordinates();
  }, [plan]);

  // 使用更新后的计划或原计划
  const currentPlan = updatedPlan || plan;

  // 监听窗口resize，保证宽度自适应
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setLeftWidth(window.innerWidth);
      } else if (leftWidth > window.innerWidth - 320) {
        setLeftWidth(window.innerWidth - 320);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [leftWidth]);

  const handleCollapseLeft = () => {
    setIsLeftCollapsed(!isLeftCollapsed);
    setIsRightCollapsed(false);
  };

  const handleCollapseRight = () => {
    setIsRightCollapsed(!isRightCollapsed);
    setIsLeftCollapsed(false);
  };

  const handleGlobalSubmit = () => {
    if (globalInput.trim() && !isModifying) {
      onModifyPlan(globalInput.trim());
      setShowGlobalModal(false);
      setGlobalInput('');
    }
  };
  const displayCurrency = currentPlan?.currency || '元';

  if (isLoading && !currentPlan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100">
        <LoadingSpinner size="lg" text="正在生成您的个性化行程..." />
        <p className="mt-4 text-gray-600">我们的AI正在为您打造完美的旅程。这可能需要一点时间。</p>
        <div className="w-full max-w-3xl mt-8 space-y-4">
            <SkeletonLoader className="h-10 w-1/3" />
            <SkeletonLoader className="h-64 w-full" />
            <SkeletonLoader className="h-8 w-full" />
            <SkeletonLoader className="h-8 w-3/4" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-red-50">
        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h2 className="text-2xl font-semibold text-red-700 mb-2">哎呀！出错了。</h2>
        <p className="text-red-600">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-6">再试一次</Button>
      </div>
    );
  }

  if (!currentPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <p className="text-xl text-gray-500">沒有可用的旅行计划。请先输入您的需求。</p>
      </div>
    );
  }
  
  const totalCost = currentPlan.totalEstimatedCost || currentPlan.dailyPlans.reduce((sum, dp) => sum + (dp.dailyCost || 0), 0);
  // 响应式：小屏直接堆叠，大屏可拖动
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
  return (
    <div className="h-screen flex flex-col bg-gray-100 p-4 md:p-6 lg:p-8 overflow-hidden">
      <header className="mb-6 text-center md:text-left flex-shrink-0">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          {currentPlan.title || `${currentPlan.destination}之旅`}
        </h1>
        <p className="text-lg text-gray-600">
          {currentPlan.durationDays}天，{currentPlan.numberOfPeople}人。
          {currentPlan.budget && ` 预算：${currentPlan.budget} ${displayCurrency}。`}
          {totalCost > 0 && ` 预计总花费：${totalCost.toFixed(2)} ${displayCurrency}`}
        </p>
        {isUpdatingCoordinates && (
          <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
            <LoadingSpinner size="sm" />
            正在获取地点坐标信息...
          </p>
        )}
      </header>
      <div className="flex-1 w-full flex flex-col lg:flex-row relative min-h-0 pb-6">
        {/* 左侧：行程 */}
        {!isLeftCollapsed && (
          <div
            className="bg-white rounded-xl shadow-xl flex flex-col relative min-h-0 mb-4"
            style={isDesktop ? { 
              width: isRightCollapsed ? '100%' : leftWidth, 
              maxWidth: isRightCollapsed ? '100%' : leftWidth, 
              transition: 'width 0.15s'
            } : { 
              width: '100%',
              height: '45%', // 在移动端占稍小的高度
              marginBottom: '1rem'
            }}
          >
            {/* 左侧放大按钮 - 放在右上角圆角上 */}
            {isDesktop && (
              <button
                onClick={() => {
                  if (isRightCollapsed) {
                    // 恢复双栏布局
                    setIsLeftCollapsed(false);
                    setIsRightCollapsed(false);
                  } else {
                    // 放大左侧
                    handleCollapseRight();
                  }
                }}
                className={`absolute top-[-10px] h-8 bg-white text-gray-600 rounded-lg shadow-md hover:bg-blue-600 hover:text-white hover:shadow-lg transition-all flex items-center justify-center z-10 ${
                  isRightCollapsed ? 'left-1/2 transform -translate-x-1/2 w-[100px]' : 'w-8 right-[-5px]'
                }`}
                title={isRightCollapsed ? "恢复双栏布局" : "放大左侧"}
                disabled={false}
              >
                {isRightCollapsed ? (
                  <svg className="w-6 h-6 scale-125" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.29 8.71L9.7 11.3a.996.996 0 0 0 0 1.41l2.59 2.59c.63.63 1.71.18 1.71-.71V9.41c0-.89-1.08-1.33-1.71-.7z"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6 scale-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g fill="none"><path d="M12.25 8.5a3.75 3.75 0 0 0-3.75 3.75V24h10.25c2.9 0 5.25 2.35 5.25 5.25V39.5h11.75a3.75 3.75 0 0 0 3.75-3.75v-7.885a1.25 1.25 0 1 1 2.5 0v7.885A6.25 6.25 0 0 1 35.75 42h-23.5A6.25 6.25 0 0 1 6 35.75v-23.5A6.25 6.25 0 0 1 12.25 6h7.885a1.25 1.25 0 1 1 0 2.5H12.25zM27 7.25c0-.69.56-1.25 1.25-1.25h12.5c.69 0 1.25.56 1.25 1.25v12.5a1.25 1.25 0 1 1-2.5 0v-9.482L29.134 20.634a1.25 1.25 0 0 1-1.768-1.768L37.732 8.5H28.25c-.69 0-1.25-.56-1.25-1.25z" fill="currentColor"></path></g></svg>
                )}
              </button>
            )}
            
            {/* 行程列表 */}
            <ItineraryView
              dailyPlans={currentPlan.dailyPlans}
              currency={currentPlan.currency}
              onShowGlobalModal={() => setShowGlobalModal(true)}
              activeDay={activeDay}
              setActiveDay={setActiveDay}
              hideTransport={hideTransport}
              setHideTransport={setHideTransport}
            />
          </div>
        )}
        {/* 分割条，仅桌面端显示 */}
        {isDesktop && !isLeftCollapsed && !isRightCollapsed && (
          <Splitter
            onDrag={(dx) => {
              setLeftWidth((w) => {
                const min = 360;
                const max = window.innerWidth - 360;
                return Math.max(min, Math.min(w + dx, max));
              });
            }}
            isLeftCollapsed={isLeftCollapsed}
            isRightCollapsed={isRightCollapsed}
          />
        )}
        {/* 右侧：地图 */}
        {!isRightCollapsed && (
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <div className="flex-1 bg-white rounded-xl shadow-xl relative min-h-0 mb-4">
              {/* 右侧放大按钮 - 放在左上角圆角上 */}
              {isDesktop && (
                <button
                  onClick={() => {
                    if (isLeftCollapsed) {
                      // 恢复双栏布局
                      setIsLeftCollapsed(false);
                      setIsRightCollapsed(false);
                    } else {
                      // 放大右侧
                      handleCollapseLeft();
                    }
                  }}
                  className={`absolute top-[-10px] h-8 bg-white text-gray-600 rounded-lg shadow-md hover:bg-blue-600 hover:shadow-lg hover:text-white transition-all flex items-center justify-center z-10 ${
                    isLeftCollapsed ? 'left-1/2 transform -translate-x-1/2 w-[100px]' : 'w-8 left-[-5px]'
                  }`}
                  title={isLeftCollapsed ? "恢复双栏布局" : "放大右侧"}
                  disabled={false}
                >
                  {isLeftCollapsed ? (
                    <svg className="w-6 h-6 scale-125" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.71 15.29l2.59-2.59a.996.996 0 0 0 0-1.41L11.71 8.7c-.63-.62-1.71-.18-1.71.71v5.17c0 .9 1.08 1.34 1.71.71z"/>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 scale-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><g fill="none"><path d="M14 4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v9a1 1 0 1 0 2 0V6.414l7.293 7.293a1 1 0 0 0 1.414-1.414L6.414 5H13a1 1 0 0 0 1-1zm10.5 1A2.5 2.5 0 0 1 27 7.5V16h-7.23A3.77 3.77 0 0 0 16 19.77V27H7.5A2.5 2.5 0 0 1 5 24.5V19a1 1 0 1 0-2 0v5.5A4.5 4.5 0 0 0 7.5 29h17a4.5 4.5 0 0 0 4.5-4.5v-17A4.5 4.5 0 0 0 24.5 3H19a1 1 0 1 0 0 2h5.5z" fill="currentColor"></path></g></svg>
                  )}
                </button>
              )}
              
              <MapView
                pois={currentPlan.pois}
                hoveredActivityId={hoveredActivityId}
                onActivityHover={setHoveredActivityId}
                dailyPlans={currentPlan.dailyPlans}
                activeDay={activeDay}
                setActiveDay={setActiveDay}
              />
            </div>
          </div>
        )}
        
        {/* 全局修改弹窗 */}
        <Modal open={showGlobalModal} onClose={() => setShowGlobalModal(false)} title="全局修改需求">
          <div className="flex flex-col gap-4">
            <Input
              type="text"
              value={globalInput}
              onChange={e => setGlobalInput(e.target.value)}
              placeholder="请输入您的全局修改需求，如“整体预算减少”"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowGlobalModal(false)}>取消</Button>
              <Button onClick={handleGlobalSubmit} disabled={isModifying || !globalInput.trim()}>
                {isModifying ? <LoadingSpinner size="sm" /> : '确定'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};
