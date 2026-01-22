
import React from 'react';
import { Area, Service, AppState, ServiceType } from '../types';
import { Plus, Trash2, MapPin, CheckCircle2, Clock, RotateCcw, LayoutGrid, AlertCircle, AlertTriangle } from 'lucide-react';
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
    // Alerta de confirmação solicitado pelo usuário
    const confirmMessage = "⚠️ ATENÇÃO: Deseja realmente ENCERRAR esta O.S.?\n\nIsso bloqueará edições e registrará o valor total no faturamento do mês.";
    if (window.confirm(confirmMessage)) {
      const endDate = prompt("Confirme a data de conclusão (AAAA-MM-DD):", new Date().toISOString().split('T')[0]);
      if (endDate) {
        setState(prev => ({
          ...prev,
          areas: prev.areas.map(a => a.id === areaId ? { ...a, endDate } : a)
        }));
      }
    }
  };

  const reopenArea = (areaId: string) => {
    const confirmMessage = "🔄 REABRIR O.S.: Deseja habilitar esta O.S. para edições ou retrabalho?\n\nA data de encerramento anterior será removida.";
    if (window.confirm(confirmMessage)) {
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
            if (field === 'type') {
              updated.unitValue = state.serviceRates[value as ServiceType] || 0;
            }
            if (field === 'areaM2' || field === 'unitValue' || field === 'type') {
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
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Gestão de O.S.</h2>
          <p className="text-slate-500 font-medium">Controle de produção urbana e medições.</p>
        </div>
        <button 
          onClick={() => setIsAddingArea(true)}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20 active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          Abrir Nova O.S.
        </button>
      </div>

      {/* Navegação de Status */}
      <div className="flex bg-slate-200/50 p-1.5 rounded-3xl w-fit border border-slate-200">
        <button 
          onClick={() => setActiveFilter('open')}
          className={`px-8 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeFilter === 'open' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Clock size={16} /> Em Execução
        </button>
        <button 
          onClick={() => setActiveFilter('closed')}
          className={`px-8 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeFilter === 'closed' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <CheckCircle2 size={16} /> Finalizadas
        </button>
        <button 
          onClick={() => setActiveFilter('all')}
          className={`px-8 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeFilter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <LayoutGrid size={16} /> Mostrar Todas
        </button>
      </div>

      {isAddingArea && (
        <div className="bg-white p-8 rounded-[40px] border-4 border-blue-500/10 shadow-2xl space-y-8 animate-in zoom-in-95">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Plus size={28} strokeWidth={3} />
            </div>
            <div>
              <h3 className="font-black text-2xl text-slate-800 uppercase tracking-tight">Nova Ordem de Serviço</h3>
              <p className="text-slate-500 font-medium italic">Inicie o registro de um novo logradouro ou trecho.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nº Controle da O.S.</label>
              <input 
                className="w-full border-2 border-slate-100 p-5 rounded-2xl focus:border-blue-500 outline-none transition-all font-black text-slate-700 bg-slate-50" 
                placeholder="Ex: OS-2024-00X" 
                value={newArea.name} onChange={e => setNewArea({...newArea, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Data de Início</label>
              <input 
                type="date" className="w-full border-2 border-slate-100 p-5 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold bg-slate-50" 
                value={newArea.startDate} onChange={e => setNewArea({...newArea, startDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Ponto Inicial (Escrito)</label>
              <input 
                className="w-full border-2 border-slate-100 p-5 rounded-2xl focus:border-blue-500 outline-none transition-all font-medium bg-slate-50" 
                placeholder="Ex: Trevo de entrada da cidade" 
                value={newArea.startReference} onChange={e => setNewArea({...newArea, startReference: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Ponto Final (Escrito)</label>
              <input 
                className="w-full border-2 border-slate-100 p-5 rounded-2xl focus:border-blue-500 outline-none transition-all font-medium bg-slate-50" 
                placeholder="Ex: Cruzamento com a Av. Central" 
                value={newArea.endReference} onChange={e => setNewArea({...newArea, endReference: e.target.value})}
              />
            </div>
          </div>
          <div className="flex gap-4 justify-end pt-4">
            <button onClick={() => setIsAddingArea(false)} className="px-10 py-4 text-slate-400 font-black uppercase text-xs hover:text-slate-600 transition-all">Cancelar</button>
            <button onClick={handleAddArea} className="bg-slate-900 text-white px-12 py-5 rounded-[24px] font-black uppercase text-sm shadow-2xl hover:bg-slate-800 transition-all tracking-[0.2em]">Criar O.S.</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-10">
        {filteredAreas.length === 0 && (
          <div className="bg-white p-32 rounded-[60px] border-4 border-dashed border-slate-100 text-center">
            <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-8">
               <AlertCircle size={48} />
            </div>
            <p className="text-slate-300 font-black text-xl uppercase tracking-tighter">Nenhum registro encontrado</p>
          </div>
        )}
        
        {filteredAreas.map(area => (
          <div key={area.id} className={`bg-white rounded-[48px] shadow-sm border-2 ${area.endDate ? 'border-emerald-100' : 'border-slate-50'} overflow-hidden transition-all group hover:shadow-2xl hover:shadow-slate-200/50`}>
            <div className={`p-10 ${area.endDate ? 'bg-emerald-50/20' : 'bg-white'} border-b border-slate-50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8`}>
              <div className="flex items-center gap-8">
                <div className={`w-20 h-20 ${area.endDate ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'} rounded-[32px] flex items-center justify-center shadow-2xl transition-transform group-hover:scale-105`}>
                  {area.endDate ? <CheckCircle2 size={36} /> : <MapPin size={36} />}
                </div>
                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">{area.name}</h3>
                    {area.endDate ? (
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] px-4 py-1.5 rounded-full font-black uppercase border border-emerald-200 tracking-widest">Finalizada</span>
                    ) : (
                      <span className="bg-blue-100 text-blue-700 text-[10px] px-4 py-1.5 rounded-full font-black uppercase border border-blue-200 tracking-widest">Em Aberto</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                    <span className="flex items-center gap-2"><Clock size={16} className="text-blue-500" /> Abertura: {area.startDate}</span>
                    {area.endDate && <span className="flex items-center gap-2 text-emerald-600"><CheckCircle2 size={16} /> Conclusão: {area.endDate}</span>}
                    <span className="text-slate-600 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200/50">{area.startReference} ➜ {area.endReference}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-6 w-full xl:w-auto">
                <div className="bg-slate-900 text-white px-10 py-5 rounded-[32px] shadow-2xl text-right w-full sm:w-auto">
                  <p className="text-[10px] uppercase font-black text-slate-500 mb-1 tracking-widest">Produção Acumulada</p>
                  <p className="text-3xl font-black tracking-tighter">
                    R$ {area.services.reduce((acc, s) => acc + s.totalValue, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto">
                  {area.endDate ? (
                    <button 
                      onClick={() => reopenArea(area.id)}
                      className="flex-1 sm:flex-none text-[10px] font-black uppercase tracking-widest bg-amber-500 text-white px-8 py-5 rounded-3xl hover:bg-amber-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-900/10 active:scale-95"
                    >
                      <RotateCcw size={18} /> Reabrir O.S.
                    </button>
                  ) : (
                    <button 
                      onClick={() => finalizeArea(area.id)}
                      className="flex-1 sm:flex-none text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white px-10 py-5 rounded-3xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/10 active:scale-95 flex items-center justify-center gap-2"
                    >
                      Encerrar O.S.
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-10 space-y-6">
              {area.services.length === 0 && !area.endDate && (
                 <div className="py-16 border-4 border-dashed border-slate-50 rounded-[40px] flex flex-col items-center gap-4 text-slate-300">
                    <AlertTriangle size={48} />
                    <p className="font-black text-sm uppercase tracking-[0.2em]">Aguardando lançamento de itens...</p>
                 </div>
              )}
              
              {area.services.map(service => (
                <div key={service.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 items-center bg-slate-50/50 p-8 rounded-[36px] border border-slate-100 group/item hover:border-blue-300 hover:bg-white transition-all">
                  <div className="lg:col-span-2">
                    <label className="text-[9px] uppercase font-black text-slate-400 block mb-3 tracking-widest px-1">Tipo de Serviço</label>
                    <select 
                      disabled={!!area.endDate}
                      className="w-full bg-white border-2 border-slate-100 rounded-2xl p-4 text-sm font-black text-slate-700 disabled:opacity-50 appearance-none shadow-sm focus:border-blue-500 outline-none"
                      value={service.type}
                      onChange={e => updateService(area.id, service.id, 'type', e.target.value)}
                    >
                      {SERVICE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-black text-slate-400 block mb-3 tracking-widest px-1">Medição (m²/KM)</label>
                    <input 
                      disabled={!!area.endDate}
                      type="number" 
                      className="w-full bg-white border-2 border-slate-100 rounded-2xl p-4 text-sm font-black disabled:opacity-50 shadow-sm focus:border-blue-500 outline-none"
                      value={service.areaM2}
                      onChange={e => updateService(area.id, service.id, 'areaM2', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-black text-slate-400 block mb-3 tracking-widest px-1">Tabela R$/Un</label>
                    <div className="p-4 text-sm font-black text-slate-400 bg-slate-100/50 rounded-2xl border border-slate-200/30">
                      R$ {service.unitValue.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-blue-600 p-5 rounded-[24px] shadow-2xl shadow-blue-900/10">
                    <label className="text-[9px] uppercase font-black text-blue-200 block mb-1 tracking-widest">Total Item</label>
                    <p className="text-2xl font-black text-white tracking-tighter">R$ {service.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="flex justify-end">
                    {!area.endDate && (
                      <button 
                        onClick={() => setState(prev => ({
                          ...prev,
                          areas: prev.areas.map(a => a.id === area.id ? { ...a, services: a.services.filter(s => s.id !== service.id) } : a)
                        }))}
                        className="p-5 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all group-hover/item:text-slate-300"
                      >
                        <Trash2 size={24} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {!area.endDate && (
                <button 
                  onClick={() => handleAddService(area.id)}
                  className="w-full py-8 border-4 border-dashed border-slate-100 rounded-[40px] text-slate-300 font-black text-xs hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-4 uppercase tracking-[0.3em]"
                >
                  <Plus size={24} strokeWidth={4} /> Adicionar Item de Serviço à O.S.
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
