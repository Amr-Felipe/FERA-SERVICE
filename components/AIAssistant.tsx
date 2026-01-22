
import React from 'react';
import { AppState } from '../types';
import { askAssistant } from '../services/gemini';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';

interface AIAssistantProps {
  state: AppState;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ state }) => {
  const [messages, setMessages] = React.useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Olá! Sou seu assistente de gestão. Como posso ajudar com os dados de produção, financeiro ou estoque hoje?' }
  ]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await askAssistant(userMessage, state);
      setMessages(prev => [...prev, { role: 'bot', text: response || 'Desculpe, não consegui processar sua pergunta.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Houve um erro ao consultar o assistente. Verifique sua chave de API.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "Resumo da produção mensal",
    "Itens com estoque baixo",
    "Saldo atual em caixa",
    "Progresso da meta de m²"
  ];

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col space-y-4">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-2xl text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
            <Sparkles size={24} />
          </div>
          <h2 className="text-2xl font-bold">Assistente Inteligente</h2>
        </div>
        <p className="text-blue-100 max-w-xl">
          Tire dúvidas sobre sua operação em tempo real. O assistente analisa metragens, valores financeiros e status de almoxarifado automaticamente.
        </p>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border'}`}>
                  {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-100'}`}>
                  {m.text}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 items-center text-slate-400">
                <div className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center">
                  <Loader2 className="animate-spin" size={20} />
                </div>
                <span className="text-xs font-medium italic">Assistente está pensando...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {suggestions.map(s => (
              <button 
                key={s} 
                onClick={() => setInput(s)}
                className="whitespace-nowrap px-4 py-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 text-xs font-bold rounded-full border border-slate-200 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input 
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="Digite sua dúvida aqui..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading}
              className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
