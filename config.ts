
export const DEFAULT_CONFIG = {
  identity: {
    name: "PropAI Solutions",
    shortName: "PropAI",
    logoIcon: "fa-house-chimney-window",
    primaryColor: "emerald",
    supportEmail: "hello@propai.com"
  },
  api: {
    provider: "gemini" as "gemini" | "openai" | "grok" | "custom",
    aiEnabled: true,
    geminiKey: "",
    openaiKey: "",
    openaiOrg: "",
    grokKey: "",
    maxTokens: 2048,
    temperatureModifier: 0.0,
    customBaseUrl: "",
    customKey: "",
    modelName: "gemini-3-flash-preview",
    temperature: 0.7,
    topP: 0.95
  },
  meta: {
    phoneNumberId: "", // <--- Place Phone Number ID here
    wabaId: "",        // <--- Place WhatsApp Business Account ID here
    accessToken: "",   // <--- Place Permanent Access Token here
    webhookVerifyToken: "propai_secure_v1",
    apiVersion: "v21.0"
  },
  automation: {
    googleSheetsEnabled: false,
    sheetsEndpoint: "",
    lastSync: null as string | null
  },
  chatFlow: [
    { id: 'f1', step: 'Greeting', message: 'Welcome to PropAI. Do you want to Buy, Rent, or Sell a property?', type: 'selection' },
    { id: 'f2', step: 'Category', message: 'Are you interested in Residential or Commercial properties?', type: 'selection' },
    { id: 'f3', step: 'Configuration', message: 'What type of configuration are you looking for?', type: 'selection' },
    { id: 'f4', step: 'Location', message: 'Which city or area are you targeting for your move?', type: 'selection' },
    { id: 'f5', step: 'Timeline', message: 'How soon are you looking to move?', type: 'selection' },
    { id: 'f6', step: 'Final Note', message: 'Please provide any other specific requirements (Budget, floor, facing) so I can help better.', type: 'input' }
  ],
  agents: [
    { id: 'a1', name: 'Vikram Mehta', role: 'Senior Consultant', specialty: 'Residential & Commercial Specialist', active: true, image: '' },
    { id: 'a2', name: 'Sarah Chen', role: 'Commercial Lead', specialty: 'Industrial & Retail Spaces', active: false, image: '' }
  ],
  activeAgentId: 'a1',
  propertyTypes: [
    { id: '1', name: 'Residential', icon: 'fa-house', active: true },
    { id: '2', name: 'Commercial', icon: 'fa-building-columns', active: true },
    { id: '3', name: 'Industrial', icon: 'fa-industry', active: true },
    { id: '4', name: 'Plot/Land', icon: 'fa-map-location-dot', active: true }
  ],
  persona: {
    welcomeMessage: "Hello! I am your PropAI assistant. Whether you're looking to Buy, Sell, or Rent residential or commercial properties, I'm here to assist you with a smart, streamlined experience.",
    tone: "Highly Professional, Intelligent, Disciplined",
    systemPrompt: "You are a Smart Real Estate Intake & Qualification Expert. You handle BUY, SELL, RENT for RESIDENTIAL & COMMERCIAL. Use your intelligence to qualify leads and detect timelines, but strictly adhere to NO PRICING and NO UNSOLICITED SUGGESTIONS policies."
  }
};
