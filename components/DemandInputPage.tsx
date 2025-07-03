import React, { useState, useCallback } from 'react';
import { Button } from './ui/Button';
import { Input, TextArea } from './ui/Input';
import { Slider } from './ui/Slider';
import { SelectionCard, SelectionGrid } from './ui/Selection';
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

const TravelMapPinIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const RedFlagIcon = () => (
  <span className="text-3xl">🚩</span> 
);

const TravelCameraIcon = () => (
  <span className="text-3xl">📹</span> 
);

const TravelMountainIcon = () => (
  <span className="text-3xl">🏔️</span>
);

const TravelBeachIcon = () => (
  <span className="text-3xl">🏖️</span>
);

const TravelCityIcon = () => (
  <span className="text-3xl">🏙️</span>
);

const TravelFoodIcon = () => (
  <span className="text-3xl">🍽️</span>
);

// 旅行类型数据
const travelTypesData = [
  { 
    id: 'relaxing', 
    title: '悠然假期', 
    description: '慢节奏，放松身心', 
    icon: <TravelBeachIcon />, 
    color: 'blue' as const,
    prompt: ''
    // prompt: '请为我安排一个放松舒适的旅行，节奏要慢，重点关注休闲度假、温泉疗养等能让身心得到充分放松的活动和场所'
  },
  { 
    id: 'adventure', 
    title: '探索未知', 
    description: '征服自然的精彩旅程', 
    icon: <TravelMountainIcon />, 
    color: 'green' as const,
    prompt: ''
    // prompt: '请为我规划一个充满冒险精神的旅行，包含户外探险、登山徒步、极限运动等挑战性活动，让我能够征服自然、挑战自我'
  },
  { 
    id: 'cultural', 
    title: '文化之旅', 
    description: '历史与人文的深度沉浸', 
    icon: <TravelCityIcon />, 
    color: 'purple' as const,
    prompt: ''
    // prompt: '请为我安排一个深度的文化体验之旅，重点包含历史古迹、博物馆、传统文化体验、当地民俗活动等，让我能够深入了解当地的历史文化底蕴'
  },
  { 
    id: 'redtour', 
    title: '精神之旅', 
    description: '走进历史现场，聆听信仰的回声', 
    icon: <RedFlagIcon />, 
    color: 'red' as const,
    // prompt: ''
    prompt: '请为我规划一个红色文化主题的旅行，重点参观革命历史遗址、纪念馆、红色教育基地等，让我能够重温历史、传承红色精神'
  },
  { 
    id: 'photography', 
    title: '镜头里的风景', 
    description: '定格每一帧美好', 
    icon: <TravelCameraIcon />, 
    color: 'orange' as const,
    prompt: '请为我安排一个摄影主题的旅行，重点推荐风景优美、适合摄影的景点，让我能够捕捉到最美的画面'
  },
  { 
    id: 'food', 
    title: '舌尖盛宴', 
    description: '走哪儿吃哪儿，探味世界', 
    icon: <TravelFoodIcon />, 
    color: 'indigo' as const,
    prompt: '请为我规划一个美食主题的旅行，重点推荐当地特色餐厅、街头小吃、传统美食体验活动，让我能够品尝到最地道的当地美味'
  },
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
              className="w-full text-2xl p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 bg-white/90 transition-all duration-300"
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
              className="w-full text-2xl p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 bg-white/90 transition-all duration-300"
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
              placeholder="例如：5天"
              className="w-full text-2xl p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 bg-white/90 transition-all duration-300"
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
              className="w-full text-2xl p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 bg-white/90 transition-all duration-300"
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
              className="w-full text-2xl p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 bg-white/90 transition-all duration-300 resize-none"
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
  const totalSteps = 3;

  // 滑动条状态
  const [duration, setDuration] = useState(3);
  const [people, setPeople] = useState(2);
  
  // 选择状态
  const [selectedTravelType, setSelectedTravelType] = useState<string>('');
  
  // 表单验证状态
  const [errors, setErrors] = useState<{[key: string]: string}>({});

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
    // 构建完整的原始输入信息
    const rawInputParts = [];
    
    // 添加旅行类型的专门 prompt
    if (selectedTravelType) {
      const travelType = travelTypesData.find(t => t.id === selectedTravelType);
      if (travelType?.prompt) {
        rawInputParts.push(travelType.prompt);
      }
    }
    
    // 添加用户输入的其他需求
    if (demand.rawInput && demand.rawInput.trim()) {
      rawInputParts.push(`其他需求：${demand.rawInput.trim()}`);
    }
    
    const finalDemand: UserDemand = {
      ...demand,
      duration: duration.toString(),
      people: people.toString(),
      budget: '', // 不再收集预算信息
      rawInput: rawInputParts.join('。') || '' // 用句号连接所有信息，如果没有信息则为空字符串
    };
    
    onSubmitDemand(finalDemand);
  }, [demand, duration, people, selectedTravelType, onSubmitDemand]);

  const handleTravelTypeSelect = (typeId: string) => {
    setSelectedTravelType(typeId);
  };

  // 删除了handleInterestToggle函数

  const handleInputChange = (field: keyof UserDemand, value: string) => {
    setDemand(prev => ({ ...prev, [field]: value }));
  };

  // 步骤进度指示器
  const StepIndicator = () => (
    <div className="flex justify-center mb-10">
      <div className="flex items-center space-x-4">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <React.Fragment key={step}>
            <div className="relative">
              {/* 当前步骤的彩色光晕效果 */}
              {step === currentStep && (
                <div className={`absolute -inset-2 rounded-full blur-md ${
                  step === 1 ? 'bg-blue-400/40 animate-pulse-slow' : 
                  step === 2 ? 'bg-green-400/40 animate-pulse-slow' : 
                  'bg-orange-400/40 animate-pulse-slow'
                }`}></div>
              )}
              
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-500 ${
                  step < currentStep
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl scale-95' 
                    : step === currentStep 
                    ? `bg-gradient-to-r ${
                        step === 1 ? 'from-blue-500 to-purple-600' : 
                        step === 2 ? 'from-green-500 to-blue-600' : 
                        'from-orange-500 to-red-600'
                      } text-white shadow-2xl scale-105` 
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step < currentStep ? (
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className={step === currentStep ? 'animate-pulse' : ''}>{step}</span>
                )}
              </div>
            </div>
            
            {step < totalSteps && (
              <div className="relative w-16 h-2">
                <div
                  className={`absolute inset-y-0 left-0 h-1 rounded-full transition-all duration-700 ${
                    step < currentStep ? 'bg-gradient-to-r from-blue-400 to-purple-500 w-full' : 
                    step === currentStep ? 'bg-gradient-to-r from-blue-400/50 to-purple-500/50 w-1/3 animate-pulse-gentle' : 
                    'bg-gray-200 w-full'
                  }`}
                ></div>
              </div>
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
          <div className="space-y-6 transform transition-all duration-500">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
                定制专属旅行，从这里启程
              </h2>
              <p className="text-gray-600">告诉我们出发地与目的地，AI 将为你开启智慧旅途的第一步</p>
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
                className="bg-white/90 backdrop-blur-md shadow-md border border-white/50"
              />
              <Input
                label="目的地"
                value={demand.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                placeholder="请输入目的地"
                icon={<TravelMapPinIcon />}
                floatingLabel
                error={errors.destination}
                className="bg-white/90 backdrop-blur-md shadow-md border border-white/50"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8 transform transition-all duration-500">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent animate-gradient-x">
                 设定出行节奏，安排同行伙伴
              </h2>
              <p className="text-gray-600">请选择您的出行天数与随行人数，我们为您量身定制专属节奏</p>
            </div>
            
            <div className="space-y-8">
              <Slider
                label="旅行天数"
                min={1}
                max={7}
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
                max={5}
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
          <div className="space-y-8 transform transition-all duration-500">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent animate-gradient-x">
                定制旅行风格 · 满足你的全部幻想
              </h2>
            
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
            
            <div className="mt-6">
              <TextArea
                label="✨ 还有任何需要我们特别照顾的地方吗？请告诉我们，我们会尽力为您安排贴心旅程～"
                value={demand.rawInput}
                onChange={(e) => handleInputChange('rawInput', e.target.value)}
                placeholder="如：不走山路、饮食清淡、携带老人或小孩、喜欢慢节奏旅行…（可选）"
                floatingLabel
                className="bg-white/90 backdrop-blur-md shadow-md border border-white/50"
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
      {/* 动态渐变背景 - 根据当前步骤变色 */}
      <div 
        className={`absolute inset-0 transition-colors duration-1000 ease-in-out ${
          currentStep === 1 ? 'bg-gradient-to-br from-blue-50 via-purple-50/30 to-pink-50' : 
          currentStep === 2 ? 'bg-gradient-to-br from-green-50 via-blue-50/30 to-cyan-50' : 
          'bg-gradient-to-br from-orange-50 via-red-50/30 to-amber-50'
        }`}
      ></div>
      
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-10 left-10 w-20 h-20 rounded-full opacity-20 animate-pulse-slow ${
          currentStep === 1 ? 'bg-blue-300' : 
          currentStep === 2 ? 'bg-green-300' : 
          'bg-orange-300'
        }`}></div>
        <div className={`absolute top-32 right-20 w-16 h-16 rounded-full opacity-20 animate-pulse-slow animation-delay-1000 ${
          currentStep === 1 ? 'bg-purple-300' : 
          currentStep === 2 ? 'bg-blue-300' : 
          'bg-red-300'
        }`}></div>
        <div className={`absolute bottom-20 left-32 w-24 h-24 rounded-full opacity-20 animate-float-gentle animation-delay-2000 ${
          currentStep === 1 ? 'bg-pink-300' : 
          currentStep === 2 ? 'bg-cyan-300' : 
          'bg-amber-300'
        }`}></div>
        <div className={`absolute bottom-32 right-10 w-12 h-12 rounded-full opacity-20 animate-float-gentle animation-delay-3000 ${
          currentStep === 1 ? 'bg-violet-300' : 
          currentStep === 2 ? 'bg-teal-300' : 
          'bg-yellow-300'
        }`}></div>
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
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 transition-all duration-500">
            {/* 动态渐变背景光晕 - 根据当前步骤变色 */}
            <div 
              className={`absolute -inset-1 rounded-3xl blur-xl opacity-40 transition-all duration-700 ease-out ${
                currentStep === 1 ? 'bg-gradient-to-r from-blue-400/50 to-purple-500/50' : 
                currentStep === 2 ? 'bg-gradient-to-r from-green-400/50 to-blue-500/50' : 
                'bg-gradient-to-r from-orange-400/50 to-red-500/50'
              }`}
            ></div>
            <div className="relative z-10">
              {renderStep()}
            </div>
            
            {/* 导航按钮 */}
            <div className="flex items-center mt-8 pt-6 border-t border-gray-200">
              {/* 第一步时不显示"上一步"按钮，但保留空间以保持布局一致 */}
              {currentStep !== 1 ? (
                <Button
                  variant="secondary"
                  onClick={handlePrevious}
                  className="px-6 py-3 transform transition-transform duration-300 hover:scale-105 hover:shadow-lg"
                >
                  上一步
                </Button>
              ) : (
                <div className="invisible px-6 py-3">上一步</div>
              )}
              
              <div className="flex-1 text-center text-sm text-gray-500">
                第 {currentStep} 步，共 {totalSteps} 步
              </div>
              
              <Button
                onClick={handleNext}
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
              >
                {isLoading ? '生成中...' : currentStep === totalSteps ? '开始规划' : '下一步'}
              </Button>
            </div>
          </div>
        </div>
      </div>
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
