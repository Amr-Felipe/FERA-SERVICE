
import React from 'react';
import { AppState, InventoryItem } from '../types';
import { Package, Plus, Minus, Search, ArrowRightLeft, X } from 'lucide-react';

interface InventoryProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const Inventory: React.FC<InventoryProps> = ({ state, setState }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newItem, setNewItem] = React.useState<Partial<InventoryItem>>({
    name: '',
    category: 'insumos',
    currentQty: 0,
    minQty: 0,
    unitValue: 0
  });

  const filteredItems = state.inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const registerMovement = (itemId: string, qty: number, type: 'in' | 'out') => {
    setState(prev => ({
      ...prev,
      inventory: prev.inventory.map(i => {
        if (i.id !== itemId) return i;
        const newQty = type === 'in' ? i.currentQty + qty : Math.max(0, i.currentQty - qty);
        return { ...i, currentQty: newQty };
      }),
      inventoryExits: [
        ...prev.inventoryExits,
        {
          id: Math.random().toString(36).substr(2, 9),
          itemId,
          quantity: qty,
          date: new Date().toISOString().split('T')[0],
          destination: type === 'in' ? 'Reposição' : 'Operação Diária',
          observation: type === 'in' ? 'Entrada manual' : 'Saída manual'
        }
      ]
    }));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name) return;
    
    const item: InventoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItem.name!,
      category: newItem.category as any,
      currentQty: newItem.currentQty || 0,
      minQty: newItem.minQty || 0,
      unitValue: newItem.unitValue
    };

    setState(prev => ({ ...prev, inventory: [...prev.inventory, item] }));
    setShowAddForm(false);
    setNewItem({ name: '', category: 'insumos', currentQty: 0, minQty: 0, unitValue: 0 });
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">Almoxarifado</h2>
          <p className="text-xs text-slate-500 font-medium">Controle de insumos e ferramentas.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64 text-sm font-medium"
              placeholder="Buscar item..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-900/10"
          >
            <Plus size={18} strokeWidth={3} /> Novo Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredItems.map(item => (
          <div key={item.id} className={`bg-white p-5 md:p-6 rounded-[24px] border-2 ${item.currentQty <= item.minQty ? 'border-amber-100 shadow-amber-50 shadow-lg' : 'border-slate-50'} transition-all hover:border-blue-200`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${item.currentQty <= item.minQty ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'}`}>
                <Package size={22} />
              </div>
              {item.currentQty <= item.minQty && (
                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[9px] uppercase font-black rounded-lg animate-pulse tracking-widest">
                  Crítico
                </span>
              )}
            </div>
            
            <h3 className="text-lg font-black text-slate-800 leading-tight mb-1">{item.name}</h3>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.1em] mb-4">{item.category}</p>
            
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100/50">
              <div>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Atual</p>
                <p className="text-xl font-black text-slate-800 leading-none mt-1">{item.currentQty}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Mínimo</p>
                <p className="text-xl font-black text-slate-400 leading-none mt-1">{item.minQty}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => {
                  const q = prompt("Quantidade de SAÍDA:", "1");
                  if (q && !isNaN(parseInt(q))) registerMovement(item.id, parseInt(q), 'out');
                }}
                className="flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-600 rounded-xl font-black uppercase text-[10px] hover:bg-rose-50 hover:text-rose-600 active:scale-95 transition-all tracking-widest"
              >
                <Minus size={14} strokeWidth={3} /> Saída
              </button>
              <button 
                onClick={() => {
                  const q = prompt("Quantidade de ENTRADA:", "1");
                  if (q && !isNaN(parseInt(q))) registerMovement(item.id, parseInt(q), 'in');
                }}
                className="flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-600 rounded-xl font-black uppercase text-[10px] hover:bg-emerald-50 hover:text-emerald-600 active:scale-95 transition-all tracking-widest"
              >
                <Plus size={14} strokeWidth={3} /> Entrada
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Novo Item de Estoque</h3>
              <button onClick={() => setShowAddForm(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all"><X /></button>
            </div>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Produto</label>
                <input required className="w-full border-2 border-slate-50 p-4 rounded-xl font-bold focus:border-blue-500 outline-none bg-slate-50" placeholder="Ex: Fio de Nylon" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qtd Inicial</label>
                  <input type="number" className="w-full border-2 border-slate-50 p-4 rounded-xl font-bold bg-slate-50" value={newItem.currentQty} onChange={e => setNewItem({...newItem, currentQty: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qtd Mínima</label>
                  <input type="number" className="w-full border-2 border-slate-50 p-4 rounded-xl font-bold bg-slate-50" value={newItem.minQty} onChange={e => setNewItem({...newItem, minQty: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</label>
                <select className="w-full border-2 border-slate-50 p-4 rounded-xl font-bold bg-slate-50 appearance-none" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value as any})}>
                  <option value="peças">Peças</option>
                  <option value="insumos">Insumos</option>
                  <option value="EPIs">EPIs</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-all mt-4">Salvar Item</button>
            </form>
          </div>
        </div>
      )}

      <div className="mt-8 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <h3 className="font-black text-sm text-slate-800 flex items-center gap-2 uppercase tracking-tight">
            <ArrowRightLeft size={18} className="text-blue-600" /> Histórico de Movimentações
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[9px] uppercase text-slate-400 font-black border-b border-slate-100 tracking-widest">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Qtd</th>
                <th className="px-6 py-4">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
              {state.inventoryExits.slice(-10).reverse().map(exit => {
                const item = state.inventory.find(i => i.id === exit.itemId);
                const isOut = exit.destination !== 'Reposição';
                return (
                  <tr key={exit.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 whitespace-nowrap">{exit.date}</td>
                    <td className="px-6 py-4 font-black text-slate-800 uppercase tracking-tight">{item?.name || 'Item Removido'}</td>
                    <td className={`px-6 py-4 font-black ${isOut ? 'text-rose-600' : 'text-emerald-600'}`}>{isOut ? '-' : '+'}{exit.quantity}</td>
                    <td className="px-6 py-4 italic text-slate-400">{exit.destination}</td>
                  </tr>
                );
              })}
              {state.inventoryExits.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-300 font-bold uppercase tracking-wider">Sem movimentações recentes</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
