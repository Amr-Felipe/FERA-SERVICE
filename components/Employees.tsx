
import React, { useState, useMemo } from 'react';
import { AppState, Employee, AttendanceRecord } from '../types';
import { 
  Users, 
  UserPlus, 
  ToggleLeft, 
  ToggleRight, 
  Search, 
  X, 
  CalendarCheck, 
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  ClipboardList,
  DollarSign,
  TrendingUp,
  History,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface EmployeesProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const Employees: React.FC<EmployeesProps> = ({ state, setState }) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [newEmployee, setNewEmployee] = useState({ name: '', role: '', rate: '80' });
  
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [currentCalendarDate]);

  const currentMonthStr = currentCalendarDate.toISOString().substring(0, 7);
  
  const getEmployeeStats = (employeeId: string, monthStr: string) => {
    const records = (state.attendanceRecords || []).filter(r => 
      r.employeeId === employeeId && r.date.startsWith(monthStr)
    );
    const presentDays = records.filter(r => r.status === 'present').length;
    const totalValue = records.reduce((acc, r) => acc + (r.status === 'present' ? r.value : 0), 0);
    return { presentDays, totalValue, totalRecords: records.length };
  };

  const handleToggleAttendance = (empId: string, date: string) => {
    const records = state.attendanceRecords || [];
    const existingIdx = records.findIndex(r => r.employeeId === empId && r.date === date);
    const employee = state.employees.find(e => e.id === empId);

    if (existingIdx > -1) {
      const record = records[existingIdx];
      const nextStatus = record.status === 'present' ? 'absent' : 'present';
      
      setState(prev => {
        const updated = [...(prev.attendanceRecords || [])];
        updated[existingIdx] = { 
          ...record, 
          status: nextStatus, 
          value: nextStatus === 'present' ? (employee?.defaultDailyRate || 80) : 0 
        };
        return { ...prev, attendanceRecords: updated };
      });
    } else {
      const newRecord: AttendanceRecord = {
        id: Math.random().toString(36).substr(2, 9),
        employeeId: empId,
        date: date,
        status: 'present',
        value: employee?.defaultDailyRate || 80
      };
      setState(prev => ({ ...prev, attendanceRecords: [...(prev.attendanceRecords || []), newRecord] }));
    }
  };

  const updateDailyRateValue = (empId: string, date: string, value: number) => {
    setState(prev => ({
      ...prev,
      attendanceRecords: (prev.attendanceRecords || []).map(r => 
        (r.employeeId === empId && r.date === date) ? { ...r, value } : r
      )
    }));
  };

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.role) return;
    const emp: Employee = {
      id: Math.random().toString(36).substr(2, 9),
      name: newEmployee.name,
      role: newEmployee.role,
      status: 'active',
      defaultDailyRate: parseFloat(newEmployee.rate) || 80
    };
    setState(prev => ({ ...prev, employees: [...prev.employees, emp] }));
    setShowAddForm(false);
    setNewEmployee({ name: '', role: '', rate: '80' });
  };

  const filteredEmployees = (state.employees || []).filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-4 pb-24 md:pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-none">Gestão de Equipe</h2>
          <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase mt-1">Calendário de presenças e diárias</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-2xl w-full md:w-auto">
          <button 
            onClick={() => setViewMode('calendar')}
            className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
          >
            <CalendarIcon size={14} /> Calendário
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
          >
            <Users size={14} /> Equipe
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-6 flex items-center justify-between border-b border-slate-50 bg-slate-50/30">
            <button 
              onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1)))}
              className="p-2 hover:bg-white rounded-xl text-slate-400"
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
              {currentCalendarDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
            </h3>
            <button 
              onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1)))}
              className="p-2 hover:bg-white rounded-xl text-slate-400"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="p-4 grid grid-cols-7 gap-1 md:gap-3">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="text-center py-2 text-[9px] font-black text-slate-300 uppercase">{d}</div>
            ))}
            {Array.from({ length: new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), 1).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {daysInMonth.map(date => {
              const dStr = date.toISOString().split('T')[0];
              const records = (state.attendanceRecords || []).filter(r => r.date === dStr);
              const totalCost = records.reduce((acc, r) => acc + (r.status === 'present' ? r.value : 0), 0);
              const isToday = new Date().toISOString().split('T')[0] === dStr;

              return (
                <button 
                  key={dStr}
                  onClick={() => setSelectedDate(dStr)}
                  className={`aspect-square rounded-2xl md:rounded-3xl border flex flex-col items-center justify-center relative transition-all active:scale-90 hover:border-blue-200 group ${isToday ? 'border-blue-600 bg-blue-50/30' : 'border-slate-50 bg-white'}`}
                >
                  <span className={`text-[10px] md:text-sm font-black ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>{date.getDate()}</span>
                  {records.length > 0 && <div className="mt-1 w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
           <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/10"
                  placeholder="Pesquisar funcionário..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <button onClick={() => setShowAddForm(true)} className="bg-blue-600 text-white p-3 rounded-2xl shadow-md"><UserPlus size={20} /></button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredEmployees.map(emp => {
                const stats = getEmployeeStats(emp.id, currentMonthStr);
                return (
                  <div key={emp.id} className="bg-white p-5 rounded-[28px] border border-slate-100 flex flex-col group shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg ${emp.status === 'active' ? 'bg-blue-600' : 'bg-slate-200'}`}>
                         {emp.name.charAt(0)}
                       </div>
                       <button onClick={() => {
                          setState(prev => ({
                            ...prev,
                            employees: prev.employees.map(e => e.id === emp.id ? {...e, status: e.status === 'active' ? 'inactive' : 'active'} : e)
                          }));
                       }}>
                         {emp.status === 'active' ? <ToggleRight className="text-emerald-500" size={28} /> : <ToggleLeft className="text-slate-200" size={28} />}
                       </button>
                    </div>
                    <h3 className="text-sm font-black text-slate-800 uppercase">{emp.name}</h3>
                    <p className="text-[9px] text-slate-400 font-black uppercase mb-4">{emp.role}</p>
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                       <div className="bg-slate-50 p-2 rounded-xl text-center">
                          <p className="text-[7px] font-black text-slate-400 uppercase">Dias</p>
                          <p className="text-xs font-black text-slate-800">{stats.presentDays}d</p>
                       </div>
                       <div className="bg-slate-50 p-2 rounded-xl text-center">
                          <p className="text-[7px] font-black text-slate-400 uppercase">Total</p>
                          <p className="text-xs font-black text-blue-600">R${stats.totalValue}</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => setSelectedEmployeeId(emp.id)}
                      className="mt-4 w-full py-2.5 bg-slate-900 text-white text-[9px] font-black uppercase rounded-xl flex items-center justify-center gap-2"
                    >
                      <ClipboardList size={12} /> Ver Ficha
                    </button>
                  </div>
                )
              })}
           </div>
        </div>
      )}

      {selectedDate && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-[32px] sm:rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
             <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><CalendarCheck size={20} /></div>
                   <h3 className="text-sm font-black uppercase">{new Date(selectedDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</h3>
                </div>
                <button onClick={() => setSelectedDate(null)} className="p-2 bg-white/10 rounded-full"><X size={20} /></button>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {state.employees.filter(e => e.status === 'active').map(emp => {
                  const record = (state.attendanceRecords || []).find(r => r.employeeId === emp.id && r.date === selectedDate);
                  return (
                    <div key={emp.id} className={`flex items-center justify-between p-3 rounded-2xl border ${record?.status === 'present' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50/30 border-slate-100'}`}>
                       <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleToggleAttendance(emp.id, selectedDate)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${record?.status === 'present' ? 'bg-emerald-600 text-white' : record?.status === 'absent' ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-400'}`}
                          >
                            {record?.status === 'present' ? <CheckCircle size={18} /> : record?.status === 'absent' ? <XCircle size={18} /> : <AlertCircle size={18} />}
                          </button>
                          <div>
                            <p className="text-[11px] font-black text-slate-800 leading-none">{emp.name}</p>
                            <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase">{record?.status || 'Não Registrado'}</p>
                          </div>
                       </div>
                       {record && record.status === 'present' && (
                         <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              className="w-16 bg-white border border-slate-100 rounded-lg py-1 px-2 text-[10px] font-black text-right"
                              value={record.value}
                              onChange={e => updateDailyRateValue(emp.id, selectedDate, parseFloat(e.target.value) || 0)}
                            />
                         </div>
                       )}
                    </div>
                  )
                })}
             </div>
             <div className="p-6 bg-slate-50 border-t">
                <button onClick={() => setSelectedDate(null)} className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-black uppercase text-[10px]">Fechar</button>
             </div>
          </div>
        </div>
      )}

      {selectedEmployeeId && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-lg z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
             {(() => {
               const emp = state.employees.find(e => e.id === selectedEmployeeId);
               if(!emp) return null;
               const history = (state.attendanceRecords || []).filter(r => r.employeeId === emp.id && r.date.startsWith(currentMonthStr));
               return (
                 <>
                   <div className="p-8 bg-blue-600 text-white flex justify-between items-center">
                      <h3 className="text-xl font-black uppercase">{emp.name}</h3>
                      <button onClick={() => setSelectedEmployeeId(null)} className="p-2 bg-white/10 rounded-full"><X size={18} /></button>
                   </div>
                   <div className="flex-1 overflow-y-auto p-6 space-y-3">
                      {history.map(rec => (
                        <div key={rec.id} className="flex items-center justify-between p-3 border-b border-slate-50">
                           <p className="text-xs font-black text-slate-700">{new Date(rec.date).toLocaleDateString('pt-BR')}</p>
                           <p className={`text-xs font-black ${rec.status === 'present' ? 'text-emerald-600' : 'text-rose-400'}`}>
                             {rec.status === 'present' ? `R$ ${rec.value.toFixed(2)}` : 'AUSENTE'}
                           </p>
                        </div>
                      ))}
                   </div>
                   <div className="p-6 bg-slate-50">
                      <button onClick={() => setSelectedEmployeeId(null)} className="w-full py-4 bg-white border border-slate-200 text-slate-800 rounded-2xl font-black uppercase text-[10px]">Sair</button>
                   </div>
                 </>
               )
             })()}
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[120] flex items-center justify-center p-4">
           <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl p-8 space-y-6">
              <h3 className="text-lg font-black text-slate-800 uppercase">Novo Colaborador</h3>
              <div className="space-y-4">
                 <input className="w-full bg-slate-50 border p-3 rounded-xl font-black text-xs" placeholder="Nome" value={newEmployee.name} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} />
                 <input className="w-full bg-slate-50 border p-3 rounded-xl font-black text-xs" placeholder="Cargo" value={newEmployee.role} onChange={e => setNewEmployee({...newEmployee, role: e.target.value})} />
                 <input type="number" className="w-full bg-slate-50 border p-3 rounded-xl font-black text-xs" placeholder="Diária" value={newEmployee.rate} onChange={e => setNewEmployee({...newEmployee, rate: e.target.value})} />
                 <button onClick={handleAddEmployee} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px]">Salvar</button>
                 <button onClick={() => setShowAddForm(false)} className="w-full py-2 text-[10px] font-black uppercase text-slate-400">Cancelar</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
