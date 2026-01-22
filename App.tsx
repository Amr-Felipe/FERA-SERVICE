
import React, { useState, useEffect } from 'react';
import { AppState, UserRole } from './types';
import { INITIAL_STATE } from './constants';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Production from './components/Production';
import Finance from './components/Finance';
import Inventory from './components/Inventory';
import Employees from './components/Employees';
import AIAssistant from './components/AIAssistant';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem('gestor_urbano_state');
      return saved ? JSON.parse(saved) : INITIAL_STATE;
    } catch (e) {
      console.warn("Acesso ao localStorage negado ou corrompido. Usando estado inicial.", e);
      return INITIAL_STATE;
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole] = useState<UserRole>(UserRole.ADMIN);

  useEffect(() => {
    try {
      localStorage.setItem('gestor_urbano_state', JSON.stringify(state));
    } catch (e) {
      console.error("Falha ao salvar estado no localStorage:", e);
    }
  }, [state]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard state={state} setState={setState} />;
      case 'production': return <Production state={state} setState={setState} />;
      case 'finance': return <Finance state={state} setState={setState} />;
      case 'inventory': return <Inventory state={state} setState={setState} />;
      case 'employees': return <Employees state={state} setState={setState} />;
      case 'ai': return <AIAssistant state={state} />;
      case 'settings': return <Settings state={state} setState={setState} />;
      default: return <Dashboard state={state} setState={setState} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      userRole={userRole}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
