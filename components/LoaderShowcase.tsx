import React, { useState } from 'react';
import { TravelPlanningLoader } from './ui/LoadingSpinner';
import { Button } from './ui/Button';

export const LoaderShowcase: React.FC = () => {
  const [showLoader, setShowLoader] = useState(false);

  const handleShowLoader = () => {
    setShowLoader(true);
    // 15秒后自动隐藏，足够展示完整的加载过程
    setTimeout(() => {
      setShowLoader(false);
    }, 15000);
  };

  if (showLoader) {
    return <TravelPlanningLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
      <div className="text-center space-y-8 max-w-2xl mx-auto px-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            动态加载界面演示
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full mx-auto"></div>
        </div>
        
        <div className="space-y-6">
          <p className="text-xl text-gray-600 leading-relaxed">
            全新设计的旅行规划加载界面，具有以下特色：
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
              <h3 className="font-semibold text-blue-700 mb-2">🎯 动态进度条</h3>
              <p className="text-sm text-gray-600">从0%到100%的真实进度显示，模拟实际加载过程</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
              <h3 className="font-semibold text-purple-700 mb-2">🔄 分步骤显示</h3>
              <p className="text-sm text-gray-600">清晰展示：分析需求 → 匹配景点 → 优化路线 → 生成行程</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
              <h3 className="font-semibold text-pink-700 mb-2">✨ 多层动画</h3>
              <p className="text-sm text-gray-600">浮动元素、旋转圈环、脉冲效果、光晕背景</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
              <h3 className="font-semibold text-orange-700 mb-2">💬 智能提示</h3>
              <p className="text-sm text-gray-600">根据进度动态变化的加载提示信息</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleShowLoader}
            className="px-10 py-4 text-lg font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:brightness-110 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            🚀 体验动态加载界面
          </Button>
          
          <p className="text-sm text-gray-500">
            点击按钮体验完整的加载动画（约15秒）
          </p>
        </div>
      </div>
    </div>
  );
};
