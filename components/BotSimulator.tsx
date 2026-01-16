
import React, { useState, useRef, useEffect } from 'react';
import { getBotResponse } from '../services/geminiService';
import { syncLeadToGoogleSheets } from '../services/automationService';

type FlowMessage = {
  role: 'user' | 'model' | 'system';
  text: string;
  buttons?: string[];
  isSummary?: boolean;
  isError?: boolean;
};

const BotSimulator: React.FC<{ config: any }> = ({ config }) => {
  const [messages, setMessages] = useState<FlowMessage[]>([
    { 
      role: 'model', 
      text: "Welcome! I'm your PropAI Assistant. How can I help you today?",
      buttons: ['🏠 BUY PROPERTY', '💰 SELL PROPERTY', '📝 RENT PROPERTY', '🏢 COMMERCIAL', '📊 VALUATION', '🏦 LOAN', '📅 SITE VISIT']
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeAgent = config.agents.find((a: any) => a.id === config.activeAgentId) || config.agents[0];
  const aiEnabled = config.api.aiEnabled;

  const GANDHINAGAR_LOCATIONS = ['Sector 1 to 30', 'Vavol', 'Pethapur', 'Sargasan', 'Kudasan', 'Randesan', 'GIFT City', 'Other', '🔙 BACK'];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Robust State Engine for Offline Mode
  const getStepData = (userInput: string, path: string[]) => {
    const cleanInput = userInput.replace(/[^\w\s]/g, '').trim().toUpperCase();
    const modelMsgs = messages.filter(m => m.role === 'model');
    const lastBotMsg = (modelMsgs[modelMsgs.length - 1]?.text || "").toUpperCase();
    const now = new Date();
    const currentHour = now.getHours();

    const isRentPath = path.some(p => p.toUpperCase().includes('RENT'));

    // 0. Terminal State: Confirmation
    if (cleanInput.includes('CONFIRM') || cleanInput.includes('SEND')) {
      return { 
        text: "✅ SUCCESS! Your enquiry has been logged successfully. Our property expert will call you shortly to discuss the details.", 
        buttons: ['🏠 HOME', '🔄 NEW ENQUIRY'],
        isTerminal: true 
      };
    }

    // 1. Main Menu Routing
    if (path.length === 0 || cleanInput.includes('HOME')) {
      if (cleanInput.includes('BUY')) return { text: "Excellent choice. What type of property are you looking to buy?", buttons: ['🏡 RESIDENTIAL', '🏢 COMMERCIAL', '📍 PLOT/LAND', '🏗️ NEW PROJECTS', '🔙 BACK'] };
      if (cleanInput.includes('SELL')) return { text: "We can help you get the best value. What are you selling?", buttons: ['🏢 APARTMENT', '🏡 HOUSE/VILLA', '📍 PLOT', '🏢 COMMERCIAL', '🔙 BACK'] };
      if (cleanInput.includes('RENT')) return { text: "Looking for a rental? Tell us who it's for:", buttons: ['👨‍👩‍👧‍👦 FAMILY', '👨‍🎓 BACHELOR', '👨‍💼 WORKING PROF.', '🏢 CORPORATE', '🔙 BACK'] };
      if (cleanInput.includes('COMMERCIAL')) return { text: "Select commercial category:", buttons: ['🏢 OFFICE SPACE', '🛍️ RETAIL SHOP', '🏭 WAREHOUSE', '🏨 HOTEL', '🔙 BACK'] };
      if (cleanInput.includes('LOAN')) return { text: "What type of loan do you require?", buttons: ['🏠 HOME LOAN', '💰 LAP', '🏢 COMMERCIAL LOAN', '🔙 BACK'] };
      if (cleanInput.includes('VALUATION')) return { text: "Please provide the Property Address for a free valuation estimate:", buttons: ['🔙 BACK'] };
      if (cleanInput.includes('SITE VISIT')) return { text: "Which project or sector in Gandhinagar would you like to visit?", buttons: GANDHINAGAR_LOCATIONS };
    }

    // 2. Sub-Category Logic (Layer 2)
    if (lastBotMsg.includes('LOOKING TO BUY')) {
      if (cleanInput.includes('RESIDENTIAL')) return { text: "What configuration are you looking for in Residential?", buttons: ['1BHK', '2BHK', '3BHK', '4BHK+', '🔙 BACK'] };
      if (cleanInput.includes('COMMERCIAL')) return { text: "Select commercial type for purchase:", buttons: ['🏢 OFFICE', '🛍️ SHOP', '🏢 SHOWROOM', '🔙 BACK'] };
      if (cleanInput.includes('PLOT')) return { text: "Please specify your preferred plot size (in Sq Yards):", buttons: ['🔙 BACK'] };
    }
    
    if (lastBotMsg.includes('WHAT ARE YOU SELLING')) {
      return { text: "Please provide the Full Address and approximate Area (Sq Ft/Yards) of the property you wish to sell:", buttons: ['🔙 BACK'] };
    }

    if (lastBotMsg.includes('LOOKING FOR A RENTAL')) {
      return { text: "What configuration do you prefer for rent?", buttons: ['1BHK', '2BHK', '3BHK', '4BHK+', '🔙 BACK'] };
    }

    if (lastBotMsg.includes('SELECT COMMERCIAL CATEGORY')) {
      return { text: "What is the approximate size/area required (in Sq Ft)?", buttons: ['< 500', '500-1500', '1500-5000', '5000+', '🔙 BACK'] };
    }

    if (lastBotMsg.includes('TYPE OF LOAN DO YOU REQUIRE')) {
      return { text: "Great. What is your current employment status?", buttons: ['👨‍💼 SALARIED', '🏢 SELF-EMPLOYED', '🌍 NRI', '🔙 BACK'] };
    }

    if (lastBotMsg.includes('EMPLOYMENT STATUS')) {
      return { text: "Understood. Please select the location where you are looking for this loan/property:", buttons: GANDHINAGAR_LOCATIONS };
    }

    // 3. Configuration to Location/Budget Transitions (Layer 3)
    if (lastBotMsg.includes('CONFIGURATION DO YOU PREFER FOR RENT')) {
      return { text: "What is your monthly budget range for rent?", buttons: ['₹5,000 - ₹15,000', '₹15,000 - ₹30,000', '₹30,000 - ₹50,000', '₹50,000+', '🔙 BACK'] };
    }

    const isResidentialConfig = (lastBotMsg.includes('CONFIGURATION') || lastBotMsg.includes('RESIDENTIAL')) && !isRentPath;
    const isCommercialPurchaseType = lastBotMsg.includes('COMMERCIAL TYPE FOR PURCHASE');
    const isCommSizeReq = lastBotMsg.includes('SIZE/AREA REQUIRED');
    const isPlotSizeInput = lastBotMsg.includes('PLOT SIZE (IN SQ YARDS)');
    const isRentBudgetInput = lastBotMsg.includes('BUDGET RANGE FOR RENT');

    if (isResidentialConfig || isCommercialPurchaseType || isCommSizeReq || isPlotSizeInput || isRentBudgetInput) {
      return { text: "Great. Now, please select your preferred locality in Gandhinagar:", buttons: GANDHINAGAR_LOCATIONS };
    }

    // 4. Converging to Timing/Slots (Layer 4)
    const isLocalityInput = ['SECTOR', 'VAVOL', 'PETHAPUR', 'SARGASAN', 'KUDASAN', 'RANDESAN', 'GIFT', 'OTHER'].some(loc => cleanInput.includes(loc));
    const isValuationInput = lastBotMsg.includes('PROPERTY ADDRESS');
    const isSellAddressInput = lastBotMsg.includes('PROPERTY YOU WISH TO SELL');

    if ((lastBotMsg.includes('LOCALITY IN GANDHINAGAR') && isLocalityInput) || 
        (lastBotMsg.includes('LOCATION WHERE YOU ARE LOOKING') && isLocalityInput) ||
        (lastBotMsg.includes('PROJECT OR SECTOR') && isLocalityInput) ||
        isValuationInput || isSellAddressInput) {
      return { 
        text: "Understood. When would you like to schedule a call or site visit with our expert?", 
        buttons: (currentHour < 18 ? ['📅 TODAY', '📅 TOMORROW', '📅 THIS WEEKEND', '🔙 BACK'] : ['📅 TOMORROW', '📅 THIS WEEKEND', '🗓️ NEXT WEEK', '🔙 BACK']) 
      };
    }

    // 5. Timing to Slot (Layer 5)
    if (lastBotMsg.includes('SCHEDULE A CALL') || lastBotMsg.includes('WHEN WOULD YOU LIKE')) {
      return { text: "Perfect. Which time slot works best for you?", buttons: ['🌅 MORNING (10-12)', '☀️ AFTERNOON (2-4)', '🌆 EVENING (5-7)', '🕒 ANYTIME', '🔙 BACK'] };
    }

    // 6. Slot to Contact (Layer 6)
    if (lastBotMsg.includes('TIME SLOT')) {
      return { text: "To assist you better, how should our expert contact you?", buttons: ['📱 WHATSAPP', '📞 PHONE CALL', '📧 EMAIL', '🔙 BACK'] };
    }

    // 7. Summary (Layer 7)
    if (['WHATSAPP', 'PHONE CALL', 'EMAIL'].some(opt => cleanInput.includes(opt))) {
      const summaryItems = Object.values(selections);
      const summary = summaryItems.join(' → ') + ` → ${userInput}`;
      return { 
        text: `📋 ENQUIRY SUMMARY:\n\n${summary}\n\nShall I send this to ${activeAgent.name}?`, 
        buttons: ['✅ CONFIRM & SEND', '✏️ EDIT DETAILS', '🏠 HOME'],
        isSummary: true
      };
    }

    return null;
  };

  const handleSend = async (forcedText?: string) => {
    const textToSend = forcedText || input;
    if (!textToSend.trim() || loading) return;

    const upperText = textToSend.toUpperCase();
    
    // HOME & RESET
    if (['🏠 HOME', '🔄 START OVER', '🏠 NEW ENQUIRY', '✏️ EDIT DETAILS'].some(cmd => upperText.includes(cmd.replace(/[^\w\s]/g, '').toUpperCase()))) {
      setMessages([{ 
        role: 'model', 
        text: "Welcome! I'm your PropAI Assistant. How can I help you today?", 
        buttons: ['🏠 BUY PROPERTY', '💰 SELL PROPERTY', '📝 RENT PROPERTY', '🏢 COMMERCIAL', '📊 VALUATION', '🏦 LOAN', '📅 SITE VISIT'] 
      }]);
      setCurrentPath([]);
      setSelections({});
      setInput('');
      return;
    }

    // ROBUST BACK LOGIC
    if (upperText.includes('BACK')) {
      if (currentPath.length === 0) return;

      const newPath = [...currentPath];
      newPath.pop(); // Remove last user choice
      
      const newSelections = { ...selections };
      delete newSelections[`Step_${currentPath.length}`]; // Clean up selection record
      
      // We go back by 2 bot messages (the one that just happened, and the one before it)
      const modelMsgs = messages.filter(m => m.role === 'model');
      if (modelMsgs.length < 2) {
        // Fallback to home if stack is too shallow
        handleSend('🏠 HOME');
        return;
      }

      // Re-initialize to the state before the last bot message
      const prevBotMsg = modelMsgs[modelMsgs.length - 2];
      
      setMessages(prev => [...prev, 
        { role: 'user', text: '🔙 BACK' },
        { role: 'model', text: prevBotMsg.text, buttons: prevBotMsg.buttons }
      ]);
      
      setCurrentPath(newPath);
      setSelections(newSelections);
      setInput('');
      return;
    }

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setLoading(true);

    const stepKey = `Step_${currentPath.length + 1}`;
    const newSelections = { ...selections, [stepKey]: textToSend };
    setSelections(newSelections);

    const botReply = await getBotResponse(textToSend, messages.map(m => ({ text: m.text })), config);
    
    let cleanText = '';
    let suggestedButtons: string[] = [];
    let isSummary = false;
    let isError = false;

    if (typeof botReply === 'object' && (botReply as any).error) {
      cleanText = `⚠️ SYSTEM NOTICE:\n${(botReply as any).message}\n\nSwitching to offline mode.`;
      suggestedButtons = ['🏠 HOME', '🔙 BACK'];
      isError = true;
    } else if (botReply === "__OFFLINE_FLOW__" || !aiEnabled) {
      const stepData = getStepData(textToSend, currentPath);
      if (stepData) {
        cleanText = stepData.text;
        suggestedButtons = stepData.buttons || [];
        isSummary = !!stepData.isSummary;
        
        if ((stepData as any).isTerminal) {
          setCurrentPath([]);
          setSelections({});
        } else {
          setCurrentPath(prev => [...prev, textToSend]);
        }
      } else {
        const lastBot = messages.filter(m => m.role === 'model').slice(-1)[0];
        cleanText = "I'm sorry, I didn't quite catch that. Please select from the options:";
        suggestedButtons = lastBot?.buttons || ['🏠 HOME', '🔙 BACK'];
      }
    } else {
      cleanText = botReply as string;
      const optionsMatch = cleanText.match(/\[OPTIONS:\s*(.*?)\]/i);
      if (optionsMatch && optionsMatch[1]) {
        suggestedButtons = optionsMatch[1].split(',').map(s => s.trim());
        cleanText = cleanText.replace(/\[OPTIONS:.*?\]/gi, '').trim();
      }
      setCurrentPath(prev => [...prev, textToSend]);
    }

    setMessages(prev => [...prev, { role: 'model', text: cleanText, buttons: suggestedButtons, isSummary, isError }]);
    setLoading(false);

    if (upperText.includes('CONFIRM') && config.automation?.googleSheetsEnabled) {
       await syncLeadToGoogleSheets({
          name: "Simulator User",
          summary: JSON.stringify(newSelections),
          agent: activeAgent.name,
          engine: aiEnabled ? 'AI (Gemini)' : 'Static Flow'
       }, config.automation.sheetsEndpoint);
    }
  };

  return (
    <div className="flex flex-col h-[800px] w-full max-w-md mx-auto bg-[#e5ddd5] rounded-[3.5rem] overflow-hidden border-[14px] border-slate-900 shadow-3xl relative">
      <div className="bg-[#075e54] text-white p-5 pt-7 flex items-center gap-3 z-10 shadow-lg">
        <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden bg-white/10 flex items-center justify-center">
          {activeAgent?.image ? <img src={activeAgent.image} className="w-full h-full object-cover" /> : <i className="fa-solid fa-user-tie text-white/50 text-xl"></i> }
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-[13px] leading-none">{activeAgent?.name}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`w-1.5 h-1.5 rounded-full ${aiEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-orange-400'}`}></span>
            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-50/70">
              {aiEnabled ? 'AI Assistant Online' : 'Smart Logic Engine'}
            </p>
          </div>
        </div>
        <div className="flex gap-4 text-white/80"><i className="fa-solid fa-ellipsis-vertical text-sm"></i></div>
      </div>

      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat pb-10">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`max-w-[85%] p-3 rounded-xl text-[12px] shadow-sm relative ${
              m.role === 'user' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none border border-slate-200'
            } ${m.isSummary ? 'border-2 border-emerald-500 bg-emerald-50' : ''}`}>
              <p className={`whitespace-pre-wrap leading-relaxed ${m.isSummary ? 'font-bold text-emerald-900' : 'text-slate-800'}`}>{m.text}</p>
              <div className="flex justify-end items-center gap-1 mt-1">
                <span className="text-[7px] text-slate-400">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {m.role === 'user' && <i className="fa-solid fa-check-double text-[8px] text-blue-400"></i>}
              </div>
            </div>
            
            {m.role === 'model' && m.buttons && i === messages.length - 1 && (
              <div className="grid grid-cols-2 gap-2 mt-3 w-full px-1">
                {m.buttons.map((btn) => (
                  <button
                    key={btn}
                    onClick={() => handleSend(btn)}
                    disabled={loading}
                    className={`py-2.5 px-3 rounded-lg text-[9px] font-bold uppercase tracking-tight transition-all border shadow-sm active:scale-95 text-center flex items-center justify-center min-h-[44px] ${
                      btn.includes('BACK') || btn.includes('HOME')
                        ? 'bg-slate-50 border-slate-200 text-slate-500' 
                        : btn.includes('CONFIRM') || btn.includes('DONE')
                        ? 'bg-[#00a884] border-[#00a884] text-white col-span-2'
                        : 'bg-white border-emerald-100 text-[#075e54] hover:bg-[#00a884] hover:text-white'
                    }`}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="bg-white/80 px-4 py-2 rounded-full text-[9px] text-slate-400 animate-pulse border border-slate-200">typing...</div></div>}
      </div>

      <div className="bg-[#f0f2f5] p-3 flex items-center gap-2 border-t border-slate-200">
        <div className="flex-1 bg-white rounded-full px-4 py-2 border border-slate-200 flex items-center shadow-sm">
           <i className="fa-regular fa-face-smile text-slate-400 mr-3 text-lg"></i>
           <input 
             type="text" 
             className="flex-1 bg-transparent text-[12px] outline-none" 
             placeholder="Type a message..." 
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleSend()}
           />
           <i className="fa-solid fa-paperclip text-slate-400 ml-2 transform -rotate-45"></i>
        </div>
        <button 
          onClick={() => handleSend()}
          className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90 ${input.trim() ? 'bg-[#00a884] text-white' : 'bg-slate-300 text-slate-500'}`}
        >
          {input.trim() ? <i className="fa-solid fa-paper-plane text-sm"></i> : <i className="fa-solid fa-microphone text-sm"></i>}
        </button>
      </div>
    </div>
  );
};

export default BotSimulator;
