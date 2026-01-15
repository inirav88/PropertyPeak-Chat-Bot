
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getBotResponse = async (userMessage: string, history: any[], customConfig?: any) => {
  if (customConfig?.api?.aiEnabled === false) return "__OFFLINE_FLOW__";

  try {
    const activeAgent = customConfig?.agents?.find((a: any) => a.id === customConfig.activeAgentId) || customConfig?.agents?.[0];
    const response = await ai.models.generateContent({
      model: customConfig?.api?.modelName || 'gemini-3-flash-preview',
      contents: [
        { text: `SYSTEM INSTRUCTION: You are a "Button-Only" Real Estate Assistant for PropAI.
                  
                  CORE RULES:
                  1. NEVER ask open questions. Always provide options.
                  2. Use specific Gandhinagar area buttons: [Sector 1-15, Sector 16-30, InfoCity, Rapat Road].
                  3. Use specific configurations: [1BHK, 2BHK, 3BHK, 4BHK, Penthouse, PG].
                  4. Commercial options: [Office Space, Retail Shop, Warehouse, Showroom].
                  5. Loan options: [Salaried, Self-Employed, NRI].
                  6. Every response must end with [OPTIONS: Option 1, Option 2, BACK, HOME].
                  
                  TONE: Professional, Brief, Helpful.
                  CONTEXT: You represent ${activeAgent.name}.` },
        ...history,
        { text: userMessage }
      ],
      config: { temperature: 0.1, topP: 0.95 }
    });
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "__OFFLINE_FLOW__";
  }
};
