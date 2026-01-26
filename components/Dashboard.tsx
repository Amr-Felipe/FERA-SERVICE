
import React, { useMemo } from 'react';
import { AppState, ServiceType } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { TrendingUp, AlertTriangle, Wallet, Map, Package, Target, Layers } from 'lucide-react';

interface DashboardProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  setActiveTab: (tab: string) => void;
}

const formatMoney = (value: number) => {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2'];

const Dashboard: React.FC<DashboardProps> = ({ state, setState, setActiveTab }) => {
  const totalProductionM2 = state.areas.reduce((acc, area) => 
    acc + area.services.reduce((sAcc, s) => sAcc + s.areaM2, 0), 0
  );
  
  const totalProductionValue = state.areas.reduce((acc, area) => 
    acc + area.services.reduce((sAcc, s) => sAcc + s.totalValue, 0), 0
  );

  const cashIn = state.cashIn.reduce((acc, c) => acc + c.value, 0);
  const cashOut = state.cashOut.reduce((acc, c) => acc + c.value, 0);
  const currentBalance = cashIn - cashOut;

  const progressPercent = Math.min((totalProductionM2 / state.monthlyGoalM2) * 100, 100);
  const lowStock = state.inventory.filter(i => i.currentQty <= i.minQty);

  // Agregação de produção por tipo de serviço
  const productionByType = useMemo(() => {
    const totals: Record<string, number> = {};
    state.areas.forEach(area => {
      area.services.forEach(s => {
        totals[s.type] = (totals[s.type] || 0) + s.areaM2;
      });
    });
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [state.areas]);

  const stats = [
    { label: 'Produção (m²)', value: totalProductionM2.toLocaleString('pt-BR'), icon: Map, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Faturamento (R$)', value: formatMoney(totalProductionValue), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Saldo (R$)', value: formatMoney(currentBalance), icon: Wallet, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Alertas Estoque', value: lowStock.length, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const updateGoal = () => {
    const newGoal = prompt("Defina a nova meta mensal em m²:", state.monthlyGoalM2.toString());
    if (newGoal && !isNaN(parseFloat(newGoal))) {
      setState(prev => ({ ...prev, monthlyGoalM2: parseFloat(newGoal) }));
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight uppercase">Painel Executivo</h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium">Gestão inteligente de manutenção urbana.</p>
        </div>
        <button 
          onClick={updateGoal}
          className="bg-white border-2 border-slate-100 p-3 md:p-4 rounded-3xl flex items-center gap-3 hover:border-blue-400 active:scale-95 transition-all shadow-sm w-full md:w-auto"
        >
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Target size={20} /></div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">Meta Mensal</p>
            <p className="text-sm font-black text-slate-800">{state.monthlyGoalM2.toLocaleString('pt-BR')} m²</p>
          </div>
        </button>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-start justify-between hover:shadow-md transition-shadow gap-3 group">
            <div>
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-lg md:text-2xl font-black text-slate-800 mt-1 md:mt-2 leading-none">{stat.value}</p>
            </div>
            <div className={`p-3 md:p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-sm group-hover:scale-110 transition-transform self-start`}>
              <stat.icon size={20} className="md:w-6 md:h-6" strokeWidth={2.5} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[40px] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg md:text-xl font-black text-slate-800 flex items-center gap-2">
                <Target size={20} className="text-blue-600" /> Progresso da Meta
              </h3>
              <p className="text-xs text-slate-400 font-medium">Desempenho volumétrico consolidado.</p>
            </div>
            <div className="text-right">
               <span className="text-3xl md:text-4xl font-black text-blue-600">{progressPercent.toFixed(1)}%</span>
            </div>
          </div>

          <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Executado', valor: totalProductionM2, fill: '#2563eb' },
                { name: 'Meta Restante', valor: Math.max(0, state.monthlyGoalM2 - totalProductionM2), fill: '#f1f5f9' }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }}
                />
                <Bar dataKey="valor" radius={[12, 12, 12, 12]} barSize={60}>
                   { [0, 1].map((entry, index) => <Cell key={`cell-${index}`} fill={index === 0 ? '#2563eb' : '#f1f5f9'} />) }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-4">
             <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100">
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Realizado</p>
                <p className="text-xl font-black text-blue-700 mt-1">{totalProductionM2.toLocaleString('pt-BR')} m²</p>
             </div>
             <div className="p-5 bg-slate-50/50 rounded-3xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Saldo Restante</p>
                <p className="text-xl font-black text-slate-700 mt-1">{Math.max(0, state.monthlyGoalM2 - totalProductionM2).toLocaleString('pt-BR')} m²</p>
             </div>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
             <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Layers size={22} /></div>
             <h3 className="text-lg md:text-xl font-black text-slate-800">Mix de Produção</h3>
          </div>
          
          <div className="flex-1 h-64 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productionByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {productionByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${value.toLocaleString()} m²`, 'Volume']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-4">
            {productionByType.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-[10px] font-black uppercase tracking-tight">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-slate-500 truncate max-w-[120px]">{item.name}</span>
                </div>
                <span className="text-slate-800">{item.value.toLocaleString()} m²</span>
              </div>
            ))}
            {productionByType.length === 0 && <p className="text-center text-slate-300 text-[10px] font-black py-4 uppercase">Nenhuma produção registrada</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
