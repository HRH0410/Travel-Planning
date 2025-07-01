import { useState, useEffect, useCallback } from 'react';

const ELDER_MODE_KEY = 'elder-mode-enabled';

/**
 * 管理老人友好模式状态的自定义 Hook.
 * 
 * @returns `isElderMode` (boolean): 当前是否为老人模式.
 * @returns `toggleElderMode` (function): 用于切换模式的函数.
 */
export const useElderMode = () => {
  const [isElderMode, setIsElderMode] = useState(false);

  // 优雅的老人友好模式 - 保持美观的同时提升可访问性
  const applyElderModeStyles = (enable: boolean) => {
    const html = document.documentElement;
    
    // 添加/移除类
    html.classList.toggle('elder-mode', enable);
    
    // 移除所有可能的边框
    if (enable) {
      document.body.style.border = 'none';
      document.documentElement.style.border = 'none';
      document.querySelectorAll('*').forEach((el) => {
        if (el instanceof HTMLElement && el.classList.contains('elder-mode-background')) {
          el.style.border = 'none';
          el.style.outline = 'none';
          el.style.boxShadow = 'none';
        }
      });
    }
    
    if (enable) {
      // 1. 字体和按钮适度放大，提升可读性
      document.querySelectorAll('h1').forEach((h1: Element) => {
        if (h1 instanceof HTMLElement && !h1.getAttribute('data-elder-applied')) {
          h1.setAttribute('data-elder-applied', 'true');
          h1.style.fontSize = '3rem';
          h1.style.fontWeight = '700';
        }
      });
      
      document.querySelectorAll('h2').forEach((h2: Element) => {
        if (h2 instanceof HTMLElement && !h2.getAttribute('data-elder-applied')) {
          h2.setAttribute('data-elder-applied', 'true');
          h2.style.fontSize = '2.25rem';
          h2.style.fontWeight = '600';
        }
      });
      
      document.querySelectorAll('p').forEach((p: Element) => {
        if (p instanceof HTMLElement && !p.getAttribute('data-elder-applied')) {
          p.setAttribute('data-elder-applied', 'true');
          p.style.fontSize = '1.25rem';
          p.style.lineHeight = '1.7';
          p.style.color = '#374151';
        }
      });
      
      // 2. 按钮增大，提升交互友好性
      document.querySelectorAll('button').forEach((btn: Element) => {
        if (btn instanceof HTMLElement && !btn.getAttribute('data-elder-applied')) {
          btn.setAttribute('data-elder-applied', 'true');
          btn.setAttribute('data-original-padding', btn.style.padding || '');
          btn.setAttribute('data-original-font-size', btn.style.fontSize || '');
          
          btn.style.padding = '14px 28px';
          btn.style.fontSize = '1.125rem';
          btn.style.fontWeight = '600';
          btn.style.minHeight = '48px';
        }
      });
      
      // 3. 仅隐藏明确的装饰性元素
      // 隐藏背景粒子动画
      document.querySelectorAll('canvas').forEach((canvas: Element) => {
        if (canvas instanceof HTMLElement && !canvas.getAttribute('data-elder-hidden')) {
          canvas.setAttribute('data-elder-hidden', 'true');
          canvas.setAttribute('data-original-display', canvas.style.display || '');
          canvas.style.display = 'none';
        }
      });
      
      // 隐藏悬浮动画装饰
      document.querySelectorAll('[class*="animate-ping"], [class*="animate-pulse"], [class*="animate-float"]').forEach((el: Element) => {
        if (el instanceof HTMLElement && !el.getAttribute('data-elder-hidden')) {
          const isButton = el.tagName === 'BUTTON' || el.closest('button');
          const isToggle = el.id?.includes('elder-mode') || el.closest('[id*="elder-mode"]');
          
          if (!isButton && !isToggle) {
            el.setAttribute('data-elder-hidden', 'true');
            el.setAttribute('data-original-display', el.style.display || '');
            el.style.display = 'none';
          }
        }
      });

      // 4. 优雅的模式指示器
      const indicator = document.createElement('div');
      indicator.id = 'elder-mode-indicator';
      indicator.style.cssText = `
        position: fixed;
        top: 70px;
        right: 20px;
        background: rgba(59, 130, 246, 0.1);
        border: 2px solid rgba(59, 130, 246, 0.3);
        color: #1e40af;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 500;
        z-index: 9998;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 6px;
        opacity: 0;
        animation: slideInRight 0.5s ease forwards;
      `;
      
      indicator.innerHTML = `
        <span style="font-size: 16px;" role="img" aria-label="关怀模式">💝</span>
        <span>关怀模式</span>
      `;
      
      // 添加动画样式
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOutRight {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(100%); }
        }
      `;
      document.head.appendChild(style);
      
      document.body.appendChild(indicator);
      
      // 3秒后自动淡出指示器
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.style.animation = 'slideOutRight 0.5s ease forwards';
          setTimeout(() => {
            if (indicator.parentNode) {
              indicator.remove();
            }
          }, 500);
        }
      }, 3000);
      
    } else {
      // 恢复所有修改
      document.querySelectorAll('[data-elder-hidden="true"]').forEach((el: Element) => {
        if (el instanceof HTMLElement) {
          const originalDisplay = el.getAttribute('data-original-display');
          el.style.display = originalDisplay || '';
          el.removeAttribute('data-elder-hidden');
          el.removeAttribute('data-original-display');
        }
      });
      
      document.querySelectorAll('[data-elder-applied="true"]').forEach((el: Element) => {
        if (el instanceof HTMLElement) {
          el.style.fontSize = '';
          el.style.fontWeight = '';
          el.style.lineHeight = '';
          el.style.color = '';
          el.style.minHeight = '';
          
          if (el.tagName === 'BUTTON') {
            const originalPadding = el.getAttribute('data-original-padding');
            const originalFontSize = el.getAttribute('data-original-font-size');
            
            el.style.padding = originalPadding || '';
            el.style.fontSize = originalFontSize || '';
            
            el.removeAttribute('data-original-padding');
            el.removeAttribute('data-original-font-size');
          }
          
          el.removeAttribute('data-elder-applied');
        }
      });
      
      // 移除指示器
      const indicator = document.getElementById('elder-mode-indicator');
      if (indicator) indicator.remove();
    }
    
    console.log(`老人模式已${enable ? '启用' : '禁用'}`);
  };

  useEffect(() => {
    // 尝试从 localStorage 读取用户之前的设置
    const savedMode = localStorage.getItem(ELDER_MODE_KEY);
    const initialMode = savedMode === 'true';
    setIsElderMode(initialMode);

    // 应用初始模式样式
    applyElderModeStyles(initialMode);
  }, []);

  const toggleElderMode = useCallback(() => {
    setIsElderMode(prevMode => {
      const newMode = !prevMode;
      // 更新 localStorage
      localStorage.setItem(ELDER_MODE_KEY, String(newMode));
      // 应用或移除样式
      applyElderModeStyles(newMode);
      
      // 打印当前状态以便调试
      console.log(`老人模式切换为: ${newMode ? '开启' : '关闭'}`);
      return newMode;
    });
  }, []);

  return { isElderMode, toggleElderMode };
};
