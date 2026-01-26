
import { GoogleGenAI } from "@google/genai";
import { AppState } from "../types";

export const askAssistant = async (history: { role: 'user' | 'bot'; text: string }[], state: AppState) => {
  // Inicialização obrigatória via process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Compilação exaustiva do contexto operacional para suporte à decisão
  const context = {
    totalAreas: state.areas.length,
    activeOS: state.areas.filter(a => !a.endDate).length,
    productionM2: state.areas.reduce((acc, area) => acc + area.services.reduce((sAcc, s) => sAcc + s.areaM2, 0), 0),
    totalRevenue: state.areas.reduce((acc, area) => acc + area.services.reduce((sAcc, s) => sAcc + s.totalValue, 0), 0),
    cashBalance: state.cashIn.reduce((acc, c) => acc + c.value, 0) - state.cashOut.reduce((acc, c) => acc + c.value, 0),
    lowStockItems: state.inventory.filter(i => i.currentQty <= i.minQty).map(i => `${i.name} (${i.currentQty}/${i.minQty})`),
    goalM2: state.monthlyGoalM2,
    activeEmployees: state.employees.filter(e => e.status === 'active').length,
    serviceRates: state.serviceRates
  };

  const contents = history.map(msg => ({
    role: msg.role === 'bot' ? 'model' : 'user',
    parts: [{ text: msg.text }]
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: contents,
      config: {
        systemInstruction: `Você é o Fera Bot, o Consultor de Operações de Elite da Fera Service.
        
        CONTEXTO ATUAL DO SISTEMA: ${JSON.stringify(context)}.
        
        SUAS DIRETRIZES:
        1. PERSONALIDADE: Você é direto, analítico e focado em eficiência operacional.
        2. ANÁLISE DE DADOS: Sempre que perguntado sobre estoque, produção ou finanças, use os números reais do contexto acima.
        3. INSIGHTS: Se identificar que a produção está abaixo de 50% da meta mensal (R$ ${context.goalM2}), sugira proativamente aumentar o ritmo.
        4. ESTOQUE: Alerte se houver itens críticos no estoque (${context.lowStockItems.length} itens).
        5. FORMATO: Use Markdown para estruturar respostas complexas. Use negrito para valores monetários R$.
        
        Não peça a chave de API ao usuário. Responda apenas em Português do Brasil.`,
        temperature: 0.3,
        maxOutputTokens: 2048,
        thinkingConfig: { thinkingBudget: 1536 }
      }
    });

    return response.text;
  } catch (error) {
    console.error("Erro crítico no Fera Bot:", error);
    return "Tive um problema ao processar seus dados operacionais. Por favor, verifique sua conexão ou tente novamente em instantes.";
  }
};
