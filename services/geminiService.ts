
import { GoogleGenAI } from "@google/genai";
import { Habit, Task } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const getAICoachAdvice = async (habits: Habit[], tasks: Task[]) => {
  try {
    const habitSummary = habits.map(h => `- ${h.name} (${h.category}): Sequência de ${h.streak} dias`).join('\n');
    const taskSummary = tasks.map(t => `- ${t.title} (Status: ${t.isCompleted ? 'Concluído' : 'Pendente'})`).join('\n');

    const prompt = `
      Atue como um mentor de produtividade chamado 'Dicas da Base'. Aqui está o estado atual dos meus hábitos e tarefas:
      
      HÁBITOS:
      ${habitSummary}
      
      TAREFAS:
      ${taskSummary}
      
      Forneça uma análise motivadora e curta em PORTUGUÊS brasileiro. 
      Sugira um micro-hábito específico.
      REGRA CRÍTICA: Sua resposta completa deve ter NO MÁXIMO 300 CARACTERES (incluindo espaços). 
      Seja direto e impactante.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
      },
    });

    let text = response.text || "";
    // Garantia adicional de corte caso a IA exceda levemente
    if (text.length > 300) {
      text = text.substring(0, 297) + "...";
    }
    
    return text;
  } catch (error) {
    console.error("Erro no Dicas da Base:", error);
    return "Foque no progresso, não na perfeição. Sua base define seu topo.";
  }
};
