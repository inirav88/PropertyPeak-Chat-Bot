
import React, { useState, useRef, useEffect } from 'react';
import { getBotResponse } from '../services/geminiService';
import { syncLeadToGoogleSheets } from '../services/automationService';

type FlowMessage = {
  role: 'user' | 'model';
  text: string;
  buttons?: string[];
  isSummary?: boolean;
};

const BotSimulator: React.FC<{ config: any }> = ({ config }) => {
  const [messages, setMessages] = useState<FlowMessage[]>([
    { 
      role: 'model', 
      text: "Welcome! What are you looking for?",
      buttons: ['🏠 BUY PROPERTY', '💰 SELL PROPERTY', '📝 RENT PROPERTY', '🏢 COMMERCIAL', '📊 VALUATION', '🏦 LOAN', '👨‍💼 AGENT']
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [amenities, setAmenities] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeAgent = config.agents.find((a: any) => a.id === config.activeAgentId) || config.agents[0];
  const aiEnabled = config.api.aiEnabled;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const getStepData = (userInput: string, path: string[]) => {
    const last = userInput.toUpperCase();
    const p = path.join(' > ').toUpperCase();
    const lastBotMsg = (messages.filter(m => m.role === 'model').slice(-1)[0]?.text || "").toUpperCase();

    // --- LEVEL 0: MAIN MENU ---
    if (path.length === 0) {
      if (last.includes('BUY')) return { text: "What type of property?", buttons: ['🏡 RESIDENTIAL', '🏢 COMMERCIAL', '📍 PLOT/LAND', '🏗️ UNDER CONSTRUCTION', '🔙 BACK'] };
      if (last.includes('SELL')) return { text: "What are you selling?", buttons: ['🏢 APARTMENT', '🏡 INDEPENDENT HOUSE', '📍 PLOT/LAND', '🏢 COMMERCIAL', '🔙 BACK'] };
      if (last.includes('RENT')) return { text: "Type of tenant?", buttons: ['👨‍👩‍👧‍👦 FAMILY', '👨‍🎓 BACHELOR', '👨‍💼 WORKING PROFESSIONAL', '🏢 CORPORATE', '🔙 BACK'] };
      if (last.includes('COMMERCIAL')) return { text: "Commercial property type?", buttons: ['🏢 OFFICE SPACE', '🛍️ RETAIL SHOP', '🏭 WAREHOUSE', '🏨 HOTEL', '🔙 BACK'] };
      if (last.includes('VALUATION')) return { text: "Property for valuation?", buttons: ['🏢 APARTMENT (V)', '🏡 HOUSE (V)', '📍 PLOT/LAND (V)', '🏢 COMMERCIAL (V)', '🔙 BACK'] };
      if (last.includes('LOAN')) return { text: "Loan for?", buttons: ['🏠 PURCHASE', '🏠 CONSTRUCTION', '🏠 IMPROVEMENT', '🏠 BALANCE TRANSFER', '🔙 BACK'] };
      if (last.includes('AGENT')) return { text: "Need help with:", buttons: ['🏠 PROPERTY SEARCH', '💰 SELLING ASSISTANCE', '📝 LEGAL PROCESS', '📅 SITE VISIT', '🔙 BACK'] };
    }

    // --- BRANCH: BUY ---
    if (p.includes('BUY')) {
      if (lastBotMsg.includes('TYPE OF PROPERTY')) return { text: "Select configuration:", buttons: ['1️⃣ 1 BHK', '2️⃣ 2 BHK', '3️⃣ 3 BHK', '4️⃣ 4 BHK', '👑 PENTHOUSE', '🏙️ STUDIO', '🔙 BACK'] };
      if (lastBotMsg.includes('SELECT CONFIGURATION')) return { text: "Select budget range:", buttons: ['Under ₹50L', '₹50L - ₹1Cr', '₹1Cr - ₹2Cr', '₹2Cr - ₹5Cr', '₹5Cr+', '💰 CUSTOM', '🔙 BACK'] };
      if (last.includes('CUSTOM') && !lastBotMsg.includes('TYPE YOUR CUSTOM')) return { text: "Please type your custom budget (e.g., 85 Lakhs) and press Enter.", buttons: ['🔙 BACK'] };
      if (lastBotMsg.includes('BUDGET RANGE') || lastBotMsg.includes('CUSTOM BUDGET')) {
          if (last !== '🔙 BACK') return { text: "Select location city:", buttons: ['🏙️ GANDHINAGAR', '🏙️ AHMEDABAD', '🏙️ RAJKOT', '🏙️ SURAT', '🏙️ VADODARA', '📍 OTHER', '🔙 BACK'] };
      }
      if (last.includes('GANDHINAGAR')) return { text: "Select area in Gandhinagar:", buttons: ['Sector 1-15 (Govt)', 'Sector 16-30 (Res)', '📍 INFOCITY/KUDASAN', '🛣️ RAPAT ROAD', '🎓 PDPU AREA', '🏘️ ADALAJ', '🔙 BACK'] };
      if (lastBotMsg.includes('GANDHINAGAR') && (last.includes('SECTOR') || last.includes('INFOCITY') || last.includes('ROAD') || last.includes('AREA') || last.includes('ADALAJ'))) return { text: "Furnishing preference:", buttons: ['🛋️ FULLY FURNISHED', '🛏️ SEMI FURNISHED', '🏚️ UNFURNISHED', '🤷 ANY', '🔙 BACK'] };
      if (lastBotMsg.includes('FURNISHING PREFERENCE')) return { text: "Possession timeline:", buttons: ['⚡ READY TO MOVE', '⏳ UNDER CONSTRUCTION', '📅 ANY', '🔙 BACK'] };
      if (lastBotMsg.includes('POSSESSION TIMELINE')) return { text: "Select important amenities:", buttons: ['🅿️ PARKING', '🏋️ GYM', '🏊 POOL', '🌳 GARDEN', '🔒 SECURITY', '⚡ POWER BACKUP', '✅ DONE SELECTING', '🔙 BACK'] };
      if (last.includes('DONE SELECTING')) return { text: "How should we contact you?", buttons: ['📱 WHATSAPP ONLY', '📞 CALL ONLY', '✉️ EMAIL ONLY', '🔙 BACK'] };
    }

    // --- BRANCH: SELL ---
    if (p.includes('SELL')) {
      if (lastBotMsg.includes('WHAT ARE YOU SELLING')) return { text: "Configuration of property:", buttons: ['1️⃣ 1 BHK', '2️⃣ 2 BHK', '3️⃣ 3 BHK', '4️⃣ 4 BHK', '🏢 COMMERCIAL SPACE', '🔙 BACK'] };
      if (lastBotMsg.includes('CONFIGURATION OF PROPERTY')) return { text: "Carpet area (Approx):", buttons: ['Under 1000 sq.ft', '1000-1500 sq.ft', '1500-2500 sq.ft', '2500+ sq.ft', '📏 CUSTOM AREA', '🔙 BACK'] };
      if (last.includes('CUSTOM AREA') && !lastBotMsg.includes('TYPE YOUR CARPET AREA')) return { text: "Please type your carpet area (sq.ft) and press Enter.", buttons: ['🔙 BACK'] };
      if (lastBotMsg.includes('CARPET AREA') || lastBotMsg.includes('CUSTOM AREA')) return { text: "Property age:", buttons: ['🆕 0-5 years', '⏳ 5-10 years', '📅 10-20 years', '🏚️ 20+ years', '🔙 BACK'] };
      if (lastBotMsg.includes('PROPERTY AGE')) return { text: "Floor number:", buttons: ['🏢 GROUND', '1️⃣ 1st-5th', '🏢 HIGHER FLOOR', '🏙️ PENTHOUSE LEVEL', '🔙 BACK'] };
      if (lastBotMsg.includes('FLOOR NUMBER')) return { text: "Expected price range:", buttons: ['Under ₹1Cr', '₹1Cr - ₹2Cr', '₹2Cr - ₹5Cr', '₹5Cr+', '💰 ENTER PRICE', '🔙 BACK'] };
      if (last.includes('ENTER PRICE') && !lastBotMsg.includes('EXPECTED PRICE')) return { text: "Please type your expected price and press Enter.", buttons: ['🔙 BACK'] };
      if (lastBotMsg.includes('PRICE RANGE') || lastBotMsg.includes('EXPECTED PRICE')) return { text: "Timeline to sell:", buttons: ['⚡ IMMEDIATE', '⏳ 1-3 MONTHS', '📅 6+ MONTHS', '🔙 BACK'] };
      if (lastBotMsg.includes('TIMELINE TO SELL')) return { text: "How should we contact you?", buttons: ['📱 SHARE WHATSAPP', '📞 SHARE NUMBER', '🔙 BACK'] };
    }

    // --- BRANCH: RENT ---
    if (p.includes('RENT')) {
      if (lastBotMsg.includes('TYPE OF TENANT')) return { text: "Looking for:", buttons: ['🏢 APARTMENT', '🏡 INDEPENDENT HOUSE', '🏙️ STUDIO', '🛏️ PG/HOSTEL', '🔙 BACK'] };
      if (lastBotMsg.includes('LOOKING FOR')) return { text: "Configuration needed:", buttons: ['1️⃣ 1 BHK', '2️⃣ 2 BHK', '3️⃣ 3 BHK', '🛏️ SINGLE ROOM', '🔙 BACK'] };
      if (lastBotMsg.includes('CONFIGURATION NEEDED')) return { text: "Monthly budget:", buttons: ['Under ₹10K', '₹10K-₹25K', '₹25K-₹50K', '₹50K+', '💰 ENTER BUDGET', '🔙 BACK'] };
      if (last.includes('ENTER BUDGET') && !lastBotMsg.includes('TYPE YOUR MONTHLY')) return { text: "Please type your monthly budget and press Enter.", buttons: ['🔙 BACK'] };
      if (lastBotMsg.includes('MONTHLY BUDGET')) return { text: "Lease duration:", buttons: ['📅 11 MONTHS', '📅 2+ YEARS', '📅 FLEXIBLE', '🔙 BACK'] };
      if (lastBotMsg.includes('LEASE DURATION')) return { text: "When to move in?", buttons: ['⚡ IMMEDIATE', '📅 NEXT MONTH', '📅 FLEXIBLE', '🔙 BACK'] };
      if (lastBotMsg.includes('MOVE IN')) return { text: "How should we contact you?", buttons: ['📱 WHATSAPP ONLY', '📞 CALL ONLY', '🔙 BACK'] };
    }

    // --- BRANCH: COMMERCIAL ---
    if (p.includes('COMMERCIAL') && !p.includes('BUY') && !p.includes('SELL')) {
      if (lastBotMsg.includes('PROPERTY TYPE')) return { text: "Area required (Sq.ft):", buttons: ['Under 500', '500-1500', '1500-5000', '5000+', '📏 ENTER SQFT', '🔙 BACK'] };
      if (lastBotMsg.includes('AREA REQUIRED') || last.includes('SQFT')) return { text: "Monthly rent / Purchase budget?", buttons: ['💰 FOR RENT', '💰 FOR BUY', '🔙 BACK'] };
      if (lastBotMsg.includes('MONTHLY RENT') || lastBotMsg.includes('PURCHASE BUDGET')) return { text: "Preferred location city?", buttons: ['🏙️ GANDHINAGAR', '🏙️ AHMEDABAD', '🏙️ RAJKOT', '🔙 BACK'] };
      if (lastBotMsg.includes('LOCATION CITY')) return { text: "How should we contact you?", buttons: ['📱 SHARE DETAILS', '🔙 BACK'] };
    }

    // --- BRANCH: VALUATION ---
    if (p.includes('VALUATION')) {
      if (lastBotMsg.includes('PROPERTY FOR VALUATION')) return { text: "Exact Area/Society Name: (Please type below)", buttons: ['🔙 BACK'] };
      if (lastBotMsg.includes('EXACT AREA/SOCIETY NAME')) return { text: "Property Age (Years):", buttons: ['🆕 0-5', '⏳ 5-15', '🏚️ 15+', '🔙 BACK'] };
      if (lastBotMsg.includes('PROPERTY AGE')) return { text: "How should we contact you?", buttons: ['📱 SEND REPORT ON WHATSAPP', '📞 CALL ME', '🔙 BACK'] };
    }

    // --- BRANCH: LOAN ---
    if (p.includes('LOAN')) {
      if (lastBotMsg.includes('LOAN FOR')) return { text: "Employment Type:", buttons: ['💼 SALARIED', '🏢 SELF-EMPLOYED', '👨‍⚕️ PROFESSIONAL', '🔙 BACK'] };
      if (lastBotMsg.includes('EMPLOYMENT TYPE')) return { text: "Required Loan Amount:", buttons: ['₹10L-₹50L', '₹50L-₹1Cr', '₹1Cr-₹5Cr', '💰 OTHER', '🔙 BACK'] };
      if (lastBotMsg.includes('LOAN AMOUNT')) return { text: "How should we contact you?", buttons: ['📞 CALL FOR ELIGIBILITY', '🔙 BACK'] };
    }

    // --- BRANCH: AGENT / SITE VISIT ---
    if (p.includes('AGENT')) {
      if (last.includes('SITE VISIT')) return { text: "Please type the Project or Society Name you wish to visit:", buttons: ['🔙 BACK'] };
      if (lastBotMsg.includes('PROJECT OR SOCIETY NAME')) return { text: "When would you like to visit?", buttons: ['📅 TODAY', '📅 TOMORROW', '📅 THIS WEEKEND', '🕒 CUSTOM TIME', '🔙 BACK'] };
      if (lastBotMsg.includes('LIKE TO VISIT')) return { text: "How should we contact you to confirm?", buttons: ['📱 WHATSAPP', '📞 PHONE CALL', '🔙 BACK'] };
      
      // Generic Agent branches
      if (lastBotMsg.includes('NEED HELP WITH') && !last.includes('SITE')) return { text: "Please describe your requirement briefly:", buttons: ['🔙 BACK'] };
      if (lastBotMsg.includes('REQUIREMENT BRIEFLY')) return { text: "How should we contact you?", buttons: ['📱 WHATSAPP', '📞 PHONE CALL', '🔙 BACK'] };
    }

    // --- FINAL SUMMARY TRIGGER ---
    const contactKeywords = ['WHATSAPP', 'NUMBER', 'EMAIL', 'CALL', 'SHARE', 'DETAILS', 'CALL ME', 'PHONE CALL'];
    const isContactStep = contactKeywords.some(kw => last.includes(kw)) && !last.includes('BACK');

    if (isContactStep) {
       const summaryList = Object.entries(selections).map(([k,v]) => `${v}`).join(' → ');
       return { 
         text: `📋 SUMMARY CAPTURED:\n\n${summaryList}\n\n${amenities.length ? "🏊 Amenities: " + amenities.join(", ") : ""}`, 
         buttons: ['✅ CONFIRM & SEND', '✏️ EDIT DETAILS', '🏠 HOME'],
         isSummary: true
       };
    }

    return null;
  };

  const handleSend = async (forcedText?: string) => {
    const textToSend = forcedText || input;
    if (!textToSend.trim() || loading) return;

    if (['🏠 HOME', '🔄 START OVER', '🏠 NEW ENQUIRY', '✏️ EDIT DETAILS'].includes(textToSend.toUpperCase())) {
      setMessages([{ role: 'model', text: "Welcome! What are you looking for?", buttons: ['🏠 BUY PROPERTY', '💰 SELL PROPERTY', '📝 RENT PROPERTY', '🏢 COMMERCIAL', '📊 VALUATION', '🏦 LOAN', '👨‍💼 AGENT'] }]);
      setCurrentPath([]);
      setSelections({});
      setAmenities([]);
      setInput('');
      return;
    }

    if (textToSend === '🔙 BACK') {
      const newPath = [...currentPath];
      newPath.pop();
      setCurrentPath(newPath);
      const modelMsgs = messages.filter(m => m.role === 'model');
      const lastBotMsg = modelMsgs[modelMsgs.length - 2];
      if (lastBotMsg) {
        setMessages(prev => [...prev, { role: 'model', text: lastBotMsg.text, buttons: lastBotMsg.buttons }]);
      }
      setInput('');
      return;
    }

    const amenList = ['🅿️ PARKING', '🏋️ GYM', '🏊 POOL', '🌳 GARDEN', '🔒 SECURITY', '⚡ POWER BACKUP'];
    if (amenList.includes(textToSend)) {
      const newAmen = amenities.includes(textToSend) ? amenities.filter(a => a !== textToSend) : [...amenities, textToSend];
      setAmenities(newAmen);
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last.role === 'model') {
          return [...prev.slice(0, -1), { ...last, text: `Selected Amenities: ${newAmen.length ? newAmen.join(', ') : 'None'}\n\nSelect more or click Done.` }];
        }
        return prev;
      });
      return;
    }

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setLoading(true);

    const stepKey = `Step_${currentPath.length + 1}`;
    const newSelections = { ...selections, [stepKey]: textToSend };
    setSelections(newSelections);

    const botRawReply = await getBotResponse(textToSend, messages.map(m => ({ text: m.text })), config);
    
    let cleanText = '';
    let suggestedButtons: string[] = [];
    let isSummary = false;

    if (botRawReply === "__OFFLINE_FLOW__" || !aiEnabled) {
      const stepData = getStepData(textToSend, currentPath);
      if (stepData) {
        cleanText = stepData.text;
        suggestedButtons = stepData.buttons || [];
        isSummary = !!stepData.isSummary;
        setCurrentPath([...currentPath, textToSend]);
      } else if (textToSend === '✅ CONFIRM & SEND') {
        cleanText = "✅ SUCCESS! Request Sent.\n\nOur team will contact you shortly.";
        suggestedButtons = ['🏠 HOME', '📞 CALL AGENT'];
      } else {
        cleanText = "I didn't quite catch that. Please follow the instructions or use buttons.";
        const lastBot = messages.filter(m => m.role === 'model').slice(-1)[0];
        suggestedButtons = lastBot?.buttons || ['🏠 HOME'];
      }
    } else {
      cleanText = botRawReply;
      const optionsMatch = botRawReply.match(/\[OPTIONS:\s*(.*?)\]/i);
      if (optionsMatch && optionsMatch[1]) {
        suggestedButtons = optionsMatch[1].split(',').map(s => s.trim());
        cleanText = botRawReply.replace(/\[OPTIONS:.*?\]/gi, '').trim();
      }
    }

    setMessages(prev => [...prev, { role: 'model', text: cleanText, buttons: suggestedButtons, isSummary }]);
    setLoading(false);

    if (textToSend === '✅ CONFIRM & SEND' && config.automation?.googleSheetsEnabled) {
       await syncLeadToGoogleSheets({
          name: "Simulator User",
          summary: JSON.stringify(newSelections),
          amenities: amenities.join(', '),
          agent: activeAgent.name,
          engine: aiEnabled ? 'AI' : 'State Engine'
       }, config.automation.sheetsEndpoint);
    }
  };

  return (
    <div className="flex flex-col h-[750px] w-full max-w-md mx-auto bg-[#e5ddd5] rounded-[3.5rem] overflow-hidden border-[14px] border-slate-900 shadow-3xl relative">
      <div className="bg-[#075e54] text-white p-5 flex items-center gap-3 z-10 shadow-md">
        <div className="w-11 h-11 rounded-full border-2 border-white/20 overflow-hidden bg-slate-100">
          <img src={activeAgent?.image || `https://ui-avatars.com/api/?name=${activeAgent?.name}&background=random`} className="w-full h-full object-cover" alt="Agent" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-sm leading-tight">{activeAgent?.name}</h3>
          <div className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> 
            {aiEnabled ? 'AI Assistant' : 'Smart Bot'}
          </div>
        </div>
        <div className="flex gap-4 opacity-80 text-sm">
          <i className="fa-solid fa-video cursor-pointer"></i>
          <i className="fa-solid fa-phone cursor-pointer"></i>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat scroll-smooth pb-10">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-3 duration-300`}>
            <div className={`max-w-[88%] p-3.5 rounded-2xl text-[13px] shadow-sm relative ${
              m.role === 'user' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none border border-slate-200'
            } ${m.isSummary ? 'border-2 border-emerald-500 bg-emerald-50' : ''}`}>
              <p className={`whitespace-pre-wrap leading-relaxed ${m.isSummary ? 'font-bold text-emerald-900' : 'text-slate-800'}`}>{m.text}</p>
              <div className="flex justify-end items-center gap-1 mt-1">
                <p className="text-[8px] text-slate-400 font-black uppercase">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                {m.role === 'user' && <i className="fa-solid fa-check-double text-[8px] text-blue-400"></i>}
              </div>
            </div>
            
            {m.role === 'model' && m.buttons && i === messages.length - 1 && (
              <div className="grid grid-cols-2 gap-2 mt-4 w-full px-2">
                {m.buttons.map((btn) => (
                  <button
                    key={btn}
                    onClick={() => handleSend(btn)}
                    disabled={loading}
                    className={`py-3 px-3 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border shadow-sm active:scale-95 text-center flex items-center justify-center min-h-[48px] ${
                      btn.includes('BACK') || btn.includes('HOME')
                        ? 'bg-slate-100 border-slate-300 text-slate-600' 
                        : btn.includes('CONFIRM') || btn.includes('DONE')
                        ? 'bg-emerald-600 border-emerald-700 text-white col-span-2 py-4'
                        : amenities.includes(btn) 
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-700 font-black'
                        : 'bg-white border-emerald-100 text-[#00a884] hover:bg-[#00a884] hover:text-white'
                    }`}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-white/90 px-5 py-2.5 rounded-full text-[9px] font-black text-slate-500 animate-pulse border border-slate-200">typing...</div>
          </div>
        )}
      </div>

      <div className="bg-[#f0f2f5] p-3 border-t border-slate-200 flex items-center gap-2">
        <button onClick={() => handleSend('🏠 HOME')} className="w-10 h-10 rounded-full bg-white text-slate-500 flex items-center justify-center border border-slate-200 shadow-sm"><i className="fa-solid fa-house-chimney"></i></button>
        <div className="flex-1 relative">
           <input 
             type="text" 
             className="w-full bg-white border border-slate-200 rounded-full px-5 py-2.5 text-[11px] font-medium outline-none focus:ring-2 focus:ring-[#00a884]" 
             placeholder="Type project name, area, or budget..." 
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleSend()}
           />
        </div>
        <button 
          onClick={() => handleSend()}
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors ${input.trim() ? 'bg-[#00a884] text-white' : 'bg-slate-200 text-slate-400'}`}
        >
          <i className="fa-solid fa-paper-plane text-xs"></i>
        </button>
      </div>
    </div>
  );
};

export default BotSimulator;
