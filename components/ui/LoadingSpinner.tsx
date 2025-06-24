
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
