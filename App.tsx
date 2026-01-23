
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
      if (!saved) return INITIAL_STATE;
      
      const parsed = JSON.parse(saved);
      // Garante que novas chaves adicionadas ao sistema (como attendanceRecords) 
      // existam mesmo se o usuário tiver um save antigo no navegador.
      return {
        ...INITIAL_STATE,
        ...parsed,
        attendanceRecords: parsed.attendanceRecords || [],
        employees: parsed.employees || INITIAL_STATE.employees,
        areas: parsed.areas || INITIAL_STATE.areas,
        inventory: parsed.inventory || INITIAL_STATE.inventory,
        cashIn: parsed.cashIn || INITIAL_STATE.cashIn,
        cashOut: parsed.cashOut || INITIAL_STATE.cashOut,
      };
    } catch (e) {
      console.warn("Erro ao restaurar estado. Usando inicial.", e);
      return INITIAL_STATE;
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole] = useState<UserRole>(UserRole.ADMIN);

  useEffect(() => {
    try {
      localStorage.setItem('gestor_urbano_state', JSON.stringify(state));
    } catch (e) {
      console.error("Falha ao salvar estado:", e);
    }
  }, [state]);

  const renderContent = () => {
    const commonProps = { state, setState, setActiveTab };
    switch (activeTab) {
      case 'dashboard': return <Dashboard {...commonProps} />;
      case 'production': return <Production {...commonProps} />;
      case 'finance': return <Finance {...commonProps} />;
      case 'inventory': return <Inventory {...commonProps} />;
      case 'employees': return <Employees {...commonProps} />;
      case 'ai': return <AIAssistant state={state} />;
      case 'settings': return <Settings {...commonProps} />;
      default: return <Dashboard {...commonProps} />;
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
