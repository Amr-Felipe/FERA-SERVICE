
import React from 'react';
import { AppState, InventoryItem } from '../types';
import { Package, Plus, Minus, Search, ArrowRightLeft } from 'lucide-react';

interface InventoryProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const Inventory: React.FC<InventoryProps> = ({ state, setState }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredItems = state.inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const registerExit = (itemId: string, qty: number) => {
    setState(prev => ({
      ...prev,
      inventory: prev.inventory.map(i => 
        i.id === itemId ? { ...i, currentQty: Math.max(0, i.currentQty - qty) } : i
      ),
      inventoryExits: [
        ...prev.inventoryExits,
        {
          id: Math.random().toString(36).substr(2, 9),
          itemId,
          quantity: qty,
          date: new Date().toISOString().split('T')[0],
          destination: 'Operação Diária',
          observation: 'Saída manual'
        }
      ]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Almoxarifado</h2>
          <p className="text-slate-500">Controle de insumos, peças e EPIs.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-64"
              placeholder="Buscar item..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all">
            <Plus size={20} /> Novo Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div key={item.id} className={`bg-white p-6 rounded-2xl border ${item.currentQty <= item.minQty ? 'border-amber-200 shadow-amber-100 shadow-lg' : 'border-slate-100'} transition-all`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${item.currentQty <= item.minQty ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                <Package size={24} />
              </div>
              {item.currentQty <= item.minQty && (
                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] uppercase font-bold rounded-lg animate-pulse">
                  Estoque Baixo
                </span>
              )}
            </div>
            
            <h3 className="text-lg font-bold text-slate-800">{item.name}</h3>
            <p className="text-xs text-slate-400 uppercase font-bold mb-4">{item.category}</p>
            
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl mb-6">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Atual</p>
                <p className="text-xl font-bold text-slate-800">{item.currentQty}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-bold uppercase">Mínimo</p>
                <p className="text-xl font-bold text-slate-400">{item.minQty}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => registerExit(item.id, 1)}
                className="flex items-center justify-center gap-2 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-rose-50 hover:text-rose-600 transition-all text-sm"
              >
                <Minus size={16} /> Saída
              </button>
              <button className="flex items-center justify-center gap-2 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-all text-sm">
                <Plus size={16} /> Entrada
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <ArrowRightLeft size={20} className="text-blue-600" />
            Histórico de Movimentações
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Qtd</th>
                <th className="px-6 py-4">Destino</th>
                <th className="px-6 py-4">Observação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {state.inventoryExits.map(exit => {
                const item = state.inventory.find(i => i.id === exit.itemId);
                return (
                  <tr key={exit.id}>
                    <td className="px-6 py-4">{exit.date}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{item?.name || 'Item Removido'}</td>
                    <td className="px-6 py-4 font-bold text-rose-600">-{exit.quantity}</td>
                    <td className="px-6 py-4">{exit.destination}</td>
                    <td className="px-6 py-4 italic text-slate-400">{exit.observation}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
