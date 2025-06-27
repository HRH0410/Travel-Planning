import React, { useState } from 'react';
import { NewDemandInputPage } from './DemandInputPage';
import { TravelPlanningLoader } from './ui/LoadingSpinner';
import { LoadingDemo } from './LoadingDemo';
import { Button } from './ui/Button';
import { UserDemand } from '../types';

type DemoMode = 'input' | 'loading' | 'loader-preview';

export const ComprehensiveDemo: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<DemoMode>('input');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitDemand = (demand: UserDemand) => {
    console.log('提交的需求:', demand);
    setIsLoading(true);
    setCurrentMode('loading');
    
    // 模拟10秒的加载过程
    setTimeout(() => {
      setIsLoading(false);
      setCurrentMode('input');
      alert('行程规划完成！（这是演示版本）');
    }, 10000);
  };

  const switchToInput = () => setCurrentMode('input');
  const switchToLoaderPreview = () => setCurrentMode('loader-preview');

  if (currentMode === 'loading') {
    return (
      <TravelPlanningLoader message="正在为您生成个性化旅行方案..." />
    );
  }

  if (currentMode === 'loader-preview') {
    return <LoadingDemo />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-800">旅行规划优化演示</h1>
            <div className="flex space-x-3">
              <Button
                onClick={switchToInput}
                variant="primary"
                size="sm"
              >
                需求输入页
              </Button>
              <Button
                onClick={switchToLoaderPreview}
                variant="secondary"
                size="sm"
              >
                加载界面预览
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <NewDemandInputPage 
        onSubmitDemand={handleSubmitDemand}
        isLoading={isLoading}
      />

      {/* 底部说明 */}
      <div className="bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">优化完成的功能</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-1">✅ 预算选择优化</h4>
                <p>预设卡片 + 自定义模态框，去除原生prompt</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-1">✅ 旅行类型美化</h4>
                <p>精简为6个类型，2行3列布局美观</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-800 mb-1">✅ 加载界面艺术化</h4>
                <p>渐变背景、浮动元素、多层动画效果</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
