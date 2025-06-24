
import React from 'react';

// Extend React.HTMLAttributes<HTMLDivElement> to include all standard div attributes and event handlers
// like onClick, onMouseEnter, onMouseLeave, etc.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  // onClick?: () => void; // This is now covered by React.HTMLAttributes<HTMLDivElement>
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hoverEffect = false, 
  ...props // Capture rest of the props (e.g., onClick, onMouseEnter, onMouseLeave)
}) => {
  const hoverStyles = hoverEffect ? 'hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300 ease-in-out' : '';
  return (
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden ${hoverStyles} ${className}`}
      {...props} // Spread the captured props onto the div element
    >
      {children}
    </div>
  );
};
