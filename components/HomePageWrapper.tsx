import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomePage as OriginalHomePage } from './HomePage';
import { AppView } from '../types';

const HomePageWrapper: React.FC = () => {
  const navigate = useNavigate();

  const handleSetView = (view: AppView) => {
    if (view === AppView.DemandInput) {
      navigate('/demand-input');
    } else if (view === AppView.Planning) {
      navigate('/planning');
    }
  };

  return <OriginalHomePage setView={handleSetView} />;
};

export default HomePageWrapper;
