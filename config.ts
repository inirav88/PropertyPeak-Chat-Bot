
export const DEFAULT_CONFIG = {
  identity: {
    name: "PropAI Solutions",
    shortName: "PropAI",
    logoIcon: "fa-house-chimney-window",
    primaryColor: "emerald",
    supportEmail: "hello@propai.com"
  },
  api: {
    provider: "gemini" as "gemini" | "openai" | "grok" | "llama" | "deepseek" | "custom",
    aiEnabled: false,
    geminiKey: "",
    openaiKey: "",
    openaiOrg: "",
    grokKey: "",
    llamaKey: "",
    llamaBaseUrl: "http://localhost:11434/v1",
    deepseekKey: "",
    maxTokens: 2048,
    temperatureModifier: 0.0,
    customBaseUrl: "",
    customKey: "",
    modelName: "gemini-3-flash-preview",
    temperature: 0.7,
    topP: 0.95
  },
  meta: {
    phoneNumberId: "",
    wabaId: "",
    accessToken: "",
    testRecipient: "", 
    webhookVerifyToken: "propai_secure_v1",
    apiVersion: "v21.0"
  },
  automation: {
    googleSheetsEnabled: false,
    sheetsEndpoint: "",
    lastSync: null as string | null
  },
  chatFlow: [
    { 
      id: 'greeting', 
      step: 'Service Selection', 
      message: 'Welcome to PropAI Solutions. How can we help you today?', 
      type: 'selection', 
      options: ['Buy', 'Rent', 'Sell', 'Loan'] 
    },
    { 
      id: 'loan_type', 
      step: 'Loan Category', 
      message: 'What type of loan are you looking for?', 
      type: 'selection', 
      options: ['Home Loan', 'Loan Against Property', 'Construction Loan', 'Plot Loan', '🔙 Go Back'] 
    },
    { 
      id: 'category_selection', 
      step: 'Property Category', 
      message: 'What type of property are you interested in?', 
      type: 'selection', 
      options: ['Residential', 'Commercial', '🔙 Go Back'] 
    },
    { 
      id: 'commercial_type', 
      step: 'Commercial Type', 
      message: 'Please select the specific commercial category:', 
      type: 'selection', 
      options: ['Office', 'Shop/Retail', 'Warehouse', 'Showroom', '🔙 Go Back'] 
    },
    { 
      id: 'residential_type', 
      step: 'Residential Type', 
      message: 'Please select the specific residential category:', 
      type: 'selection', 
      options: ['Flat/Apartment', 'House/Villa', 'Plot/Land', 'Penthouse', '🔙 Go Back'] 
    },
    { 
      id: 'location_input', 
      step: 'Location Preference', 
      message: 'Which area or city? (Type "back" to return)', 
      type: 'input' 
    },
    { 
      id: 'furnishing_selection', 
      step: 'Furnishing Status', 
      message: 'What are your furnishing requirements?', 
      type: 'selection', 
      options: ['Fully Furnished', 'Semi Furnished', 'Unfurnished', 'Negotiable', '🔙 Go Back'] 
    },
    { 
      id: 'budget_selection', 
      step: 'Budget Range', 
      message: 'Select your budget range:', 
      type: 'selection', 
      options: ['Under ₹50 Lacs', '₹50 Lacs - ₹1 Cr', '₹1 Cr - ₹3 Cr', 'Above ₹3 Cr', '🔙 Go Back'] 
    },
    { 
      id: 'final_step', 
      step: 'Lead Captured', 
      message: 'Thank you! We have received your request. An agent will contact you shortly. Anything else we should know?', 
      type: 'input' 
    }
  ],
  agents: [
    { id: 'a1', name: 'Vikram Mehta', role: 'Commercial Lead', specialty: 'Corporate Office & Retail Portfolio', active: true, image: '' },
    { id: 'a2', name: 'Sarah Chen', role: 'Residential Head', specialty: 'Premium Housing Assets', active: false, image: '' }
  ],
  activeAgentId: 'a1',
  propertyTypes: [
    { id: '1', name: 'Corporate Office', icon: 'fa-building', active: true },
    { id: '2', name: 'Retail Space', icon: 'fa-shop', active: true },
    { id: '3', name: 'Logistics', icon: 'fa-warehouse', active: true },
    { id: '4', name: 'Showroom', icon: 'fa-store', active: true }
  ],
  persona: {
    welcomeMessage: "Hi! I am your PropAI assistant. I can help you find, sell or rent properties easily.",
    tone: "Professional, Helpful, Efficient",
    systemPrompt: "You are a Real Estate Assistant. Help users find properties by asking for their requirements (Buy/Rent, Residential/Commercial, Location, Budget)."
  }
};
