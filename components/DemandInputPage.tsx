import React, { useState, useCallback, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input, TextArea } from './ui/Input';
import { Slider } from './ui/Slider';
import { SelectionCard, SelectionGrid, TagCloud } from './ui/Selection';
import { Tag } from './ui/Tag';
import { Modal } from './ui/Modal';
import { UserDemand } from '../types';
import { APP_NAME } from '../constants';

// 类型定义
interface RecognizedTag {
  id: string;
  category: string;
  value: string;
}

// 简单的UUID生成函数
const generateId = () => Math.random().toString(36).substr(2, 9);

interface DemandInputPageProps {
  onSubmitDemand: (demand: UserDemand) => void;
  isLoading: boolean;
}

const initialDemand: UserDemand = {
  startCity: '',
  destination: '',
  duration: '',
  people: '',
  budget: '',
  rawInput: '',
};

// SVG 图标组件
const TravelClockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TravelUsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
);

const TravelCreditCardIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const TravelMapPinIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const TravelHeartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const TravelCameraIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const TravelMountainIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12l5 5L20 7" />
  </svg>
);

const TravelBeachIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const TravelCityIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const TravelFoodIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

// 旅行类型数据
const travelTypesData = [
  { id: 'relaxing', title: '休闲度假', description: '放松身心，享受悠闲时光', icon: <TravelBeachIcon />, color: 'blue' as const },
  { id: 'adventure', title: '探险户外', description: '挑战自我，探索未知领域', icon: <TravelMountainIcon />, color: 'green' as const },
  { id: 'cultural', title: '文化深度', description: '感受历史，体验当地文化', icon: <TravelCityIcon />, color: 'purple' as const },
  { id: 'romantic', title: '浪漫蜜月', description: '二人世界，留下美好回忆', icon: <TravelHeartIcon />, color: 'pink' as const },
  { id: 'photography', title: '摄影采风', description: '捕捉美景，记录精彩瞬间', icon: <TravelCameraIcon />, color: 'orange' as const },
  { id: 'food', title: '美食之旅', description: '品尝美味，探索当地料理', icon: <TravelFoodIcon />, color: 'indigo' as const },
];

// 兴趣标签数据
const interestTagsData = [
  { label: '古迹名胜', value: 'historic', color: 'purple' as const },
  { label: '自然风光', value: 'nature', color: 'green' as const },
  { label: '海滩阳光', value: 'beach', color: 'blue' as const },
  { label: '雪山温泉', value: 'mountain', color: 'indigo' as const },
  { label: '都市繁华', value: 'city', color: 'orange' as const },
  { label: '民俗体验', value: 'culture', color: 'pink' as const },
  { label: '极限运动', value: 'extreme', color: 'orange' as const },
  { label: '亲子乐园', value: 'family', color: 'green' as const },
  { label: '奢华享受', value: 'luxury', color: 'purple' as const },
  { label: '经济实惠', value: 'budget', color: 'blue' as const },
];

export const NewDemandInputPage: React.FC<DemandInputPageProps> = ({ 
  onSubmitDemand, 
  isLoading 
}) => {
  const [demand, setDemand] = useState<UserDemand>(initialDemand);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // 滑动条状态
  const [duration, setDuration] = useState(7);
  const [people, setPeople] = useState(2);
  const [budgetRange, setBudgetRange] = useState({ min: 3000, max: 8000 });
  
  // 选择状态
  const [selectedTravelType, setSelectedTravelType] = useState<string>('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  
  // 表单验证状态
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // 自定义预算模态框状态
  const [showCustomBudgetModal, setShowCustomBudgetModal] = useState(false);
  const [customMinBudget, setCustomMinBudget] = useState('');
  const [customMaxBudget, setCustomMaxBudget] = useState('');

  const formatBudget = (value: number) => {
    if (value >= 10000) {
      return `${(value / 10000).toFixed(1)}万元`;
    }
    return `${value}元`;
  };

  const validateStep = (step: number): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    switch (step) {
      case 1:
        if (!demand.startCity.trim()) newErrors.startCity = '请填写出发城市';
        if (!demand.destination.trim()) newErrors.destination = '请填写目的地';
        break;
      case 2:
        if (duration < 1) newErrors.duration = '行程天数至少1天';
        if (people < 1) newErrors.people = '人数至少1人';
        break;
      case 3:
        if (budgetRange.min >= budgetRange.max) newErrors.budget = '预算范围设置有误';
        break;
      case 4:
        if (!selectedTravelType) newErrors.travelType = '请选择旅行类型';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = useCallback(() => {
    const finalDemand: UserDemand = {
      ...demand,
      duration: duration.toString(),
      people: people.toString(),
      budget: `${budgetRange.min}-${budgetRange.max}`,
      rawInput: `旅行类型：${selectedTravelType}，兴趣：${selectedInterests.join(', ')}`
    };
    
    onSubmitDemand(finalDemand);
  }, [demand, duration, people, budgetRange, selectedTravelType, selectedInterests, onSubmitDemand]);

  const handleTravelTypeSelect = (typeId: string) => {
    setSelectedTravelType(typeId);
  };

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleInputChange = (field: keyof UserDemand, value: string) => {
    setDemand(prev => ({ ...prev, [field]: value }));
  };

  // 处理自定义预算
  const handleCustomBudgetSubmit = () => {
    const min = parseInt(customMinBudget);
    const max = parseInt(customMaxBudget);
    
    if (isNaN(min) || isNaN(max)) {
      alert('请输入有效的数字');
      return;
    }
    
    if (min >= max) {
      alert('最低预算必须小于最高预算');
      return;
    }
    
    if (min < 0) {
      alert('预算不能为负数');
      return;
    }
    
    setBudgetRange({ min, max });
    setShowCustomBudgetModal(false);
    setCustomMinBudget('');
    setCustomMaxBudget('');
  };

  const openCustomBudgetModal = () => {
    setCustomMinBudget(budgetRange.min.toString());
    setCustomMaxBudget(budgetRange.max.toString());
    setShowCustomBudgetModal(true);
  };

  // 步骤进度指示器
  const StepIndicator = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-4">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <React.Fragment key={step}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                step <= currentStep
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step < currentStep ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                step
              )}
            </div>
            {step < totalSteps && (
              <div
                className={`w-12 h-1 rounded-full transition-all duration-300 ${
                  step < currentStep ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                规划您的旅程
              </h2>
              <p className="text-gray-600">让我们先了解您的基本行程安排</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="出发城市"
                value={demand.startCity}
                onChange={(e) => handleInputChange('startCity', e.target.value)}
                placeholder="请输入出发城市"
                icon={<TravelMapPinIcon />}
                floatingLabel
                error={errors.startCity}
              />
              <Input
                label="目的地"
                value={demand.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                placeholder="请输入目的地"
                icon={<TravelMapPinIcon />}
                floatingLabel
                error={errors.destination}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                行程详情
              </h2>
              <p className="text-gray-600">设置您的旅行天数和人数</p>
            </div>
            
            <div className="space-y-8">
              <Slider
                label="旅行天数"
                min={1}
                max={30}
                value={duration}
                onChange={setDuration}
                step={1}
                unit="天"
                icon={<TravelClockIcon />}
                color="green"
              />
              
              <Slider
                label="出行人数"
                min={1}
                max={20}
                value={people}
                onChange={setPeople}
                step={1}
                unit="人"
                icon={<TravelUsersIcon />}
                color="blue"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                预算设置
              </h2>
              <p className="text-gray-600">选择最适合您的预算范围</p>
            </div>
            
            {/* 预算选择卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 经济型 */}
              <div 
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                  budgetRange.min === 1000 && budgetRange.max === 3000
                    ? 'border-green-400 bg-gradient-to-br from-green-50 to-green-100 shadow-lg shadow-green-200/50'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
                onClick={() => setBudgetRange({ min: 1000, max: 3000 })}
              >
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg text-green-700 mb-1">经济型</h3>
                  <p className="text-2xl font-bold text-green-600 mb-2">1000-3000元</p>
                  <p className="text-sm text-gray-600">精打细算，性价比之选</p>
                </div>
              </div>

              {/* 舒适型 */}
              <div 
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                  budgetRange.min === 3000 && budgetRange.max === 8000
                    ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg shadow-blue-200/50'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
                onClick={() => setBudgetRange({ min: 3000, max: 8000 })}
              >
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg text-blue-700 mb-1">舒适型</h3>
                  <p className="text-2xl font-bold text-blue-600 mb-2">3000-8000元</p>
                  <p className="text-sm text-gray-600">品质与价格的完美平衡</p>
                </div>
              </div>

              {/* 豪华型 */}
              <div 
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                  budgetRange.min === 8000 && budgetRange.max === 20000
                    ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg shadow-purple-200/50'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
                onClick={() => setBudgetRange({ min: 8000, max: 20000 })}
              >
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg text-purple-700 mb-1">豪华型</h3>
                  <p className="text-2xl font-bold text-purple-600 mb-2">8000-20000元</p>
                  <p className="text-sm text-gray-600">尊享体验，品味之旅</p>
                </div>
              </div>

              {/* 自定义 */}
              <div 
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                  ![
                    { min: 1000, max: 3000 },
                    { min: 3000, max: 8000 },
                    { min: 8000, max: 20000 }
                  ].some(preset => preset.min === budgetRange.min && preset.max === budgetRange.max)
                    ? 'border-orange-400 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg shadow-orange-200/50'
                    : 'border-gray-200 bg-white hover:border-orange-300'
                }`}
                onClick={openCustomBudgetModal}
              >
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg text-orange-700 mb-1">自定义</h3>
                  <p className="text-2xl font-bold text-orange-600 mb-2">
                    {![
                      { min: 1000, max: 3000 },
                      { min: 3000, max: 8000 },
                      { min: 8000, max: 20000 }
                    ].some(preset => preset.min === budgetRange.min && preset.max === budgetRange.max)
                      ? `${formatBudget(budgetRange.min)}-${formatBudget(budgetRange.max)}`
                      : '？？？-？？？'
                    }
                  </p>
                  <p className="text-sm text-gray-600">点击设置专属预算</p>
                </div>
              </div>
            </div>

            {/* 当前选择显示 */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <TravelCreditCardIcon />
                  <div>
                    <h4 className="font-semibold text-gray-800">当前预算范围</h4>
                    <p className="text-sm text-gray-600">为您推荐最合适的方案</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {formatBudget(budgetRange.min)} - {formatBudget(budgetRange.max)}
                  </p>
                  <p className="text-sm text-gray-500">人均预算</p>
                </div>
              </div>
            </div>

            {/* 预算建议提示 */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-1">💡 预算小贴士</h4>
                  <p className="text-sm text-blue-700">
                    预算包含交通、住宿、餐饮、门票等费用。我们会根据您的预算为您推荐最优性价比的方案。
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                个性化定制
              </h2>
              <p className="text-gray-600">选择您的旅行风格和兴趣偏好</p>
            </div>
            
            <SelectionGrid
              title="旅行类型"
              subtitle="选择最符合您期望的旅行方式"
              columns={3}
            >
              {travelTypesData.map((type) => (
                <SelectionCard
                  key={type.id}
                  title={type.title}
                  description={type.description}
                  icon={type.icon}
                  isSelected={selectedTravelType === type.id}
                  onClick={() => handleTravelTypeSelect(type.id)}
                  color={type.color}
                />
              ))}
            </SelectionGrid>
            
            <TagCloud
              title="兴趣偏好"
              tags={interestTagsData}
              selectedTags={selectedInterests}
              onTagToggle={handleInterestToggle}
              maxSelections={5}
            />
            
            <div className="mt-6">
              <TextArea
                label="特殊需求"
                value={demand.rawInput}
                onChange={(e) => handleInputChange('rawInput', e.target.value)}
                placeholder="请描述您的特殊需求或期望（可选）"
                floatingLabel
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse animation-delay-1000"></div>
        <div className="absolute bottom-20 left-32 w-24 h-24 bg-pink-200 rounded-full opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-32 right-10 w-12 h-12 bg-orange-200 rounded-full opacity-20 animate-pulse animation-delay-3000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* 标题区域 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {APP_NAME} ✈️
          </h1>
          <p className="text-xl text-gray-600">
            定制您的专属旅行计划
          </p>
        </div>

        {/* 步骤指示器 */}
        <StepIndicator />

        {/* 主要内容区域 */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
            {renderStep()}
            
            {/* 导航按钮 */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="px-6 py-3"
              >
                上一步
              </Button>
              
              <div className="text-sm text-gray-500">
                第 {currentStep} 步，共 {totalSteps} 步
              </div>
              
              <Button
                onClick={handleNext}
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {isLoading ? '生成中...' : currentStep === totalSteps ? '开始规划' : '下一步'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 自定义预算模态框 */}
      <Modal
        open={showCustomBudgetModal}
        onClose={() => setShowCustomBudgetModal(false)}
        title="设置自定义预算"
      >
        <div className="space-y-6">
          <div className="text-sm text-gray-600 mb-4">
            请设置您的预算范围，我们会根据您的预算推荐最合适的旅行方案。
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最低预算（元）
              </label>
              <Input
                value={customMinBudget}
                onChange={(e) => setCustomMinBudget(e.target.value)}
                placeholder="例如：2000"
                type="number"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最高预算（元）
              </label>
              <Input
                value={customMaxBudget}
                onChange={(e) => setCustomMaxBudget(e.target.value)}
                placeholder="例如：8000"
                type="number"
                min="0"
              />
            </div>
          </div>
          
          {customMinBudget && customMaxBudget && (
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-2">
                <TravelCreditCardIcon />
                <div>
                  <p className="font-medium text-orange-800">预算预览</p>
                  <p className="text-orange-600">
                    {formatBudget(parseInt(customMinBudget) || 0)} - {formatBudget(parseInt(customMaxBudget) || 0)}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowCustomBudgetModal(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleCustomBudgetSubmit}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              确认设置
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// --- Aurora Blob Component ---
interface AuroraBlobProps {
  className: string;
  animationClass: string;
  opacity?: number;
}

const AuroraBlob: React.FC<AuroraBlobProps> = ({ className, animationClass, opacity = 0.1 }) => (
  <div 
    className={`absolute -z-20 rounded-full mix-blend-multiply filter blur-4xl ${className} ${animationClass}`}
    style={{ opacity }}
  ></div>
);

// --- 精简版浮动图标 ---
const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const CreditCardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);

const MapPinIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const HeartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

// --- Footer Badge Icons ---
const AiChipIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path d="M10.75 1C10.75 0.585786 10.4142 0.25 10 0.25C9.58579 0.25 9.25 0.585786 9.25 1V2.5C9.25 2.91421 9.58579 3.25 10 3.25C10.4142 3.25 10.75 2.91421 10.75 2.5V1ZM5.00962 3.50962C5.28579 3.23345 5.28579 2.76655 5.00962 2.49038C4.73345 2.21421 4.26655 2.21421 3.99038 2.49038L2.49038 3.99038C2.21421 4.26655 2.21421 4.73345 2.49038 5.00962C2.76655 5.28579 3.23345 5.28579 3.50962 5.00962L5.00962 3.50962ZM16.0096 3.50962L17.5096 2.49038C17.7858 2.21421 18.2665 2.21421 18.5096 2.49038C18.7858 2.76655 18.7858 3.23345 18.5096 3.50962L17.0096 5.00962C16.7335 5.28579 16.2335 5.28579 15.9904 5.00962C15.7142 4.73345 15.7142 4.26655 15.9904 3.99038L16.0096 3.50962ZM1 9.25H2.5C2.91421 9.25 3.25 9.58579 3.25 10C3.25 10.4142 2.91421 10.75 2.5 10.75H1C0.585786 10.75 0.25 10.4142 0.25 10C0.25 9.58579 0.585786 9.25 1 9.25ZM17.5 9.25H19C19.4142 9.25 19.75 9.58579 19.75 10C19.75 10.4142 19.4142 10.75 19 10.75H17.5C17.0858 10.75 16.75 10.4142 16.75 10C16.75 9.58579 17.0858 9.25 17.5 9.25ZM9.25 17.5V19C9.25 19.4142 9.58579 19.75 10 19.75C10.4142 19.75 10.75 19.4142 10.75 19V17.5C10.75 17.0858 10.4142 16.75 10 16.75C9.58579 16.75 9.25 17.0858 9.25 17.5ZM5.00962 17.0096L3.50962 18.5096C3.23345 18.7858 2.76655 18.7858 2.49038 18.5096C2.21421 18.2335 2.21421 17.7665 2.49038 17.5096L3.99038 16.0096C4.26655 15.7335 4.73345 15.7335 5.00962 16.0096C5.28579 16.2858 5.28579 16.7335 5.00962 17.0096ZM16.0096 17.0096C15.7335 16.7335 15.7335 16.2665 15.9904 16.0096L17.0096 15.0096C17.2858 14.7335 17.7665 14.7335 18.0096 15.0096C18.2858 15.2858 18.2858 15.7665 18.0096 16.0096L17.0096 17.0096C16.7335 17.2858 16.2665 17.2858 16.0096 17.0096Z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M14.25 6C14.25 5.58579 13.9142 5.25 13.5 5.25H6.5C6.08579 5.25 5.75 5.58579 5.75 6V14C5.75 14.4142 6.08579 14.75 6.5 14.75H13.5C13.9142 14.75 14.25 14.4142 14.25 14V6ZM7.25 6.75V13.25H12.75V6.75H7.25Z" />
  </svg>
);

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.39-1.165 3.437 3.691 1.015L6.07 18.57l4.405-1.83.39 4.753 3.437-1.165-1.015-3.691L18.569 13.2l-1.83-4.401-.39-4.753zm-1.218 7.062a.75.75 0 011.06 0l1.25 1.25a.75.75 0 010 1.06l-1.25 1.25a.75.75 0 01-1.06 0l-1.25-1.25a.75.75 0 010-1.06l1.25-1.25zM5.543 7.043a.75.75 0 011.06 0l1.25 1.25a.75.75 0 010 1.06l-1.25 1.25a.75.75 0 01-1.06 0L4.293 9.353a.75.75 0 010-1.06l1.25-1.25zm9.634.25a.75.75 0 000-1.06l-1.25-1.25a.75.75 0 00-1.06 0l-1.25 1.25a.75.75 0 000 1.06l1.25 1.25a.75.75 0 001.06 0l1.25-1.25z" clipRule="evenodd" />
  </svg>
);

const ShieldLockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6zm-1.5 3.5a1 1 0 11-2 0 1 1 0 012 0zM10 12a1.5 1.5 0 011.5 1.5v1a1.5 1.5 0 11-3 0v-1A1.5 1.5 0 0110 12z" clipRule="evenodd" />
  </svg>
);

interface FloatingElementProps {
  IconComponent: React.FC<{ className?: string }>;
  style: React.CSSProperties;
  animationClass: string;
  colorClass: string;
  opacity: number;
}

const FloatingElement: React.FC<FloatingElementProps> = ({ IconComponent, style, animationClass, colorClass, opacity }) => (
  <div className={`absolute -z-10 pointer-events-none ${animationClass}`} style={{...style, opacity}}>
    <IconComponent className={`w-full h-full ${colorClass}`} />
  </div>
);

export const DemandInputPage: React.FC<DemandInputPageProps> = ({ onSubmitDemand, isLoading }) => {
  const [demand, setDemand] = useState<UserDemand>(initialDemand);
  const [recognizedTags, setRecognizedTags] = useState<RecognizedTag[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDemand(prev => ({ ...prev, [name]: value }));
  };
  
  const parseRawInput = useCallback((text: string) => {
    const newTags: RecognizedTag[] = [];
    if (text.toLowerCase().includes("paris") || text.includes("巴黎")) newTags.push({ id: generateId(), category: "目的地", value: text.includes("巴黎") ? "巴黎" : "Paris" });
    const durationMatch = text.match(/(\d+)\s*(days?|天)/i);
    if (durationMatch) {
        newTags.push({ id: generateId(), category: "时长", value: `${durationMatch[1]} ${durationMatch[2].includes('天') ? '天' : 'days'}` });
    }
    const budgetMatch = text.match(/(?:budget|预算)\s*(?:is|为|大约)?\s*(\d+)\s*(\w+)?/i);
    if (budgetMatch) {
        newTags.push({ id: generateId(), category: "预算", value: `${budgetMatch[1]}${budgetMatch[2] ? ' ' + budgetMatch[2] : ''}` });
    }
    setRecognizedTags(newTags);
  }, []);

  const handleRawInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setDemand(prev => ({ ...prev, rawInput: value }));
    parseRawInput(value);
  };

  const handleTagRemove = (tagId: string) => {
    setRecognizedTags(prevTags => prevTags.filter(tag => tag.id !== tagId));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    
    const finalDemand = { ...demand };
    if (!finalDemand.rawInput.trim() && (finalDemand.startCity || finalDemand.destination || finalDemand.duration || finalDemand.people)) {
      finalDemand.rawInput = `计划从${finalDemand.startCity || '（未指定出发地）'}出发，前往${finalDemand.destination || '（未指定目的地）'}。旅行时长${finalDemand.duration || '（未指定）'}，${finalDemand.people || '（未指定人数）'}人。预算为${finalDemand.budget || '未指定'}。`;
    }
    onSubmitDemand(finalDemand);
  };

 const auroraBlobsData = [
    { className: 'w-[30rem] h-[30rem] sm:w-[40rem] sm:h-[40rem] top-[-20%] left-[-25%]', animationClass: 'animate-aurora-blob-1', opacity: 0.08, colorClasses: 'bg-gradient-to-br from-sky-100 to-blue-200' },
    { className: 'w-[28rem] h-[28rem] sm:w-[35rem] sm:h-[35rem] top-[-5%] right-[-20%]', animationClass: 'animate-aurora-blob-2', opacity: 0.06, colorClasses: 'bg-gradient-to-br from-purple-100 to-pink-100' },
    { className: 'w-[32rem] h-[32rem] sm:w-[42rem] sm:h-[42rem] bottom-[-35%] left-[10%]', animationClass: 'animate-aurora-blob-3', opacity: 0.1, colorClasses: 'bg-gradient-to-br from-teal-100 to-cyan-100' },
    { className: 'w-[26rem] h-[26rem] sm:w-[32rem] sm:h-[32rem] bottom-[-25%] right-[-15%]', animationClass: 'animate-aurora-blob-4', opacity: 0.07, colorClasses: 'bg-gradient-to-br from-orange-100 to-yellow-100' },
  ];

  const floatingElementsData = [
    { IconComponent: ClockIcon, style: { top: '10%', left: '85%', width: '30px', height: '30px', animationDelay: '0s', animationDuration: '28s' }, colorClass: 'text-pink-200', opacity: 0.3 },
    { IconComponent: UsersIcon, style: { top: '75%', left: '5%', width: '35px', height: '35px', animationDelay: '3s',  animationDuration: '30s' }, colorClass: 'text-blue-200', opacity: 0.25 },
    { IconComponent: CreditCardIcon, style: { top: '20%', left: '15%', width: '40px', height: '40px', animationDelay: '1s',  animationDuration: '26s' }, colorClass: 'text-purple-200', opacity: 0.2 },
    { IconComponent: MapPinIcon, style: { top: '80%', left: '70%', width: '28px', height: '28px', animationDelay: '4s',  animationDuration: '32s' }, colorClass: 'text-red-200', opacity: 0.35 },
    { IconComponent: HeartIcon, style: { top: '50%', left: '90%', width: '25px', height: '25px', animationDelay: '2s', animationDuration: '25s' }, colorClass: 'text-teal-200', opacity: 0.2 },
  ];


  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center relative overflow-hidden">
      {auroraBlobsData.map((blob, index) => (
        <AuroraBlob key={`aurora-form-${index}`} className={`${blob.className} ${blob.colorClasses}`} animationClass={blob.animationClass} opacity={blob.opacity} />
      ))}
      {floatingElementsData.map((iconData, index) => (
        <FloatingElement 
          key={`float-form-${index}`} 
          IconComponent={iconData.IconComponent} 
          style={iconData.style} 
          animationClass="animate-float" 
          colorClass={iconData.colorClass}
          opacity={iconData.opacity}
        />
      ))}

      <div className={`w-full max-w-5xl relative z-10 transform transition-all duration-1000 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <header className="text-center mb-10 md:mb-12 pt-4">
          <h1 className={`text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 [text-shadow:0_1px_4px_rgba(100,150,255,0.2)] transition-all duration-700 ease-out py-2 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            {APP_NAME}
          </h1>
          <p className={`mt-3 text-md sm:text-lg text-slate-600 transition-all duration-700 ease-out delay-150 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            请告诉我们您的梦想之旅！越详细越好哦。
          </p>
        </header>

        <form 
          onSubmit={handleSubmit} 
          className={`space-y-8 bg-white rounded-3xl shadow-2xl border border-slate-100/90 p-10 sm:p-12 relative overflow-hidden transform transition-all duration-1000 ease-out delay-300 ${isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 relative z-10">
            <Input
              id="startCity"
              label="出发城市 (必填)"
              name="startCity"
              value={demand.startCity}
              onChange={handleInputChange}
              placeholder="请输入出发城市"
              required
              floatingLabel
              icon={<MapPinIcon className="w-5 h-5" />}
            />

            <Input
              id="destination"
              label="目的地城市 (必填)"
              name="destination"
              value={demand.destination}
              onChange={handleInputChange}
              placeholder="请输入目的地"
              required
              floatingLabel
              icon={<MapPinIcon className="w-5 h-5" />}
            />
            
            <Input
              id="duration"
              label="旅行天数 (必填)"
              name="duration"
              value={demand.duration}
              onChange={handleInputChange}
              placeholder="例如：7天"
              required
              floatingLabel
              icon={<ClockIcon className="w-5 h-5" />}
            />

            <Input
              id="people"
              label="旅行人数 (必填)"
              name="people"
              value={demand.people}
              onChange={handleInputChange}
              placeholder="例如：2人"
              required
              floatingLabel
              icon={<UsersIcon className="w-5 h-5" />}
            />
            
            <div className="md:col-span-2">
              <Input
                id="budget"
                label="预算 (可选)"
                name="budget"
                value={demand.budget}
                onChange={handleInputChange}
                placeholder="例如：5000-10000元"
                floatingLabel
                icon={<CreditCardIcon className="w-5 h-5" />}
              />
            </div>
          </div>

          <div className="relative z-10">
            <TextArea
              id="rawInput"
              label="额外需求描述 (可选)"
              name="rawInput"
              value={demand.rawInput}
              onChange={handleRawInputChange}
              placeholder="例如：对历史文化感兴趣，希望包含至少两个博物馆..."
              rows={5}
              floatingLabel
            />
            {recognizedTags.length > 0 && (
              <div className="mt-4 p-3 sm:p-4 bg-slate-50/70 rounded-xl shadow-sm">
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2 tracking-wider">AI 理解为：</h4>
                <div className="flex flex-wrap gap-2">
                  {recognizedTags.map(tag => (
                    <Tag 
                      key={tag.id} 
                      text={`${tag.category}: ${tag.value}`} 
                      onRemove={() => handleTagRemove(tag.id)} 
                      color="bg-sky-100/90 text-sky-700"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            className="w-full relative z-10 shadow-lg hover:shadow-xl hover:shadow-indigo-400/40 transform hover:-translate-y-1 hover:scale-[1.02] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:brightness-110 text-white focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-white rounded-xl py-3.5 text-lg group" 
            disabled={isLoading}
          >
            {isLoading ? '正在规划您的旅程...' : '生成我的行程'}
             {isLoading && (
              <svg className="animate-spin ml-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
             )}
             {!isLoading && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-2.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:scale-110">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
             )}
          </Button>

          <div className={`mt-8 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 transform transition-opacity duration-700 ease-out delay-[600ms] ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
            <span className="bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-full text-xs flex items-center shadow-sm group hover:bg-slate-200/70 transition-colors">
              <AiChipIcon className="w-4 h-4 mr-1.5 text-blue-500 group-hover:scale-110 transition-transform" />
              AI 智能规划
            </span>
            <span className="bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-full text-xs flex items-center shadow-sm group hover:bg-slate-200/70 transition-colors">
              <SparklesIcon className="w-4 h-4 mr-1.5 text-purple-500 group-hover:scale-110 transition-transform" />
              个性化定制
            </span>
            <span className="bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-full text-xs flex items-center shadow-sm group hover:bg-slate-200/70 transition-colors">
              <ShieldLockIcon className="w-4 h-4 mr-1.5 text-teal-500 group-hover:scale-110 transition-transform" />
              安全与隐私
            </span>
          </div>

        </form>
         <footer className={`relative z-10 w-full pt-10 text-center text-slate-500 text-xs transition-opacity duration-1000 ease-out delay-[800ms] ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
             © {new Date().getFullYear()} {APP_NAME}. 精心为您规划.
        </footer>
      </div>
    </div>
  );
};
