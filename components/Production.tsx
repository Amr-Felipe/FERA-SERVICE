
import React from 'react';
import { Area, Service, AppState, ServiceType } from '../types';
import { Plus, Trash2, CheckCircle2, Clock, RotateCcw, LayoutGrid, AlertCircle } from 'lucide-react';
import { SERVICE_OPTIONS } from '../constants';

interface ProductionProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const formatMoney = (value: number) => {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const Production: React.FC<ProductionProps> = ({ state, setState }) => {
  const [isAddingArea, setIsAddingArea] = React.useState(false);
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'open' | 'closed'>('open');
  const [newArea, setNewArea] = React.useState<Partial<Area>>({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    startReference: '',
    endReference: '',
    observations: '',
    services: []
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return dateStr.split('-').reverse().join('/');
  };

  const handleAddArea = () => {
    if (!newArea.name || !newArea.startReference) {
      alert("Por favor, preencha o Nº da O.S. e o Ponto de Início.");
      return;
    }
    const area: Area = {
      id: Math.random().toString(36).substr(2, 9),
      name: newArea.name!,
      startDate: newArea.startDate!,
      startReference: newArea.startReference!,
      endReference: newArea.endReference || 'Não informado',
      observations: newArea.observations!,
      services: []
    };
    setState(prev => ({ ...prev, areas: [...prev.areas, area] }));
    setIsAddingArea(false);
    setNewArea({ name: '', startDate: new Date().toISOString().split('T')[0], startReference: '', endReference: '', observations: '', services: [] });
  };

  const finalizeArea = (areaId: string) => {
    const endDate = prompt("Data de conclusão:", new Date().toISOString().split('T')[0]);
    if (endDate) {
      setState(prev => ({
        ...prev,
        areas: prev.areas.map(a => a.id === areaId ? { ...a, endDate } : a)
      }));
    }
  };

  const handleAddService = (areaId: string) => {
    const defaultType = ServiceType.CAPINA_MANUAL_M2;
    const currentRate = state.serviceRates[defaultType] || 0;
    const service: Service = {
      id: Math.random().toString(36).substr(2, 9),
      areaId,
      type: defaultType,
      areaM2: 0,
      unitValue: currentRate,
      totalValue: 0,
      serviceDate: new Date().toISOString().split('T')[0]
    };
    setState(prev => ({
      ...prev,
      areas: prev.areas.map(a => a.id === areaId ? { ...a, services: [...a.services, service] } : a)
    }));
  };

  const updateService = (areaId: string, serviceId: string, field: keyof Service, value: any) => {
    setState(prev => ({
      ...prev,
      areas: prev.areas.map(a => {
        if (a.id !== areaId) return a;
        return {
          ...a,
          services: a.services.map(s => {
            if (s.id !== serviceId) return s;
            const updated = { ...s, [field]: value };
            if (field === 'type') updated.unitValue = state.serviceRates[value as ServiceType] || 0;
            if (['areaM2', 'unitValue', 'type'].includes(field)) {
              updated.totalValue = (Number(updated.areaM2) || 0) * (Number(updated.unitValue) || 0);
            }
            return updated;
          })
        };
      })
    }));
  };

  const filteredAreas = state.areas.filter(a => {
    if (activeFilter === 'open') return !a.endDate;
    if (activeFilter === 'closed') return !!a.endDate;
    return true;
  });

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between gap-2 px-1">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">Produção Urbana</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Controle de O.S. e Metragem por Tipo</p>
        </div>
        <button 
          onClick={() => setIsAddingArea(true)}
          className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95 flex items-center gap-2"
        >
          <Plus size={16} strokeWidth={3} /> Nova O.S.
        </button>
      </div>

      <div className="flex bg-slate-200/50 p-1 rounded-2xl w-fit border border-slate-200">
        <button 
          onClick={() => setActiveFilter('open')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeFilter === 'open' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500'}`}
        >
          <Clock size={14} /> Pendentes
        </button>
        <button 
          onClick={() => setActiveFilter('closed')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeFilter === 'closed' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
        >
          <CheckCircle2 size={14} /> Finalizadas
        </button>
      </div>

      {isAddingArea && (
        <div className="bg-white p-6 rounded-[32px] border-2 border-blue-100 shadow-xl space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <Plus className="text-blue-600" size={18} /> Abrir Nova Ordem de Serviço
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs font-black uppercase outline-none focus:ring-4 focus:ring-blue-500/10" 
              placeholder="Número da O.S. (Ex: OS-2024-001)" 
              value={newArea.name} onChange={e => setNewArea({...newArea, name: e.target.value})}
            />
            <input 
              type="date" className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs font-black outline-none" 
              value={newArea.startDate} onChange={e => setNewArea({...newArea, startDate: e.target.value})}
            />
            <input 
              className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs font-black outline-none" 
              placeholder="Ponto de Início (Logradouro/KM)" 
              value={newArea.startReference} onChange={e => setNewArea({...newArea, startReference: e.target.value})}
            />
            <input 
              className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs font-black outline-none" 
              placeholder="Ponto Final (Opcional)" 
              value={newArea.endReference} onChange={e => setNewArea({...newArea, endReference: e.target.value})}
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => setIsAddingArea(false)} className="px-6 py-2 text-[10px] font-black uppercase text-slate-400">Cancelar</button>
            <button onClick={handleAddArea} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-900/10">Criar O.S.</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {filteredAreas.map(area => (
          <div key={area.id} className={`bg-white rounded-[40px] shadow-sm border ${area.endDate ? 'border-emerald-100' : 'border-amber-100'} overflow-hidden transition-all hover:shadow-md`}>
            <div className={`px-6 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${area.endDate ? 'bg-emerald-50/20' : 'bg-amber-50/10'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 ${area.endDate ? 'bg-emerald-600' : 'bg-amber-500'} text-white rounded-[20px] flex items-center justify-center shadow-lg transition-colors`}>
                  {area.endDate ? <CheckCircle2 size={28} /> : <AlertCircle size={28} />}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-black text-slate-800 uppercase leading-none tracking-tight">{area.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${area.endDate ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {area.endDate ? 'Finalizada' : 'Pendente'}
                    </span>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-wider">
                    Início: {formatDate(area.startDate)} • {area.startReference} {area.endReference ? `➜ ${area.endReference}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                  <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Valor da Medição</p>
                  <p className="text-xl font-black text-slate-800">R$ {formatMoney(area.services.reduce((acc, s) => acc + s.totalValue, 0))}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!area.endDate ? (
                    <button onClick={() => finalizeArea(area.id)} className="bg-emerald-600 text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md">Encerrar</button>
                  ) : (
                    <button onClick={() => { if(confirm("Reabrir esta O.S.?")) setState(prev => ({ ...prev, areas: prev.areas.map(a => a.id === area.id ? { ...a, endDate: undefined } : a) })); }} className="p-3 text-amber-600 hover:bg-amber-50 rounded-2xl transition-all"><RotateCcw size={20} /></button>
                  )}
                  <button onClick={() => { if(confirm("Excluir permanentemente esta O.S.?")) setState(prev => ({ ...prev, areas: prev.areas.filter(a => a.id !== area.id) })); }} className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"><Trash2 size={20} /></button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-3 bg-white">
              {area.services.length > 0 && (
                <div className="hidden md:grid grid-cols-7 gap-4 px-4 mb-2">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest col-span-2">Tipo de Serviço</span>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-center">Data Exec.</span>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-center">Medida (m²)</span>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-center">R$ Unid.</span>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-right">Total</span>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-right">Ação</span>
                </div>
              )}

              {area.services.map(service => (
                <div key={service.id} className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center bg-slate-50/40 p-4 rounded-3xl border border-slate-100/50 hover:bg-white transition-all group">
                  <div className="md:col-span-2">
                    <label className="text-[8px] font-black text-slate-400 uppercase block md:hidden mb-1">Serviço</label>
                    <select 
                      disabled={!!area.endDate}
                      className="w-full bg-transparent text-[11px] font-black text-slate-700 uppercase outline-none"
                      value={service.type}
                      onChange={e => updateService(area.id, service.id, 'type', e.target.value)}
                    >
                      {SERVICE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div className="md:col-span-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase block md:hidden mb-1">Data</label>
                    <input 
                      disabled={!!area.endDate}
                      type="date"
                      className="w-full bg-transparent text-[11px] font-black text-slate-700 outline-none text-center"
                      value={service.serviceDate}
                      onChange={e => updateService(area.id, service.id, 'serviceDate', e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase block md:hidden mb-1">Quantidade</label>
                    <input 
                      disabled={!!area.endDate}
                      type="number"
                      className="w-full bg-transparent text-[11px] font-black text-slate-700 outline-none text-center"
                      value={service.areaM2}
                      onChange={e => updateService(area.id, service.id, 'areaM2', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="hidden md:block md:col-span-1 text-center">
                    <span className="text-[10px] font-bold text-slate-400">R$ {formatMoney(service.unitValue)}</span>
                  </div>

                  <div className="md:col-span-1 text-right">
                    <label className="text-[8px] font-black text-slate-400 uppercase block md:hidden mb-1">Total Item</label>
                    <span className="text-xs font-black text-blue-600">R$ {formatMoney(service.totalValue)}</span>
                  </div>

                  <div className="md:col-span-1 flex justify-end">
                    {!area.endDate && (
                      <button 
                        onClick={() => setState(prev => ({
                          ...prev,
                          areas: prev.areas.map(a => a.id === area.id ? { ...a, services: a.services.filter(s => s.id !== service.id) } : a)
                        }))}
                        className="p-2 text-slate-200 hover:text-rose-500 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {!area.endDate && (
                <button 
                  onClick={() => handleAddService(area.id)}
                  className="w-full py-4 border-2 border-dashed border-slate-100 rounded-3xl text-slate-300 font-black text-[10px] uppercase tracking-widest hover:border-blue-200 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-3"
                >
                  <Plus size={18} /> Lançar Nova Produção
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredAreas.length === 0 && (
          <div className="py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
             <LayoutGrid size={48} className="mx-auto text-slate-100 mb-4" />
             <p className="text-slate-300 font-black uppercase text-xs tracking-widest">Nenhuma O.S. encontrada para este filtro</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Production;
