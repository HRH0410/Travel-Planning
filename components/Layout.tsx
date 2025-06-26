import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { APP_NAME } from '../constants';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Logo URL
  const logoImageUrl = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80";

  const handleGoHome = () => {
    navigate('/');
  };

  const handleNewPlan = () => {
    navigate('/demand-input');
  };

  return (
    <div className="min-h-screen antialiased text-gray-900 bg-white">
      <header className="bg-white/80 backdrop-blur-md shadow-sm p-4 sticky top-0 z-50 h-16 flex items-center">
        <div className="container mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
          <div 
            className="flex items-center cursor-pointer group"
            onClick={handleGoHome}
          >
            <img 
              src={logoImageUrl} 
              alt="应用Logo" 
              className="w-8 h-8 mr-3 object-contain rounded-md transition-transform duration-300 ease-out group-hover:scale-110" 
            />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 group-hover:opacity-80 transition-opacity">
              {APP_NAME}
            </span>
          </div>
          {(location.pathname.startsWith('/planning')) && (
            <Button 
              size="sm" 
              onClick={handleNewPlan}
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:brightness-110 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-white"
            >
              新计划
            </Button>
          )}
        </div>
      </header> 
      
      <main className="h-[calc(100vh-4rem)] overflow-hidden"> 
        {children}
      </main>
    </div>
  );
};

export default Layout;
