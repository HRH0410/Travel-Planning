
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePageWrapper from './components/HomePageWrapper';
import DemandInputPageWrapper from './components/DemandInputPageWrapper';
import PlanningPageWrapper from './components/PlanningPageWrapper';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePageWrapper />} />
          <Route path="/demand-input" element={<DemandInputPageWrapper />} />
          <Route path="/planning" element={<PlanningPageWrapper />} />
          <Route path="/planning/:taskId" element={<PlanningPageWrapper />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
