import * as React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, children, title }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative">
        {title && <h2 className="text-lg font-bold mb-4 text-gray-800">{title}</h2>}
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="关闭"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}; 