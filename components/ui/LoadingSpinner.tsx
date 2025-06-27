
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text }) => {
  let spinnerSize = 'h-8 w-8';
  if (size === 'sm') spinnerSize = 'h-5 w-5';
  if (size === 'lg') spinnerSize = 'h-12 w-12';

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div
        className={`animate-spin rounded-full ${spinnerSize} border-b-2 border-t-2 border-blue-500`}
      ></div>
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
};

export const SkeletonLoader: React.FC<{className?: string}> = ({ className }) => {
  return <div className={`animate-pulse bg-gray-300 rounded ${className || 'h-4 w-full'}`}></div>;
};

// 旅行规划专用加载组件
export const TravelPlanningLoader: React.FC<{ message?: string }> = () => {
  const [progress, setProgress] = React.useState(0);
  const [currentStep, setCurrentStep] = React.useState(0);
  
  const steps = [
    { label: '分析需求', icon: '🎯', color: 'from-blue-500 to-cyan-500' },
    { label: '匹配景点', icon: '🏛️', color: 'from-purple-500 to-pink-500' },
    { label: '优化路线', icon: '🗺️', color: 'from-pink-500 to-rose-500' },
    { label: '生成行程', icon: '📋', color: 'from-orange-500 to-yellow-500' }
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 100;
        }
        // 模拟真实的加载过程，前期快速增长，后期缓慢
        const increment = prev < 30 ? 2 : prev < 60 ? 1.5 : prev < 90 ? 1 : 0.5;
        return Math.min(prev + increment, 100);
      });
    }, 200);

    // 步骤切换逻辑
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center relative overflow-hidden">
      {/* 动态网格背景 */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-12 h-full">
          {Array.from({ length: 144 }).map((_, i) => (
            <div
              key={i}
              className="border border-gray-300 animate-pulse"
              style={{ animationDelay: `${(i * 0.1) % 3}s`, animationDuration: '4s' }}
            />
          ))}
        </div>
      </div>

      {/* 背景动画元素 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 浮动的旅行元素 */}
        <div className="absolute top-20 left-10 w-20 h-20 text-blue-300/40 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
          <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-300 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
        </div>
        
        <div className="absolute top-40 right-20 w-16 h-16 text-purple-300/35 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}>
          <div className="w-full h-full bg-gradient-to-br from-purple-200 to-purple-300 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>

        <div className="absolute bottom-32 left-16 w-18 h-18 text-pink-300/30 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}>
          <div className="w-full h-full bg-gradient-to-br from-pink-200 to-pink-300 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-9 h-9 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>

        <div className="absolute top-60 right-40 w-14 h-14 text-orange-300/40 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}>
          <div className="w-full h-full bg-gradient-to-br from-orange-200 to-orange-300 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="absolute top-1/3 left-1/3 w-12 h-12 text-teal-300/35 animate-bounce" style={{ animationDelay: '3s', animationDuration: '5s' }}>
          <div className="w-full h-full bg-gradient-to-br from-teal-200 to-teal-300 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
          </div>
        </div>

        {/* 更丰富的流动光晕效果 */}
        <div className="absolute top-10 left-20 w-40 h-40 bg-gradient-to-r from-blue-200/20 via-cyan-200/20 to-purple-200/20 rounded-full blur-xl animate-pulse" style={{ animationDuration: '6s' }}></div>
        <div className="absolute bottom-20 right-32 w-32 h-32 bg-gradient-to-r from-pink-200/25 via-rose-200/25 to-orange-200/25 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '8s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-28 h-28 bg-gradient-to-r from-cyan-200/20 via-teal-200/20 to-emerald-200/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '4s', animationDuration: '7s' }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-36 h-36 bg-gradient-to-r from-indigo-200/15 via-purple-200/15 to-pink-200/15 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '9s' }}></div>
      </div>

      {/* 主加载内容 */}
      <div className="relative z-10 text-center max-w-lg mx-auto px-6">
        {/* 主加载动画 */}
        <div className="relative mb-8">
          {/* 外圈动画 */}
          <div className="w-40 h-40 mx-auto relative">
            {/* 最外层光环 */}
            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 blur-lg animate-pulse" style={{ animationDuration: '4s' }}></div>
            
            {/* 旋转圈层 */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 border-r-purple-400 animate-spin" style={{ animationDuration: '3s' }}></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-pink-400 border-l-orange-400 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
            <div className="absolute inset-4 rounded-full border-2 border-transparent border-b-cyan-400 border-r-teal-400 animate-spin" style={{ animationDuration: '4s' }}></div>
            
            {/* 中心图标容器 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse relative overflow-hidden">
                {/* 内部光效 */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-full"></div>
                
                {/* AI 图标 */}
                <div className="relative z-10">
                  <svg className="w-10 h-10 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                
                {/* 脉冲波纹 */}
                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" style={{ animationDuration: '3s' }}></div>
                
                {/* 进度环 */}
                <div className="absolute inset-0 rounded-full">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="2"
                      fill="none"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="rgba(255,255,255,0.8)"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={`${(progress / 100) * 220} 220`}
                      strokeLinecap="round"
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* 围绕的小点 */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="absolute w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-80px)`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </div>
        </div>

        {/* 加载文字 */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse drop-shadow-sm">
              AI 正在为您规划
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full mx-auto animate-pulse"></div>
          </div>
          
          <p className="text-xl text-gray-600 font-medium animate-pulse" style={{ animationDelay: '0.5s' }}>
            {progress < 25 ? '正在分析您的需求...' : 
             progress < 50 ? '正在匹配最佳景点...' :
             progress < 75 ? '正在优化旅行路线...' :
             progress < 95 ? '正在生成行程安排...' :
             '即将完成规划...'}
          </p>
          <p className="text-base text-gray-500 animate-pulse" style={{ animationDelay: '1s' }}>
            {progress < 50 ? '这可能需要一点时间，请耐心等待...' : 
             progress < 90 ? '马上就好，正在做最后的优化...' :
             '很快就能看到您的专属行程了！'}
          </p>
        </div>

        {/* 进度指示器 */}
        <div className="mt-10 space-y-6">
          {/* 脉冲点指示器 */}
          <div className="flex justify-center space-x-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="relative"
              >
                <div
                  className="w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"
                  style={{
                    animationDelay: `${i * 0.4}s`,
                    animationDuration: '2s'
                  }}
                />
                <div
                  className="absolute inset-0 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-ping opacity-30"
                  style={{
                    animationDelay: `${i * 0.4}s`,
                    animationDuration: '3s'
                  }}
                />
              </div>
            ))}
          </div>
          
          {/* 精美进度条 */}
          <div className="w-80 h-3 bg-gray-200/50 backdrop-blur-sm rounded-full overflow-hidden mx-auto relative shadow-inner">
            {/* 背景光效 */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            
            {/* 主进度条 */}
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full relative overflow-hidden shadow-lg transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }}
            >
              {/* 进度条内光效 */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent animate-pulse"></div>
              
              {/* 移动光点 */}
              <div className="absolute top-0 right-0 w-6 h-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse transform translate-x-2" style={{ animationDuration: '1.5s' }}></div>
            </div>
            
            {/* 进度条边框高光 */}
            <div className="absolute inset-0 rounded-full border border-white/30"></div>
          </div>
          
          {/* 进度百分比 */}
          <div className="text-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
              {Math.round(progress)}%
            </span>
            <p className="text-sm text-gray-500 mt-1">正在处理中...</p>
          </div>
        </div>

        {/* 提示标签 */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {steps.map((item, index) => (
            <div
              key={item.label}
              className="group relative"
              style={{ animationDelay: `${index * 0.6}s` }}
            >
              <div className={`px-5 py-3 backdrop-blur-sm rounded-2xl border shadow-lg text-gray-700 transition-all duration-300 flex items-center space-x-2 ${
                index === currentStep 
                  ? 'bg-white/90 border-blue-300 scale-105 shadow-blue-200/50' 
                  : index < currentStep 
                    ? 'bg-green-50/80 border-green-300 text-green-700'
                    : 'bg-white/70 border-white/40 animate-pulse hover:bg-white/80'
              }`}>
                <span className="text-lg">
                  {index < currentStep ? '✅' : index === currentStep ? item.icon : item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
                {index === currentStep && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                )}
              </div>
              
              {/* 标签底部光效 */}
              <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r ${item.color} rounded-full transition-opacity duration-300 ${
                index === currentStep ? 'opacity-100 animate-pulse' : index < currentStep ? 'opacity-60' : 'opacity-30'
              }`}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
