
import { GoogleGenAI } from "@google/genai";

export const getBotResponse = async (userMessage: string, history: any[], customConfig?: any) => {
  // If AI is disabled, we return null to let the BotSimulator use its logic
  if (customConfig?.api?.aiEnabled === false) return null;

  const provider = customConfig?.api?.provider || 'gemini';
  
  // Handle Gemini specifically as per system rules
  if (provider === 'gemini') {
    const apiKey = customConfig?.api?.geminiKey || process.env.API_KEY || '';
    if (!apiKey) return null;

    const ai = new GoogleGenAI({ apiKey: apiKey });
    try {
      const activeAgent = customConfig?.agents?.find((a: any) => a.id === customConfig.activeAgentId) || customConfig?.agents?.[0];
      const response = await ai.models.generateContent({
        model: customConfig?.api?.modelName || 'gemini-3-flash-preview',
        contents: [
          { 
            parts: [
              { text: `SYSTEM INSTRUCTION: ${customConfig?.persona?.systemPrompt || 'You are a professional real estate assistant.'}
                    
                    CORE RULES:
                    1. Acknowledge user input.
                    2. Keep it brief and conversational.
                    3. Context: ${activeAgent?.name || 'PropAI Assistant'}.
                    4. Current Chat Flow Context: ${JSON.stringify(customConfig?.chatFlow || [])}` },
              ...history.slice(-5).map(h => ({ text: h.text })),
              { text: userMessage }
            ]
          }
        ],
        config: { 
          temperature: customConfig?.api?.temperature || 0.7, 
          topP: customConfig?.api?.topP || 0.95 
        }
      });

      return response.text || null;
    } catch (error) {
      console.error("Gemini Error:", error);
      return null;
    }
  }

  // Placeholder for other providers (Llama, DeepSeek) in a real implementation
  // For this frontend demo, we fall back to simulation if not using Gemini
  return null;
};
