import * as React from 'react';

interface SplitterProps {
  onDrag: (deltaX: number) => void;
  isLeftCollapsed: boolean;
  isRightCollapsed: boolean;
}

export const Splitter: React.FC<SplitterProps> = ({ 
  onDrag, 
  isLeftCollapsed, 
  isRightCollapsed 
}) => {
  const dragging = React.useRef(false);
  const lastX = React.useRef(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // 如果有一侧折叠，点击时恢复
    if (isLeftCollapsed || isRightCollapsed) {
      return;
    }
    
    dragging.current = true;
    lastX.current = e.clientX;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none'; // 防止文本选中
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging.current) return;
    const deltaX = e.clientX - lastX.current;
    lastX.current = e.clientX;
    onDrag(deltaX);
  };

  const handleMouseUp = () => {
    dragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = ''; // 恢复文本选中
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="hidden lg:flex flex-col items-center justify-center transition-colors duration-150 h-full z-20 relative group select-none"
         style={{ minWidth: 20, maxWidth: 20 }}>
      
      {/* 拖拽区域 - 垂直居中的长圆角细条 */}
      <div
        className="w-full cursor-col-resize flex items-center justify-center relative"
        style={{ height: '50%', minHeight: '200px' }}
        onMouseDown={handleMouseDown}
      >
        {/* 主拖拽条 */}
        <div className="w-1 h-full bg-gray-400 rounded-full hover:bg-blue-500 transition-colors shadow-lg" 
             style={{ minHeight: '200px' }} />
      </div>
    </div>
  );
}; 