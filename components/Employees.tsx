
import React from 'react';
import { AppState, Employee } from '../types';
import { Users, UserPlus, ToggleLeft, ToggleRight, Search } from 'lucide-react';

interface EmployeesProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const Employees: React.FC<EmployeesProps> = ({ state, setState }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const toggleStatus = (id: string) => {
    setState(prev => ({
      ...prev,
      employees: prev.employees.map(e => 
        e.id === id ? { ...e, status: e.status === 'active' ? 'inactive' : 'active' } : e
      )
    }));
  };

  const filtered = state.employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Funcionários</h2>
          <p className="text-slate-500">Controle de pessoal e vínculos de produção.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 w-64"
              placeholder="Filtrar por nome..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all">
            <UserPlus size={20} /> Novo Funcionário
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(emp => (
          <div key={emp.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg ${emp.status === 'active' ? 'bg-blue-500' : 'bg-slate-300'}`}>
                {emp.name.charAt(0)}
              </div>
              <button 
                onClick={() => toggleStatus(emp.id)}
                className={`flex items-center gap-2 text-xs font-bold uppercase transition-all ${emp.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`}
              >
                {emp.status === 'active' ? 'Ativo' : 'Inativo'}
                {emp.status === 'active' ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800">{emp.name}</h3>
            <p className="text-sm text-slate-500 mb-6">{emp.role}</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-t pt-3 uppercase">
                <span>Prod. Realizada</span>
                <span className="text-slate-700">R$ 0,00</span>
              </div>
              <button className="w-full py-2 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all">
                Ver Ficha Completa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Employees;
