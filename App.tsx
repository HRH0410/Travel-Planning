
import React, { useState, useEffect, useCallback } from 'react';
import { HomePage } from './components/HomePage';
import { DemandInputPage } from './components/DemandInputPage';
import { PlanningPage } from './components/PlanningPage';
import { UserDemand, TravelPlan, AppView } from './types';
import { startPlanningSession, getPlanningResult, modifyExistingPlan } from './services/geminiService';
import { POLLING_INTERVAL, MAX_POLLS, APP_NAME } from './constants';
import { Button } from './components/ui/Button'; // Import Button for the header

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.Home);
  const [currentDemand, setCurrentDemand] = useState<UserDemand | null>(null);
  const [currentPlan, setCurrentPlan] = useState<TravelPlan | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  
  const [isLoadingPlan, setIsLoadingPlan] = useState<boolean>(false);
  const [isModifyingPlan, setIsModifyingPlan] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [pollCount, setPollCount] = useState<number>(0);

  // Logo URL - can be moved to constants if used elsewhere or kept here if specific to App header
  const logoImageUrl = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80";


  const resetState = () => {
    setCurrentDemand(null);
    setCurrentPlan(null);
    setTaskId(null);
    setIsLoadingPlan(false);
    setIsModifyingPlan(false);
    setError(null);
    setPollCount(0);
  };

  const handleSetView = (view: AppView) => {
    if (view === AppView.Home) {
      resetState();
    }
    setCurrentView(view);
  };

  const handleGoHome = () => {
    resetState();
    setCurrentView(AppView.Home);
  }

  const handleNewPlanFromPlanning = () => {
    resetState();
    setCurrentView(AppView.DemandInput);
  }

  const handleSubmitDemand = useCallback(async (demand: UserDemand) => {
    resetState(); // Reset before starting a new plan
    setCurrentDemand(demand);
    setIsLoadingPlan(true);
    setError(null);
    setCurrentView(AppView.Planning); // Show loading state on PlanningPage

    try {
      const { taskId: newTaskId } = await startPlanningSession(demand);
      setTaskId(newTaskId);
      setPollCount(0); // Reset poll count for new task
    } catch (e: any) {
      setError(e.message || '启动规划会话失败。');
      setIsLoadingPlan(false);
    }
  }, []);

  const handleModifyPlan = useCallback(async (modificationRequest: string) => {
    if (!taskId || !currentPlan) return;
    setIsModifyingPlan(true);
    setError(null);
    try {
      const { success, plan: modifiedPlan, error: modificationError } = await modifyExistingPlan(taskId, currentPlan, modificationRequest);
      if (success && modifiedPlan) {
        setCurrentPlan(modifiedPlan);
      } else {
        setError(modificationError || '修改计划失败。');
      }
    } catch (e: any) {
      setError(e.message || '修改过程中发生意外错误。');
    } finally {
      setIsModifyingPlan(false);
    }
  }, [taskId, currentPlan]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    if (taskId && isLoadingPlan && !currentPlan && pollCount < MAX_POLLS) {
      intervalId = setInterval(async () => {
        try {
          const { success, plan, error: fetchError } = await getPlanningResult(taskId);
          if (success && plan) {
            setCurrentPlan(plan);
            setIsLoadingPlan(false);
            clearInterval(intervalId);
          } else if (fetchError || (!success && !plan)) {
            if (fetchError && !fetchError.toLowerCase().includes("not ready")) { 
                setError(fetchError || '获取计划详情失败。');
                setIsLoadingPlan(false);
                clearInterval(intervalId);
            }
          }
        } catch (e: any) {
          setError(e.message || '轮询计划结果时出错。');
          setIsLoadingPlan(false);
          clearInterval(intervalId);
        }
        setPollCount(prev => prev + 1);
      }, POLLING_INTERVAL);
    } else if (pollCount >= MAX_POLLS && isLoadingPlan) {
      setError('超时：旅行计划生成时间过长。');
      setIsLoadingPlan(false);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [taskId, isLoadingPlan, currentPlan, pollCount]);


  const renderView = () => {
    switch (currentView) {
      case AppView.Home:
        return <HomePage setView={handleSetView} />;
      case AppView.DemandInput:
        return <DemandInputPage onSubmitDemand={handleSubmitDemand} isLoading={isLoadingPlan} />;
      case AppView.Planning:
        return (
          <PlanningPage 
            plan={currentPlan} 
            isLoading={isLoadingPlan && !currentPlan} 
            error={error}
            onModifyPlan={handleModifyPlan}
            isModifying={isModifyingPlan}
          />
        );
      default:
        return <HomePage setView={handleSetView} />;
    }
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
           {currentView === AppView.Planning && (
             <Button 
                size="sm" 
                onClick={handleNewPlanFromPlanning}
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:brightness-110 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-white"
             >
               新计划
             </Button>
           )}
        </div>
      </header> 
      
      {/* Add padding-top to main to account for fixed header height */}
      <main className="pt-16"> 
         {renderView()}
      </main>
    </div>
  );
};

export default App;
