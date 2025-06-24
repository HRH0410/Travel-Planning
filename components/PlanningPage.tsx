
import React, { useState, useEffect, useCallback } from 'react';
import { TravelPlan, Activity, DailyPlan, POIDetail } from '../types';
import { Button } from './ui/Button';
import { Input, TextArea } from './ui/Input';
import { Card } from './ui/Card';
import { LoadingSpinner, SkeletonLoader } from './ui/LoadingSpinner';
import { APP_NAME } from '../constants';

interface ItineraryViewProps {
  dailyPlans: DailyPlan[];
  hoveredActivityId: string | null;
  onActivityHover: (activityId: string | null) => void;
  currency?: string;
}

const getActivityEmoji = (activity: Activity): string => {
  switch (activity.type) {
    case 'travel':
      switch (activity.transportTo?.mode?.toLowerCase()) {
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

const formatActivityTime = (startTime?: string, endTime?: string): string => {
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

const ItineraryView: React.FC<ItineraryViewProps> = ({ dailyPlans, hoveredActivityId, onActivityHover, currency }) => {
  const [activeDay, setActiveDay] = useState<number>(1);
  const displayCurrency = currency || '元'; // Default to 元 if not specified

  useEffect(() => {
    // Ensure activeDay is valid if dailyPlans change
    if (dailyPlans && dailyPlans.length > 0 && !dailyPlans.find(dp => dp.day === activeDay)) {
      setActiveDay(dailyPlans[0].day);
    }
  }, [dailyPlans, activeDay]);


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
      <div className="p-4 border-b border-gray-200">
        <div className="flex space-x-2 mb-4">
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
        </div>
        {currentDayPlan && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              第 {activeDay} 天
            </h2>
            {currentDayPlan.summary && <p className="text-sm text-gray-600 mb-2">{currentDayPlan.summary}</p>}
            {currentDayPlan.dailyCost && currentDayPlan.dailyCost > 0 && (
              <p className="text-sm font-semibold text-gray-700">
                本日预计花费：{currentDayPlan.dailyCost} {displayCurrency}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex-grow overflow-y-auto p-4 bg-gray-50 rounded-b-lg">
        {currentDayPlan?.activities && currentDayPlan.activities.length > 0 ? (
          <ul role="list" className="-mb-8"> {/* Negative margin to counteract last item's pb-8 */}
            {currentDayPlan.activities.map((activity, index) => (
              <li key={activity.id || index}>
                <div className="relative pb-8"> {/* Spacing for the next item */}
                  {index !== (currentDayPlan.activities.length - 1) && (
                    <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-300" aria-hidden="true" />
                  )}
                  <div className="relative flex items-start space-x-3 sm:space-x-4">
                    <div>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 ring-8 ring-white">
                        <span className="text-xl text-blue-600">{getActivityEmoji(activity)}</span>
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1"> {/* Adjusted pt for alignment */}
                      <div className="text-xs sm:text-sm font-medium text-gray-500 mb-0.5">
                        {formatActivityTime(activity.startTime, activity.endTime)}
                      </div>
                      <Card
                        className={`p-3 transition-all duration-200 ${
                          hoveredActivityId === activity.id ? 'ring-2 ring-blue-500 shadow-xl bg-blue-50' : 'bg-white shadow-md'
                        }`}
                        onMouseEnter={() => onActivityHover(activity.id)}
                        onMouseLeave={() => onActivityHover(null)}
                      >
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1">{activity.position}</h3>
                        
                        {activity.pictureUrl && (
                          <img src={activity.pictureUrl} alt={activity.position} className="my-2 rounded-lg object-cover h-32 sm:h-40 w-full"/>
                        )}
                        
                        {activity.notes && <p className="text-xs sm:text-sm text-gray-600 mt-1 mb-1">{activity.notes}</p>}
                        
                        {activity.cost && activity.cost > 0 && <p className="text-xs sm:text-sm font-medium text-green-600 mt-1">花费：{activity.cost} {displayCurrency}</p>}
                        
                        {activity.transportTo && (
                          <div className="mt-2 text-xs text-gray-500 border-t pt-2">
                            <p className="font-medium text-gray-700">交通 ({activity.transportTo.mode})</p>
                            <p>{activity.transportTo.from} → {activity.transportTo.to}</p>
                            {activity.transportTo.duration && <p>时长：{activity.transportTo.duration}</p>}
                            {activity.transportTo.details && <p>详情：{activity.transportTo.details}</p>}
                          </div>
                        )}
                        
                        {activity.foodInfo && (
                          <div className="mt-2 text-xs text-gray-500 border-t pt-2">
                             <p className="font-medium text-gray-700">餐饮 ({activity.foodInfo.type || '餐厅'})</p>
                             <p>{activity.foodInfo.name}</p>
                             {activity.foodInfo.estimatedCost && <p>预计花费：{activity.foodInfo.estimatedCost} {displayCurrency}</p>}
                             {activity.foodInfo.notes && <p>备注：{activity.foodInfo.notes}</p>}
                          </div>
                        )}
                      </Card>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center py-4">此日无活动安排。</p>
        )}
      </div>
    </div>
  );
};


interface MapViewProps {
  pois?: POIDetail[];
  hoveredActivityId: string | null;
  onActivityHover: (activityId: string | null) => void;
  centerCoordinates?: { lat: number; lng: number };
  destinationName?: string;
}

const MapView: React.FC<MapViewProps> = ({ pois, hoveredActivityId, onActivityHover, centerCoordinates, destinationName }) => {
  const mapPlaceholderUrl = `https://picsum.photos/seed/${destinationName || 'map'}/800/600`;

  return (
    <div className="h-full bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
      <img src={mapPlaceholderUrl} alt="地图占位符" className="object-cover w-full h-full opacity-80" />
      <div className="absolute inset-0 bg-black bg-opacity-10"></div>
      
      {pois && pois.length > 0 && (
        <div className="absolute top-2 left-2 p-2 bg-white bg-opacity-80 rounded-lg shadow max-h-48 overflow-y-auto text-xs">
          <h4 className="font-semibold mb-1">兴趣点：</h4>
          {pois.map(poi => (
            <div 
              key={poi.name} 
              className={`p-1 rounded ${hoveredActivityId === poi.name ? 'bg-blue-200' : ''}`}
              onMouseEnter={() => onActivityHover(poi.name)}
              onMouseLeave={() => onActivityHover(null)}
            >
              {poi.name}
            </div>
          ))}
        </div>
      )}

      {hoveredActivityId && (
         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 p-3 bg-white rounded-lg shadow-xl text-center">
           <p className="text-sm font-semibold text-blue-600">高亮显示：{hoveredActivityId}</p>
           <p className="text-xs text-gray-500">（地图标记可交互）</p>
         </div>
      )}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-white bg-opacity-50 rounded-lg shadow-xl">
        <p className="text-gray-700 font-semibold text-center">交互式地图区域</p>
        <p className="text-xs text-gray-500 text-center">（等待实际地图集成）</p>
      </div>
    </div>
  );
};


interface PlanningPageProps {
  plan: TravelPlan | null;
  isLoading: boolean;
  error: string | null;
  onModifyPlan: (modificationRequest: string) => void;
  isModifying: boolean;
}

export const PlanningPage: React.FC<PlanningPageProps> = ({ plan, isLoading, error, onModifyPlan, isModifying }) => {
  const [modificationInput, setModificationInput] = useState('');
  const [hoveredActivityId, setHoveredActivityId] = useState<string | null>(null);

  const handleModificationSubmit = () => {
    if (modificationInput.trim() && !isModifying) {
      onModifyPlan(modificationInput.trim());
      setModificationInput('');
    }
  };
  
  const getCenterCoordinates = useCallback(() => {
    if (plan?.pois && plan.pois.length > 0) {
      const avgLat = plan.pois.reduce((sum, p) => sum + p.latitude, 0) / plan.pois.length;
      const avgLng = plan.pois.reduce((sum, p) => sum + p.longitude, 0) / plan.pois.length;
      return { lat: avgLat, lng: avgLng };
    }
    return undefined;
  }, [plan]);

  const displayCurrency = plan?.currency || '元';

  if (isLoading && !plan) {
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

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <p className="text-xl text-gray-500">沒有可用的旅行计划。请先输入您的需求。</p>
      </div>
    );
  }
  
  const totalCost = plan.totalEstimatedCost || plan.dailyPlans.reduce((sum, dp) => sum + (dp.dailyCost || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 p-4 md:p-6 lg:p-8">
      <header className="mb-6 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          {plan.title || `${plan.destination}之旅`}
        </h1>
        <p className="text-lg text-gray-600">
          {plan.durationDays}天，{plan.numberOfPeople}人。
          {plan.budget && ` 预算：${plan.budget} ${displayCurrency}。`}
          {totalCost > 0 && ` 预计总花费：${totalCost.toFixed(2)} ${displayCurrency}`}
        </p>
      </header>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-xl flex flex-col h-[75vh] lg:h-auto max-h-[calc(100vh-12rem)]"> {/* Adjusted height and max-height */}
          <ItineraryView 
            dailyPlans={plan.dailyPlans} 
            hoveredActivityId={hoveredActivityId} 
            onActivityHover={setHoveredActivityId}
            currency={plan.currency}
          />
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex-grow bg-white rounded-xl shadow-xl h-96 lg:h-[calc(75vh-10rem)] max-h-[calc(100vh-22rem)]"> {/* Adjusted height and max-height */}
             <MapView 
                pois={plan.pois} 
                hoveredActivityId={hoveredActivityId} 
                onActivityHover={setHoveredActivityId}
                centerCoordinates={getCenterCoordinates()}
                destinationName={plan.destination}
             />
          </div>
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">修改您的计划</h3>
            <div className="flex space-x-2">
              <Input
                type="text"
                value={modificationInput}
                onChange={(e) => setModificationInput(e.target.value)}
                placeholder="例如：“在第二天增加一个博物馆”或“找一个更便宜的酒店”"
                className="flex-grow"
                disabled={isModifying}
              />
              <Button onClick={handleModificationSubmit} disabled={isModifying || !modificationInput.trim()}>
                {isModifying ? <LoadingSpinner size="sm" /> : '更新'}
              </Button>
            </div>
             {isModifying && <p className="text-xs text-blue-500 mt-2">AI正在处理您的请求...</p>}
          </Card>
        </div>
      </div>
      
      <footer className="mt-8 text-center text-sm text-gray-500">
        此计划由{APP_NAME}智能生成。
      </footer>
    </div>
  );
};
