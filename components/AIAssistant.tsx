
import React from 'react';
import { AppState } from '../types';
import { askAssistant } from '../services/gemini';
import { Send, Bot, User, Loader2, Sparkles, RefreshCcw } from 'lucide-react';

interface AIAssistantProps {
  state: AppState;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ state }) => {
  const [messages, setMessages] = React.useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Olá! Sou o Fera Bot, seu consultor de operações. Analisei seus dados agora mesmo e estou pronto para ajudar. O que deseja saber sobre a produção ou finanças?' }
  ]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    const newHistory = [...messages, { role: 'user' as const, text: userMessage }];
    
    setInput('');
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const response = await askAssistant(newHistory, state);
      setMessages(prev => [...prev, { role: 'bot', text: response || 'Não consegui processar os dados agora. Tente em alguns segundos.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Tive uma instabilidade na conexão com o cérebro central. Pode repetir a pergunta?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'bot', text: 'Histórico limpo. Como posso ajudar agora?' }]);
  };

  const suggestions = [
    "Análise de produtividade mensal",
    "Resumo de itens em falta no estoque",
    "Projeção de faturamento para o mês",
    "Status de presença da equipe hoje"
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4 font-sans">
      <div className="bg-slate-900 p-6 md:p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Bot size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/40">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">Fera Bot</h2>
              <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Inteligência Operacional</p>
            </div>
          </div>
          <p className="text-slate-400 text-xs font-bold max-w-xl leading-relaxed">
            Consulte métricas, peça previsões de estoque ou analise a rentabilidade de suas O.S. de forma instantânea.
          </p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
        <div className="px-6 py-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">IA Conectada ao Banco de Dados</span>
          </div>
          <button 
            onClick={clearChat}
            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
            title="Limpar conversa"
          >
            <RefreshCcw size={14} />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
              <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${m.role === 'user' ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-blue-600 border-slate-100'}`}>
                  {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className={`p-5 rounded-3xl text-sm leading-relaxed whitespace-pre-wrap font-medium ${m.role === 'user' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/10' : 'bg-slate-50 text-slate-700 border border-slate-100'}`}>
                  {m.text}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-pulse">
              <div className="flex gap-3 items-center text-slate-400">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <Loader2 className="animate-spin" size={18} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest italic">Processando Big Data...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-slate-100 space-y-6">
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {suggestions.map(s => (
              <button 
                key={s} 
                onClick={() => setInput(s)}
                className="whitespace-nowrap px-5 py-2.5 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-500 text-[10px] font-black uppercase rounded-xl border border-slate-100 transition-all active:scale-95 shadow-sm"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <input 
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-bold text-slate-700 transition-all placeholder:text-slate-400"
              placeholder="Pergunte ao Fera Bot..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20 disabled:opacity-50 active:scale-90"
            >
              <Send size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
