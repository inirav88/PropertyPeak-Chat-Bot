
import { GoogleGenAI } from "@google/genai";

// Use the correct GoogleGenAI initialization and generateContent parameters
export const getBotResponse = async (userMessage: string, history: any[], customConfig?: any) => {
  if (customConfig?.api?.aiEnabled === false) return "__OFFLINE_FLOW__";

  const apiKey = customConfig?.api?.geminiKey || process.env.API_KEY || '';
  
  if (!apiKey) {
    return { error: true, code: 'MISSING_KEY', message: "AI Studio API Key is missing in System Settings." };
  }

  // Always use { apiKey: ... } named parameter
  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    const activeAgent = customConfig?.agents?.find((a: any) => a.id === customConfig.activeAgentId) || customConfig?.agents?.[0];
    
    // Call generateContent directly on ai.models
    const response = await ai.models.generateContent({
      model: customConfig?.api?.modelName || 'gemini-3-flash-preview',
      contents: [
        { 
          parts: [
            { text: `SYSTEM INSTRUCTION: You are a "Button-Only" Real Estate Assistant for PropAI.
                  
                  CORE RULES:
                  1. NEVER ask open questions. Always provide options.
                  2. Use specific Gandhinagar area buttons: [Sector 1-15, Sector 16-30, InfoCity, Rapat Road].
                  3. Use specific configurations: [1BHK, 2BHK, 3BHK, 4BHK, Penthouse, PG].
                  4. Commercial options: [Office Space, Retail Shop, Warehouse, Showroom].
                  5. Loan options: [Salaried, Self-Employed, NRI].
                  6. Every response must end with [OPTIONS: Option 1, Option 2, BACK, HOME].
                  
                  TONE: Professional, Brief, Helpful.
                  CONTEXT: You represent ${activeAgent?.name || 'our agency'}.` },
            ...history.map(h => ({ text: h.text })),
            { text: userMessage }
          ]
        }
      ],
      config: { 
        temperature: 0.1, 
        topP: 0.95 
      }
    });

    // Access .text property directly as a property, do not call as a function
    const responseText = response.text;

    if (!responseText) {
      throw new Error("Empty response from AI");
    }

    return responseText;
  } catch (error: any) {
    console.error("AI Error:", error);
    
    // Categorize common Gemini errors
    if (error.message?.includes('403') || error.message?.includes('API_KEY_INVALID')) {
      return { error: true, code: 'AUTH_ERROR', message: "Invalid API Key. Please check your credentials." };
    }
    if (error.message?.includes('429')) {
      return { error: true, code: 'QUOTA_EXCEEDED', message: "AI rate limit reached. Please wait a moment." };
    }
    if (error.message?.includes('safety')) {
      return { error: true, code: 'SAFETY_BLOCK', message: "Message blocked by safety filters." };
    }

    return "__OFFLINE_FLOW__";
  }
};
