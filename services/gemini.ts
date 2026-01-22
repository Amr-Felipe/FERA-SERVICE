
import { GoogleGenAI } from "@google/genai";
import { AppState } from "../types";

export const askAssistant = async (question: string, state: AppState) => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY não configurada nas variáveis de ambiente da Vercel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const context = {
    totalAreas: state.areas.length,
    productionM2: state.areas.reduce((acc, area) => acc + area.services.reduce((sAcc, s) => sAcc + s.areaM2, 0), 0),
    totalRevenue: state.areas.reduce((acc, area) => acc + area.services.reduce((sAcc, s) => sAcc + s.totalValue, 0), 0),
    cashBalance: state.cashIn.reduce((acc, c) => acc + c.value, 0) - state.cashOut.reduce((acc, c) => acc + c.value, 0),
    lowStockItems: state.inventory.filter(i => i.currentQty <= i.minQty).map(i => i.name),
    goalM2: state.monthlyGoalM2,
    employeesCount: state.employees.length,
    activeEmployees: state.employees.filter(e => e.status === 'active').length,
    productionPerEmployeeRecords: state.productionRecords.length
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é o Diretor de Operações Inteligente de uma empresa de manutenção urbana.
      Você tem acesso aos dados operacionais e financeiros em tempo real.
      
      REGRAS DE NEGÓCIO IMPORTANTES:
      1. Produção de um mês é recebida no mês seguinte.
      2. O recebimento é fatiado: 5º dia útil e dia 15.
      3. Metas são calculadas em m².
      
      DADOS DO SISTEMA:
      ${JSON.stringify(context, null, 2)}
      
      INSTRUÇÃO: Responda em português, de forma profissional, executiva e baseada em dados. Se houver alertas (estoque baixo ou meta longe), mencione-os de forma proativa.
      
      PERGUNTA DO USUÁRIO: ${question}`,
      config: {
        temperature: 0.2,
        maxOutputTokens: 800,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Erro na API Gemini:", error);
    throw error;
  }
};
