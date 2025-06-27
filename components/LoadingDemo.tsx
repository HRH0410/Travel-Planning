import React, { useState } from 'react';
import { TravelPlanningLoader } from './ui/LoadingSpinner';
import { Button } from './ui/Button';

export const LoadingDemo: React.FC = () => {
  const [showLoader, setShowLoader] = useState(false);

  const handleShowLoader = () => {
    setShowLoader(true);
    // 模拟5秒后隐藏加载界面
    setTimeout(() => {
      setShowLoader(false);
    }, 10000);
  };

  if (showLoader) {
    return <TravelPlanningLoader message="正在生成您的个性化旅行计划..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">加载界面预览</h1>
        <p className="text-gray-600 max-w-md">
          点击下方按钮可以预览新的旅行规划加载界面。加载界面会自动在10秒后关闭。
        </p>
        <Button
          onClick={handleShowLoader}
          className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg shadow-lg transition-all duration-300"
        >
          预览加载界面
        </Button>
      </div>
    </div>
  );
};
