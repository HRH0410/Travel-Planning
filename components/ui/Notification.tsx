import React, { useState, useEffect } from 'react';

interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  onClose?: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✅',
          bgColor: 'from-green-500 to-emerald-600',
          borderColor: 'border-green-200',
          textColor: 'text-green-800'
        };
      case 'error':
        return {
          icon: '❌',
          bgColor: 'from-red-500 to-rose-600',
          borderColor: 'border-red-200',
          textColor: 'text-red-800'
        };
      case 'warning':
        return {
          icon: '⚠️',
          bgColor: 'from-yellow-500 to-orange-600',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          bgColor: 'from-blue-500 to-cyan-600',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800'
        };
      default:
        return {
          icon: 'ℹ️',
          bgColor: 'from-gray-500 to-slate-600',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800'
        };
    }
  };

  const styles = getTypeStyles();

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white/95 backdrop-blur-lg border ${styles.borderColor} rounded-2xl shadow-2xl transition-all duration-300 transform ${
        isExiting ? 'opacity-0 translate-x-full scale-95' : 'opacity-100 translate-x-0 scale-100'
      }`}
    >
      {/* 顶部渐变条 */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${styles.bgColor} rounded-t-2xl`}></div>
      
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* 图标 */}
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${styles.bgColor} flex items-center justify-center text-white shadow-lg`}>
              <span className="text-sm">{styles.icon}</span>
            </div>
          </div>
          
          {/* 内容 */}
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-semibold ${styles.textColor} mb-1`}>
              {title}
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {message}
            </p>
          </div>
          
          {/* 关闭按钮 */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* 进度条 */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200/50 rounded-b-2xl overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${styles.bgColor} rounded-b-2xl`}
            style={{ 
              width: '100%',
              animation: `progress-shrink ${duration}ms linear forwards`
            }}
          ></div>
        </div>
      )}
      
      {/* 内联样式 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes progress-shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `
      }} />
    </div>
  );
};

export default Notification;

// Hook for managing notifications
export const useNotification = () => {
  const [notifications, setNotifications] = useState<(NotificationProps & { id: string })[]>([]);

  const addNotification = (notification: Omit<NotificationProps, 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = {
      ...notification,
      id,
      onClose: () => removeNotification(id)
    };
    
    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const NotificationContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          {...notification}
        />
      ))}
    </div>
  );

  return {
    addNotification,
    removeNotification,
    NotificationContainer
  };
};
