import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ScrollToTopButton } from './ui/ScrollToTop';
import { useElderModeContext } from './ElderModeContext';
import { APP_NAME } from '../constants';
import logoImage from "../components/Logo.png";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isElderMode, toggleElderMode } = useElderModeContext();
  
  // 检查页面类型
  const isHomePage = location.pathname === '/';
  const isDemandInputPage = location.pathname === '/demand-input';

  // 监听滚动效果
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGoHome = () => {
    navigate('/');
    setShowMobileMenu(false);
  };

  // 导航菜单项
  const navItems = [
    { label: '首页', path: '/', icon: '🏠', active: isHomePage },
    { label: '规划旅行', path: '/demand-input', icon: '✈️', active: isDemandInputPage },
  ];

  return (
    <div className="min-h-screen antialiased text-gray-900 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 elder:text-lg elder:border-none">
      {/* 美化的导航栏 */}
      <header className={`sticky top-0 z-50 transition-all duration-500 elder:transition-none ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-md border-b border-white/30 elder:border-none' 
          : 'bg-white/85 backdrop-blur-md shadow-sm elder:border-none'
      }`}>
        {/* 导航栏光晕背景 - 更柔和的背景 */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-purple-50/10 to-pink-50/20 opacity-30"></div>
        
        <div className="w-full relative px-2">
          <div className="flex items-center justify-between h-16">
            
            {/* 左侧Logo区域 - 优化对齐和视觉效果 */}
            <div className="flex items-center pl-2">
              <div 
                className="flex items-center cursor-pointer group transition-all duration-300 hover:scale-[1.02] elder:transform-none elder:transition-none"
                onClick={handleGoHome}
              >
                <div className="relative mr-3 flex items-center">
                  <img 
                    src={logoImage} 
                    alt="应用Logo" 
                    className="w-9 h-9 object-contain rounded-lg shadow-md transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-lg elder:transform-none elder:transition-none elder:w-11 elder:h-11" 
                  />
                  {/* 简化光环效果 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 elder:hidden"></div>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 transition-all duration-300 tracking-tight elder:text-2xl">
                    {APP_NAME}
                  </span>
                </div>
              </div>
            </div>

            {/* 右侧导航区域 - 贴右边缘放置 */}
            <div className="flex items-center space-x-3">
              {/* 关怀模式按钮 - 只在首页显示 */}
              {isHomePage && (
                <button
                  onClick={toggleElderMode}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center space-x-2 border ${
                    isElderMode
                      ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                      : 'bg-white/80 text-gray-700 border-gray-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300'
                  }`}
                  title={isElderMode ? '退出关怀模式' : '开启关怀模式'}
                >
                  <span className="text-base">👴</span>
                  <span className="hidden sm:inline">{isElderMode ? '关怀模式' : '关怀模式'}</span>
                </button>
              )}

              {/* 桌面端导航菜单 - 简化且美观 */}
              <nav className="hidden md:flex items-center space-x-2">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`px-5 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center space-x-1.5 group elder:px-6 elder:py-3 elder:text-base elder:transition-none ${
                      item.active
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50/70 hover:to-purple-50/70'
                    }`}
                  >
                    <span className="text-base transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 elder:transform-none elder:transition-none elder:text-lg">{item.icon}</span>
                    <span className="relative">
                      {item.label}
                      {!item.active && (
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300 elder:hidden"></span>
                      )}
                    </span>
                  </button>
                ))}
              </nav>

              {/* 移动端菜单按钮 - 贴右边缘放置 */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:text-blue-600 bg-gray-100/50 hover:bg-blue-50/70 transition-all duration-300 mr-1 elder:p-3 elder:transition-none"
                aria-label="菜单"
              >
                <svg className="w-6 h-6 elder:w-8 elder:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {!showMobileMenu ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* 移动端下拉菜单 - 简化设计 */}
          {showMobileMenu && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white/97 backdrop-blur-xl border-t border-white/20 shadow-lg z-30 elder:transition-none">
              
              <div className="w-full px-3 py-3 space-y-2">
                {/* 关怀模式按钮 - 只在首页显示 */}
                {isHomePage && (
                  <button
                    onClick={() => {
                      toggleElderMode();
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-left transition-all duration-300 elder:py-4 elder:transition-none ${
                      isElderMode
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50/70'
                    }`}
                  >
                    <span className="text-lg elder:text-xl">👴</span>
                    <span className="flex-1 elder:text-lg">{isElderMode ? '退出关怀模式' : '开启关怀模式'}</span>
                    {isElderMode && (
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse elder:w-3 elder:h-3"></span>
                    )}
                  </button>
                )}
                
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-left transition-all duration-300 elder:py-4 elder:transition-none ${
                      item.active
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/70'
                    }`}
                  >
                    <span className="text-lg elder:text-xl">{item.icon}</span>
                    <span className="flex-1 elder:text-lg">{item.label}</span>
                    {item.active && (
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse elder:w-3 elder:h-3"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header> 
      
      {/* 主要内容区域 */}
      <main className="min-h-[calc(100vh-4rem)] relative"> 
        {children}
      </main>
      
      {/* 返回顶部按钮 */}
      <ScrollToTopButton />
    </div>
  );
};

export default Layout;
