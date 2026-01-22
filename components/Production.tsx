
import React from 'react';
import { Area, Service, AppState, ServiceType } from '../types';
import { Plus, Trash2, MapPin, CheckCircle2, Clock, RotateCcw, LayoutGrid, AlertCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import { SERVICE_OPTIONS } from '../constants';

interface ProductionProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

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

  const handleAddArea = () => {
    if (!newArea.name || !newArea.startReference) {
      alert("Por favor, preencha o número da O.S. e o ponto de início.");
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
    const confirmMessage = "⚠️ Encerrar esta O.S.? Bloqueia edições e registra no faturamento.";
    if (window.confirm(confirmMessage)) {
      const endDate = prompt("Data de conclusão:", new Date().toISOString().split('T')[0]);
      if (endDate) {
        setState(prev => ({
          ...prev,
          areas: prev.areas.map(a => a.id === areaId ? { ...a, endDate } : a)
        }));
      }
    }
  };

  const reopenArea = (areaId: string) => {
    if (window.confirm("🔄 Reabrir O.S. para edições?")) {
      setState(prev => ({
        ...prev,
        areas: prev.areas.map(a => a.id === areaId ? { ...a, endDate: undefined } : a)
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
      totalValue: 0
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
              updated.totalValue = (updated.areaM2 || 0) * (updated.unitValue || 0);
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
    <div className="space-y-4 pb-20 max-w-full overflow-hidden">
      {/* Header Reduzido */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">O.S. Urbanas</h2>
          <p className="text-[10px] md:text-xs text-slate-500 font-medium">Controle de produção.</p>
        </div>
        <button 
          onClick={() => setIsAddingArea(true)}
          className="bg-blue-600 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-xl font-black uppercase text-[10px] tracking-wider flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md active:scale-95"
        >
          <Plus size={16} strokeWidth={3} />
          <span className="hidden sm:inline">Nova O.S.</span>
          <span className="sm:hidden">Abrir</span>
        </button>
      </div>

      {/* Filtros Compactos */}
      <div className="flex bg-slate-200/50 p-1 rounded-2xl w-fit border border-slate-200">
        <button 
          onClick={() => setActiveFilter('open')}
          className={`px-4 md:px-6 py-1.5 md:py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${activeFilter === 'open' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
        >
          <Clock size={12} /> Aberta
        </button>
        <button 
          onClick={() => setActiveFilter('closed')}
          className={`px-4 md:px-6 py-1.5 md:py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${activeFilter === 'closed' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
        >
          <CheckCircle2 size={12} /> Fim
        </button>
        <button 
          onClick={() => setActiveFilter('all')}
          className={`px-4 md:px-6 py-1.5 md:py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${activeFilter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
        >
          <LayoutGrid size={12} /> Ver Todas
        </button>
      </div>

      {isAddingArea && (
        <div className="bg-white p-4 md:p-6 rounded-3xl border-2 border-blue-500/10 shadow-xl space-y-4 animate-in zoom-in-95">
          <h3 className="font-black text-sm text-slate-800 uppercase flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center"><Plus size={18} /></div>
            Abertura de O.S.
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase px-1">Nº O.S.</label>
              <input 
                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 focus:border-blue-500 outline-none" 
                placeholder="Ex: OS-001" 
                value={newArea.name} onChange={e => setNewArea({...newArea, name: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase px-1">Início</label>
              <input 
                type="date" className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-bold bg-slate-50" 
                value={newArea.startDate} onChange={e => setNewArea({...newArea, startDate: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50" 
                placeholder="Logradouro/Início..." 
                value={newArea.startReference} onChange={e => setNewArea({...newArea, startReference: e.target.value})}
              />
              <input 
                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50" 
                placeholder="Ponto Final..." 
                value={newArea.endReference} onChange={e => setNewArea({...newArea, endReference: e.target.value})}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setIsAddingArea(false)} className="px-4 py-2 text-[10px] font-black uppercase text-slate-400">Sair</button>
            <button onClick={handleAddArea} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-md">Criar O.S.</button>
          </div>
        </div>
      )}

      {/* Lista de O.S. Compacta */}
      <div className="grid grid-cols-1 gap-4">
        {filteredAreas.length === 0 && (
          <div className="bg-white py-16 rounded-[40px] border-2 border-dashed border-slate-100 text-center">
            <AlertCircle className="mx-auto text-slate-200 mb-2" size={32} />
            <p className="text-slate-300 font-black text-xs uppercase">Sem registros</p>
          </div>
        )}
        
        {filteredAreas.map(area => (
          <div key={area.id} className={`bg-white rounded-3xl shadow-sm border ${area.endDate ? 'border-emerald-100' : 'border-slate-100'} transition-all hover:shadow-md overflow-hidden`}>
            {/* Cabeçalho do Card */}
            <div className={`px-4 py-4 md:px-6 md:py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${area.endDate ? 'bg-emerald-50/20' : 'bg-slate-50/10'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 md:w-12 md:h-12 ${area.endDate ? 'bg-emerald-500' : 'bg-blue-600'} text-white rounded-2xl flex items-center justify-center shadow-md shrink-0`}>
                  {area.endDate ? <CheckCircle2 size={20} /> : <MapPin size={20} />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm md:text-base font-black text-slate-800 uppercase truncate">{area.name}</h3>
                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${area.endDate ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                      {area.endDate ? 'Fim' : 'Ativa'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase truncate max-w-[150px] md:max-w-xs">{area.startReference} ➜ {area.endReference}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                <div className="text-right">
                  <p className="text-[8px] uppercase font-black text-slate-400 leading-none">Total O.S.</p>
                  <p className="text-sm md:text-base font-black text-slate-800">
                    R$ {area.services.reduce((acc, s) => acc + s.totalValue, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                {area.endDate ? (
                  <button onClick={() => reopenArea(area.id)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"><RotateCcw size={16} /></button>
                ) : (
                  <button onClick={() => finalizeArea(area.id)} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-wider hover:bg-emerald-700 transition-colors shadow-sm">Encerrar</button>
                )}
              </div>
            </div>

            {/* Listagem de Serviços na O.S. */}
            <div className="p-3 md:p-5 space-y-2 border-t border-slate-50 bg-white">
              {area.services.map(service => (
                <div key={service.id} className="grid grid-cols-4 md:grid-cols-6 gap-2 items-center bg-slate-50/50 p-2 md:p-3 rounded-xl border border-slate-100 hover:bg-white transition-all group">
                  <div className="col-span-2 md:col-span-2 min-w-0">
                    <label className="text-[7px] uppercase font-black text-slate-400 block mb-0.5 px-0.5">Serviço</label>
                    <select 
                      disabled={!!area.endDate}
                      className="w-full bg-transparent text-[10px] font-black text-slate-700 focus:outline-none appearance-none"
                      value={service.type}
                      onChange={e => updateService(area.id, service.id, 'type', e.target.value)}
                    >
                      {SERVICE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="text-[7px] uppercase font-black text-slate-400 block mb-0.5 px-0.5 text-center">Med.</label>
                    <input 
                      disabled={!!area.endDate}
                      type="number" 
                      className="w-full bg-transparent text-[10px] font-black text-center focus:outline-none"
                      value={service.areaM2}
                      onChange={e => updateService(area.id, service.id, 'areaM2', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="hidden md:block col-span-1">
                    <label className="text-[7px] uppercase font-black text-slate-400 block mb-0.5 px-0.5 text-center">R$/Un</label>
                    <p className="text-[10px] font-bold text-slate-400 text-center">R${service.unitValue.toFixed(2)}</p>
                  </div>
                  <div className="col-span-1 text-right md:text-center">
                    <label className="text-[7px] uppercase font-black text-slate-400 block mb-0.5 px-0.5">Total</label>
                    <p className="text-[10px] font-black text-blue-600">R$ {service.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}</p>
                  </div>
                  <div className="hidden md:flex justify-end">
                    {!area.endDate && (
                      <button 
                        onClick={() => setState(prev => ({
                          ...prev,
                          areas: prev.areas.map(a => a.id === area.id ? { ...a, services: a.services.filter(s => s.id !== service.id) } : a)
                        }))}
                        className="p-1.5 text-slate-300 hover:text-red-500 rounded-md transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {!area.endDate && (
                <button 
                  onClick={() => handleAddService(area.id)}
                  className="w-full py-2 border-2 border-dashed border-slate-100 rounded-xl text-slate-300 font-black text-[9px] hover:border-blue-200 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  <Plus size={14} /> Adicionar Item
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Production;
