import React, { useState, useCallback } from 'react';
import { Button } from './ui/Button';
import { Input, TextArea } from './ui/Input';
import { Slider } from './ui/Slider';
import { SelectionCard, SelectionGrid, TagCloud } from './ui/Selection';
import { Modal } from './ui/Modal';
import { UserDemand } from '../types';
import { APP_NAME } from '../constants';
import { useElderModeContext } from './ElderModeContext';


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
   <span className="w-6 h-6 inline-flex items-center justify-center text-lg">🕒</span>
);

const TravelUsersIcon = () => (
  <span className="w-6 h-6 inline-flex items-center justify-center text-lg">🧑‍🧑‍🧒</span>
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

// 关怀模式简化版组件
const ElderDemandInputPage: React.FC<DemandInputPageProps> = ({ onSubmitDemand, isLoading }) => {
  const [demand, setDemand] = useState<UserDemand>(initialDemand);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDemand(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    onSubmitDemand(demand);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 出发城市 */}
          <div>
            <h2 className="text-4xl font-bold text-blue-600 mb-4">出发城市</h2>
            <input
              type="text"
              name="startCity"
              value={demand.startCity}
              onChange={handleChange}
              placeholder="您从哪里出发？"
              className="w-full text-2xl p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* 目的地 */}
          <div>
            <h2 className="text-4xl font-bold text-blue-600 mb-4">目的地</h2>
            <input
              type="text"
              name="destination"
              value={demand.destination}
              onChange={handleChange}
              placeholder="您想去哪里？"
              className="w-full text-2xl p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* 旅行天数 */}
          <div>
            <h2 className="text-4xl font-bold text-blue-600 mb-4">旅行天数</h2>
            <input
              type="text"
              name="duration"
              value={demand.duration}
              onChange={handleChange}
              placeholder="例如：7天"
              className="w-full text-2xl p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* 旅行人数 */}
          <div>
            <h2 className="text-4xl font-bold text-blue-600 mb-4">旅行人数</h2>
            <input
              type="text"
              name="people"
              value={demand.people}
              onChange={handleChange}
              placeholder="例如：2人"
              className="w-full text-2xl p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* 预算 */}
          <div>
            <h2 className="text-4xl font-bold text-blue-600 mb-4">预算</h2>
            <input
              type="text"
              name="budget"
              value={demand.budget}
              onChange={handleChange}
              placeholder="例如：5000元"
              className="w-full text-2xl p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* 其他需求 */}
          <div>
            <h2 className="text-4xl font-bold text-blue-600 mb-4">其他需求</h2>
            <textarea
              name="rawInput"
              value={demand.rawInput}
              onChange={handleChange}
              placeholder="例如：希望包含博物馆和美食体验"
              rows={4}
              className="w-full text-2xl p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* 提交按钮 */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-3xl font-bold py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? '正在规划...' : '开始规划我的旅程'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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

export const DemandInputPage: React.FC<DemandInputPageProps> = ({ onSubmitDemand, isLoading }) => {
  const { isElderMode } = useElderModeContext();

  // 如果是关怀模式，渲染简化版
  if (isElderMode) {
    return <ElderDemandInputPage onSubmitDemand={onSubmitDemand} isLoading={isLoading} />;
  }

  // 普通模式渲染多步骤版
  return <NewDemandInputPage onSubmitDemand={onSubmitDemand} isLoading={isLoading} />;
};
