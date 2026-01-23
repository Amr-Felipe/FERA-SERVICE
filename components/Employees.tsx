
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
  
  // Controle de Navegação do Calendário
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

  // Estatísticas Mensais
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
    const existingIdx = state.attendanceRecords.findIndex(r => r.employeeId === empId && r.date === date);
    const employee = state.employees.find(e => e.id === empId);

    if (existingIdx > -1) {
      const record = state.attendanceRecords[existingIdx];
      const nextStatus = record.status === 'present' ? 'absent' : 'present';
      
      setState(prev => {
        const updated = [...prev.attendanceRecords];
        updated[existingIdx] = { 
          ...record, 
          status: nextStatus, 
          value: nextStatus === 'present' ? (employee?.defaultDailyRate || 80) : 0 
        };
        return { ...prev, attendanceRecords: updated };
      });
    } else {
      // Cria novo registro se não existir
      const newRecord: AttendanceRecord = {
        id: Math.random().toString(36).substr(2, 9),
        employeeId: empId,
        date: date,
        status: 'present',
        value: employee?.defaultDailyRate || 80
      };
      setState(prev => ({ ...prev, attendanceRecords: [...prev.attendanceRecords, newRecord] }));
    }
  };

  const updateDailyRateValue = (empId: string, date: string, value: number) => {
    setState(prev => ({
      ...prev,
      attendanceRecords: prev.attendanceRecords.map(r => 
        (r.employeeId === empId && r.date === date) ? { ...r, value } : r
      )
    }));
  };

  const removeAttendanceRecord = (empId: string, date: string) => {
    if(confirm("Remover este registro completamente do histórico?")) {
      setState(prev => ({
        ...prev,
        attendanceRecords: prev.attendanceRecords.filter(r => !(r.employeeId === empId && r.date === date))
      }));
    }
  };

  const exportEmployeeReport = (emp: Employee) => {
    const stats = getEmployeeStats(emp.id, currentMonthStr);
    const records = state.attendanceRecords
      .filter(r => r.employeeId === emp.id && r.date.startsWith(currentMonthStr))
      .sort((a,b) => a.date.localeCompare(b.date));

    const csvContent = [
      ["Relatório de Diárias - " + emp.name],
      ["Mês/Ano: " + currentMonthStr],
      ["Cargo: " + emp.role],
      [""],
      ["Data", "Status", "Valor"],
      ...records.map(r => [r.date, r.status === 'present' ? 'PRESENTE' : 'AUSENTE', r.value.toFixed(2)]),
      [""],
      ["Total Dias Presente", stats.presentDays],
      ["Valor Total Acumulado", stats.totalValue.toFixed(2)]
    ].map(e => e.join(";")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diarias_${emp.name.replace(/\s/g, '_')}_${currentMonthStr}.csv`;
    a.click();
  };

  const filteredEmployees = state.employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-4 pb-24 md:pb-10">
      {/* Header Estilo App */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-none">Gestão de Equipe</h2>
          <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase mt-1">Controle de diárias e frequência</p>
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
          {/* Calendar Header */}
          <div className="p-6 flex items-center justify-between border-b border-slate-50 bg-slate-50/30">
            <button 
              onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1)))}
              className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all active:scale-90"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="text-center">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                {currentCalendarDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
              </h3>
            </div>
            <button 
              onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1)))}
              className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all active:scale-90"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-4 grid grid-cols-7 gap-1 md:gap-3">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="text-center py-2 text-[9px] font-black text-slate-300 uppercase tracking-widest">{d}</div>
            ))}
            
            {/* Espaçamento inicial */}
            {Array.from({ length: new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), 1).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {daysInMonth.map(date => {
              const dStr = date.toISOString().split('T')[0];
              const records = state.attendanceRecords.filter(r => r.date === dStr);
              const presentCount = records.filter(r => r.status === 'present').length;
              const totalCost = records.reduce((acc, r) => acc + (r.status === 'present' ? r.value : 0), 0);
              const isToday = new Date().toISOString().split('T')[0] === dStr;

              return (
                <button 
                  key={dStr}
                  onClick={() => setSelectedDate(dStr)}
                  className={`aspect-square rounded-2xl md:rounded-3xl border flex flex-col items-center justify-center relative transition-all active:scale-90 hover:border-blue-200 group ${isToday ? 'border-blue-600 bg-blue-50/30' : 'border-slate-50 bg-white'}`}
                >
                  <span className={`text-[10px] md:text-sm font-black ${isToday ? 'text-blue-600' : 'text-slate-400'} group-hover:text-blue-600`}>
                    {date.getDate()}
                  </span>
                  
                  {records.length > 0 && (
                    <div className="mt-1 flex flex-col items-center gap-0.5">
                       <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-emerald-500 rounded-full"></div>
                       {totalCost > 0 && <span className="hidden md:block text-[7px] font-black text-emerald-600">R${totalCost}</span>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-4">
             <div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div><span className="text-[9px] font-black text-slate-400 uppercase">Diária Registrada</span></div>
             <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-600 rounded-full"></div><span className="text-[9px] font-black text-slate-400 uppercase">Hoje</span></div>
          </div>
        </div>
      ) : (
        /* Team List View */
        <div className="space-y-4 animate-in fade-in duration-200">
           <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/10 text-xs font-bold"
                  placeholder="Pesquisar funcionário..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <button onClick={() => setShowAddForm(true)} className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 active:scale-90 shadow-md">
                <UserPlus size={20} />
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredEmployees.map(emp => {
                const stats = getEmployeeStats(emp.id, currentMonthStr);
                return (
                  <div key={emp.id} className="bg-white p-5 rounded-[28px] border border-slate-100 hover:shadow-lg transition-all flex flex-col group">
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
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">{emp.name}</h3>
                    <p className="text-[9px] text-slate-400 font-black uppercase mb-4">{emp.role}</p>
                    
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                       <div className="bg-slate-50 p-2 rounded-xl text-center">
                          <p className="text-[7px] font-black text-slate-400 uppercase mb-0.5">Dias Presença</p>
                          <p className="text-xs font-black text-slate-800">{stats.presentDays}d</p>
                       </div>
                       <div className="bg-slate-50 p-2 rounded-xl text-center">
                          <p className="text-[7px] font-black text-slate-400 uppercase mb-0.5">Total Mês</p>
                          <p className="text-xs font-black text-blue-600">R${stats.totalValue}</p>
                       </div>
                    </div>
                    
                    <button 
                      onClick={() => setSelectedEmployeeId(emp.id)}
                      className="mt-4 w-full py-2.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <ClipboardList size={12} /> Ficha Completa
                    </button>
                  </div>
                )
              })}
           </div>
        </div>
      )}

      {/* Modal de Detalhamento do Dia (Calendário) */}
      {selectedDate && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-[32px] sm:rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300">
             <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><CalendarCheck size={20} /></div>
                   <div>
                     <h3 className="text-sm font-black uppercase tracking-widest">{new Date(selectedDate).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                     <p className="text-[10px] text-slate-400 font-bold">Gerenciamento de Presença</p>
                   </div>
                </div>
                <button onClick={() => setSelectedDate(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X size={20} /></button>
             </div>

             <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
                    <p className="text-[7px] font-black text-emerald-400 uppercase">Presentes</p>
                    <p className="text-lg font-black text-emerald-700">{state.attendanceRecords.filter(r => r.date === selectedDate && r.status === 'present').length}</p>
                  </div>
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-center">
                    <p className="text-[7px] font-black text-rose-400 uppercase">Ausentes</p>
                    <p className="text-lg font-black text-rose-700">{state.attendanceRecords.filter(r => r.date === selectedDate && r.status === 'absent').length}</p>
                  </div>
                </div>

                <div className="space-y-2">
                   <h4 className="text-[9px] font-black text-slate-400 uppercase px-1 mb-2">Funcionários Ativos</h4>
                   {state.employees.filter(e => e.status === 'active').map(emp => {
                     const record = state.attendanceRecords.find(r => r.employeeId === emp.id && r.date === selectedDate);
                     return (
                       <div key={emp.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${record?.status === 'present' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50/30 border-slate-100'}`}>
                          <div className="flex items-center gap-3 flex-1">
                             <button 
                               onClick={() => handleToggleAttendance(emp.id, selectedDate)}
                               className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all active:scale-90 ${record?.status === 'present' ? 'bg-emerald-600 text-white' : record?.status === 'absent' ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-400'}`}
                             >
                               {record?.status === 'present' ? <CheckCircle size={18} /> : record?.status === 'absent' ? <XCircle size={18} /> : <AlertCircle size={18} />}
                             </button>
                             <div className="min-w-0">
                               <p className="text-[11px] font-black text-slate-800 leading-none truncate">{emp.name}</p>
                               <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase">{record?.status === 'present' ? 'Confirmado' : record?.status === 'absent' ? 'Falta' : 'Não Lançado'}</p>
                             </div>
                          </div>
                          
                          {record && (
                            <div className="flex items-center gap-2">
                               <div className="text-right">
                                  <label className="text-[7px] font-black text-slate-300 uppercase block">Diária</label>
                                  <input 
                                    type="number" 
                                    className="w-16 bg-white border border-slate-100 rounded-lg py-1 px-2 text-[10px] font-black text-right outline-none focus:border-blue-500"
                                    value={record.value}
                                    onChange={e => updateDailyRateValue(emp.id, selectedDate, parseFloat(e.target.value) || 0)}
                                    disabled={record.status === 'absent'}
                                  />
                               </div>
                               <button onClick={() => removeAttendanceRecord(emp.id, selectedDate)} className="p-1.5 text-slate-200 hover:text-rose-400 transition-colors"><TrashIcon size={14} /></button>
                            </div>
                          )}
                       </div>
                     )
                   })}
                </div>
             </div>

             <div className="p-6 bg-slate-50 border-t border-slate-100">
                <button 
                  onClick={() => setSelectedDate(null)}
                  className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all"
                >
                  Fechar Painel Diário
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Ficha Completa do Funcionário */}
      {selectedEmployeeId && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-lg z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
             {(() => {
               const emp = state.employees.find(e => e.id === selectedEmployeeId);
               if(!emp) return null;
               const stats = getEmployeeStats(emp.id, currentMonthStr);
               const history = state.attendanceRecords
                 .filter(r => r.employeeId === emp.id && r.date.startsWith(currentMonthStr))
                 .sort((a,b) => b.date.localeCompare(a.date));

               return (
                 <>
                   <div className="p-8 bg-blue-600 text-white relative">
                      <button onClick={() => setSelectedEmployeeId(null)} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20"><X size={18} /></button>
                      <div className="flex items-center gap-5">
                         <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center font-black text-2xl backdrop-blur-xl border border-white/30">
                           {emp.name.charAt(0)}
                         </div>
                         <div>
                            <h3 className="text-xl font-black uppercase leading-none tracking-tight">{emp.name}</h3>
                            <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mt-2">{emp.role}</p>
                         </div>
                      </div>
                   </div>

                   <div className="p-6 grid grid-cols-2 gap-4 bg-slate-50 border-b border-slate-100">
                      <div className="bg-white p-4 rounded-[24px] shadow-sm border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Presenças Mês</p>
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center"><CalendarCheck size={18} /></div>
                           <p className="text-xl font-black text-slate-800">{stats.presentDays} <span className="text-[10px] text-slate-400">dias</span></p>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-[24px] shadow-sm border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Acumulado</p>
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center"><DollarSign size={18} /></div>
                           <p className="text-xl font-black text-slate-800">R${stats.totalValue.toLocaleString('pt-BR')}</p>
                        </div>
                      </div>
                   </div>

                   <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registros de {currentCalendarDate.toLocaleString('pt-BR', { month: 'long' })}</h4>
                        <button 
                          onClick={() => exportEmployeeReport(emp)}
                          className="flex items-center gap-2 text-[9px] font-black text-blue-600 uppercase hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
                        >
                          <Download size={14} /> Exportar
                        </button>
                      </div>

                      {history.length > 0 ? history.map(rec => (
                        <div key={rec.id} className="flex items-center justify-between p-3 border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                           <div className="flex items-center gap-4">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${rec.status === 'present' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                 {rec.status === 'present' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                              </div>
                              <div>
                                <p className="text-xs font-black text-slate-700">{new Date(rec.date).toLocaleDateString('pt-BR')}</p>
                                <p className="text-[8px] font-black uppercase text-slate-400">{rec.status === 'present' ? 'Trabalhado' : 'Ausente'}</p>
                              </div>
                           </div>
                           <p className={`text-xs font-black ${rec.status === 'present' ? 'text-slate-800' : 'text-slate-300 italic'}`}>
                             {rec.status === 'present' ? `R$ ${rec.value.toFixed(2)}` : 'R$ 0,00'}
                           </p>
                        </div>
                      )) : (
                        <div className="py-20 text-center text-slate-300">
                           <History size={40} className="mx-auto opacity-20 mb-2" />
                           <p className="text-[10px] font-black uppercase tracking-widest">Sem movimentação este mês</p>
                        </div>
                      )}
                   </div>

                   <div className="p-6 bg-slate-50 border-t border-slate-100">
                      <button onClick={() => setSelectedEmployeeId(null)} className="w-full py-4 bg-white border border-slate-200 text-slate-800 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm active:scale-95 transition-all">Fechar Ficha</button>
                   </div>
                 </>
               )
             })()}
          </div>
        </div>
      )}

      {/* Form Cadastro (Simplificado) */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[120] flex items-center justify-center p-4">
           <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800 uppercase">Novo Colaborador</h3>
                <button onClick={() => setShowAddForm(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X /></button>
              </div>
              <div className="space-y-4">
                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block px-1">Nome Completo</label>
                    <input className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-black text-xs outline-none focus:border-blue-500" placeholder="Ex: João Silva" />
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block px-1">Cargo</label>
                        <input className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-black text-xs outline-none focus:border-blue-500" placeholder="Ex: Operador" />
                    </div>
                    <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block px-1">Diária R$</label>
                        <input type="number" className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-black text-xs outline-none focus:border-blue-500" defaultValue="80" />
                    </div>
                 </div>
                 <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg mt-4">Salvar Cadastro</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const TrashIcon = ({ size, className }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);

export default Employees;
