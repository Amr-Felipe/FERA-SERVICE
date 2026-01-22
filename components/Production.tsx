
import React from 'react';
import { Area, Service, AppState, ServiceType, Employee } from '../types';
import { Plus, Trash2, MapPin, Users, Info } from 'lucide-react';
import { SERVICE_OPTIONS } from '../constants';

interface ProductionProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const Production: React.FC<ProductionProps> = ({ state, setState }) => {
  const [isAddingArea, setIsAddingArea] = React.useState(false);
  const [newArea, setNewArea] = React.useState<Partial<Area>>({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    startReference: '',
    endReference: '',
    observations: '',
    services: []
  });

  const handleAddArea = () => {
    if (!newArea.name) return;
    const area: Area = {
      id: Math.random().toString(36).substr(2, 9),
      name: newArea.name!,
      startDate: newArea.startDate!,
      startReference: newArea.startReference!,
      endReference: newArea.endReference!,
      observations: newArea.observations!,
      services: []
    };
    setState(prev => ({ ...prev, areas: [...prev.areas, area] }));
    setIsAddingArea(false);
    setNewArea({ name: '', startDate: '', startReference: '', endReference: '', observations: '', services: [] });
  };

  const handleAddService = (areaId: string) => {
    const service: Service = {
      id: Math.random().toString(36).substr(2, 9),
      areaId,
      type: ServiceType.CORTE_COSTAL,
      areaM2: 0,
      unitValue: 0,
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
            if (field === 'areaM2' || field === 'unitValue') {
              updated.totalValue = (updated.areaM2 || 0) * (updated.unitValue || 0);
            }
            return updated;
          })
        };
      })
    }));
  };

  // Vínculo de funcionário à produção (Simulação simplificada para o registro de produção)
  const assignEmployeeToService = (serviceId: string, employeeId: string) => {
    const service = state.areas.flatMap(a => a.services).find(s => s.id === serviceId);
    if (!service) return;

    setState(prev => ({
      ...prev,
      productionRecords: [
        ...prev.productionRecords,
        {
          id: Math.random().toString(36).substr(2, 9),
          employeeId,
          serviceId,
          associatedValue: service.totalValue,
          date: new Date().toISOString().split('T')[0]
        }
      ]
    }));
    alert('Produção vinculada ao funcionário com sucesso!');
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Controle de Produção</h2>
          <p className="text-slate-500">Gestão de áreas e metragens por serviço.</p>
        </div>
        <button 
          onClick={() => setIsAddingArea(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
        >
          <Plus size={20} />
          Nova Área
        </button>
      </div>

      {isAddingArea && (
        <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-lg text-slate-800">Cadastrar Nova Área de Trabalho</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Nome do Local</label>
              <input 
                className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Ex: Av. das Palmeiras" 
                value={newArea.name} onChange={e => setNewArea({...newArea, name: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Data Início</label>
              <input 
                type="date" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                value={newArea.startDate} onChange={e => setNewArea({...newArea, startDate: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Ponto Inicial (Ref)</label>
              <input 
                className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Início do trecho" 
                value={newArea.startReference} onChange={e => setNewArea({...newArea, startReference: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Ponto Final (Ref)</label>
              <input 
                className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Fim do trecho" 
                value={newArea.endReference} onChange={e => setNewArea({...newArea, endReference: e.target.value})}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <button onClick={() => setIsAddingArea(false)} className="px-6 py-2 text-slate-500 font-bold">Cancelar</button>
            <button onClick={handleAddArea} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200">Salvar Área</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {state.areas.length === 0 && (
          <div className="bg-white p-20 rounded-3xl border border-dashed border-slate-200 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
               <MapPin size={40} className="text-slate-300" />
            </div>
            <p className="text-slate-400 font-medium">Nenhuma área registrada. Comece criando uma área de trabalho.</p>
          </div>
        )}
        
        {state.areas.map(area => (
          <div key={area.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:shadow-md">
            <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/40">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">{area.name}</h3>
                  <div className="flex items-center gap-3 text-slate-400 text-xs font-medium mt-1">
                    <span>{area.startDate}</span>
                    <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                    <span>{area.startReference} ➜ {area.endReference}</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-800/50 px-6 py-3 rounded-2xl border border-slate-700">
                <p className="text-[10px] uppercase font-bold text-slate-500">Valor Estimado da Área</p>
                <p className="text-2xl font-bold text-blue-400">
                  R$ {area.services.reduce((acc, s) => acc + s.totalValue, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="p-8">
              <div className="space-y-6">
                {area.services.map(service => (
                  <div key={service.id} className="group relative">
                    <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 items-center bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all">
                      <div className="lg:col-span-2">
                        <label className="text-[10px] uppercase font-black text-slate-400 block mb-2">Tipo de Serviço</label>
                        <select 
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-700"
                          value={service.type}
                          onChange={e => updateService(area.id, service.id, 'type', e.target.value)}
                        >
                          {SERVICE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-black text-slate-400 block mb-2">Metragem (m²)</label>
                        <input 
                          type="number" className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold"
                          value={service.areaM2}
                          onChange={e => updateService(area.id, service.id, 'areaM2', parseFloat(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-black text-slate-400 block mb-2">Valor/m²</label>
                        <input 
                          type="number" className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-emerald-600"
                          value={service.unitValue}
                          onChange={e => updateService(area.id, service.id, 'unitValue', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="bg-white/50 p-3 rounded-xl border border-dashed border-slate-200">
                        <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Total</label>
                        <p className="text-lg font-black text-slate-900">R$ {service.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="flex justify-end gap-2">
                         <div className="relative group/tooltip">
                            <button 
                              onClick={() => {
                                const empId = prompt("Digite o ID do funcionário ou selecione da lista (Simulação)");
                                if(empId) assignEmployeeToService(service.id, empId);
                              }}
                              className="p-3 bg-white text-slate-400 hover:text-blue-600 border border-slate-200 rounded-xl transition-all shadow-sm"
                            >
                              <Users size={18} />
                            </button>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap">Vincular Funcionário</span>
                         </div>
                        <button 
                          onClick={() => setState(prev => ({
                            ...prev,
                            areas: prev.areas.map(a => a.id === area.id ? { ...a, services: a.services.filter(s => s.id !== service.id) } : a)
                          }))}
                          className="p-3 bg-white text-slate-400 hover:text-red-500 border border-slate-200 rounded-xl transition-all shadow-sm"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => handleAddService(area.id)}
                  className="w-full py-5 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-3"
                >
                  <Plus size={20} /> Adicionar Serviço nesta Área
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Production;
