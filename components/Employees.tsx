
import React from 'react';
import { AppState, Employee } from '../types';
import { Users, UserPlus, ToggleLeft, ToggleRight, Search, X } from 'lucide-react';

interface EmployeesProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const Employees: React.FC<EmployeesProps> = ({ state, setState }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newEmployee, setNewEmployee] = React.useState({ name: '', role: '' });

  const toggleStatus = (id: string) => {
    setState(prev => ({
      ...prev,
      employees: prev.employees.map(e => 
        e.id === id ? { ...e, status: e.status === 'active' ? 'inactive' : 'active' } : e
      )
    }));
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.role) return;

    const emp: Employee = {
      id: Math.random().toString(36).substr(2, 9),
      name: newEmployee.name,
      role: newEmployee.role,
      status: 'active'
    };

    setState(prev => ({ ...prev, employees: [...prev.employees, emp] }));
    setShowAddForm(false);
    setNewEmployee({ name: '', role: '' });
  };

  const filtered = state.employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">Recursos Humanos</h2>
          <p className="text-xs text-slate-500 font-medium">Gestão de colaboradores e equipes operacionais.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64 text-sm font-medium"
              placeholder="Filtrar por nome..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-900/20"
          >
            <UserPlus size={18} strokeWidth={3} /> Novo Funcionário
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filtered.map(emp => (
          <div key={emp.id} className="bg-white p-6 rounded-[28px] border-2 border-slate-50 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg transition-transform group-hover:scale-105 ${emp.status === 'active' ? 'bg-blue-600 shadow-blue-100' : 'bg-slate-300 shadow-slate-50'}`}>
                {emp.name.charAt(0)}
              </div>
              <button 
                onClick={() => toggleStatus(emp.id)}
                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${emp.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`}
              >
                {emp.status === 'active' ? 'Ativo' : 'Inativo'}
                {emp.status === 'active' ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-slate-200" />}
              </button>
            </div>
            
            <h3 className="text-lg font-black text-slate-800 leading-tight mb-1">{emp.name}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mb-6">{emp.role}</p>
            
            <div className="space-y-3 pt-4 border-t border-slate-50">
              <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>Prod. Acumulada</span>
                <span className="text-slate-800">R$ 0,00</span>
              </div>
              <button className="w-full py-3 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-blue-50 hover:text-blue-600 active:scale-95 transition-all border border-transparent hover:border-blue-100">
                Ver Ficha Completa
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Cadastrar Funcionário</h3>
              <button onClick={() => setShowAddForm(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all"><X /></button>
            </div>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Completo</label>
                <input required className="w-full border-2 border-slate-50 p-4 rounded-xl font-bold focus:border-blue-500 outline-none bg-slate-50" placeholder="Ex: João da Silva" value={newEmployee.name} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargo / Função</label>
                <input required className="w-full border-2 border-slate-50 p-4 rounded-xl font-bold focus:border-blue-500 outline-none bg-slate-50" placeholder="Ex: Operador de Roçadeira" value={newEmployee.role} onChange={e => setNewEmployee({...newEmployee, role: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-all mt-4">Concluir Cadastro</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
