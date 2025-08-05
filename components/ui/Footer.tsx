import React from 'react';
import config from '../../config';

interface FooterProps {
  className?: string;
  variant?: 'default' | 'minimal';
}

const Footer: React.FC<FooterProps> = ({ 
  className = '', 
  variant = 'default' 
}) => {
  const { copyright } = config;

  if (variant === 'minimal') {
    return (
      <footer className={`text-xs text-gray-500 text-center py-2 ${className}`}>
        <div>
          {copyright.text}
        </div>
        <a className="mt-1" href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
          {copyright.icp}
        </a>
      </footer>
    );
  }

  // 默认样式
  return (
    <footer className={`text-sm text-gray-500 text-center py-4 border-t border-gray-200 ${className}`}>
      <div>
        {copyright.text}
      </div>
      <a className="mt-1" href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
        {copyright.icp}
      </a>
    </footer>
  );
};

export default Footer;
