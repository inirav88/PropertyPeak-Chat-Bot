
const { GoogleGenAI } = require('@google/genai');
const axios = require('axios');

async function handleAIRequest(userText, history, config) {
  const provider = config.api?.provider || 'gemini';
  const sysPrompt = config.persona?.systemPrompt || "You are a professional Real Estate Assistant.";

  try {
    switch (provider) {
      case 'gemini': return await callGemini(userText, history, config, sysPrompt);
      case 'openai': return await callOpenAI(userText, history, config, sysPrompt);
      case 'deepseek': return await callDeepSeek(userText, history, config, sysPrompt);
      default: return "AI Provider not configured.";
    }
  } catch (err) {
    console.error(`AI Error:`, err.message);
    return "The assistant is temporarily unavailable.";
  }
}

async function callGemini(text, history, config, system) {
  const apiKey = config.api?.geminiKey || process.env.API_KEY;
  if (!apiKey) throw new Error("Gemini Key Missing");

  const ai = new GoogleGenAI({ apiKey });
  
  // New Gemini 3 SDK pattern
  const response = await ai.models.generateContent({
    model: config.api?.modelName || 'gemini-3-flash-preview',
    contents: [
      ...history.map(h => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }]
      })),
      { role: 'user', parts: [{ text: text }] }
    ],
    config: {
      systemInstruction: system,
      temperature: config.api?.temperature || 0.7
    },
  });

  return response.text;
}

async function callOpenAI(text, history, config, system) {
  const apiKey = config.api?.openaiKey;
  const res = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: config.api?.modelName || 'gpt-4o',
    messages: [{ role: 'system', content: system }, ...history, { role: 'user', content: text }]
  }, { headers: { 'Authorization': `Bearer ${apiKey}` } });
  return res.data.choices[0].message.content;
}

async function callDeepSeek(text, history, config, system) {
  const apiKey = config.api?.deepseekKey;
  const res = await axios.post('https://api.deepseek.com/chat/completions', {
    model: config.api?.modelName || 'deepseek-chat',
    messages: [{ role: 'system', content: system }, ...history, { role: 'user', content: text }]
  }, { headers: { 'Authorization': `Bearer ${apiKey}` } });
  return res.data.choices[0].message.content;
}

module.exports = { handleAIRequest };
