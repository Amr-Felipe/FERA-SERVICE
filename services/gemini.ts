
import { GoogleGenAI } from "@google/genai";
import { AppState } from "../types";

export const askAssistant = async (history: { role: 'user' | 'bot'; text: string }[], state: AppState) => {
  // Inicialização segura via variável de ambiente
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const context = {
    totalAreas: state.areas.length,
    productionM2: state.areas.reduce((acc, area) => acc + area.services.reduce((sAcc, s) => sAcc + s.areaM2, 0), 0),
    totalRevenue: state.areas.reduce((acc, area) => acc + area.services.reduce((sAcc, s) => sAcc + s.totalValue, 0), 0),
    cashBalance: state.cashIn.reduce((acc, c) => acc + c.value, 0) - state.cashOut.reduce((acc, c) => acc + c.value, 0),
    lowStockItems: state.inventory.filter(i => i.currentQty <= i.minQty).map(i => i.name),
    goalM2: state.monthlyGoalM2,
    employeesCount: state.employees.length,
    activeEmployees: state.employees.filter(e => e.status === 'active').length,
    attendanceToday: state.attendanceRecords.filter(r => r.date === new Date().toISOString().split('T')[0] && r.status === 'present').length
  };

  // Conversão do histórico para o formato da API Gemini
  const contents = history.map(msg => ({
    role: msg.role === 'bot' ? 'model' : 'user',
    parts: [{ text: msg.text }]
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: contents,
      config: {
        systemInstruction: `Você é o Diretor de Operações Inteligente da Fera Service, empresa líder em manutenção urbana.
      
      SEU CONTEXTO OPERACIONAL EM TEMPO REAL:
      ${JSON.stringify(context, null, 2)}
      
      SUA PERSONALIDADE E REGRAS:
      1. Profissionalismo Executivo: Responda como um consultor sênior de operações.
      2. Foco em Dados: Use números do contexto para embasar suas sugestões.
      3. Proatividade: Se vir que o estoque está baixo ou a meta de m² está longe, alerte o usuário.
      4. Regras Financeiras: Lembre que a produção deste mês é faturada no próximo (5º dia útil e dia 15).
      5. Concisão: Vá direto ao ponto, mas seja educado.
      
      Sempre que mencionar valores monetários, use o formato R$ #.###,##.`,
        temperature: 0.3,
        maxOutputTokens: 1500,
        thinkingConfig: { thinkingBudget: 500 },
      }
    });

    return response.text;
  } catch (error) {
    console.error("Erro na inteligência artificial:", error);
    throw error;
  }
};
