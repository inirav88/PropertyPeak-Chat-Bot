
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
    
    const now = new Date();
    const currentHour = now.getHours();

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

    // --- SITE VISIT FLOW (STRICT STATE MACHINE) ---
    // If user clicked SITE VISIT
    if (last.includes('SITE VISIT')) {
      return { text: "Please type the Project or Society Name you wish to visit:", buttons: ['🔙 BACK'] };
    }

    // If the bot just asked for Project/Society name, any input is treated as the name
    if (lastBotMsg.includes('PROJECT OR SOCIETY NAME')) {
      const dateButtons = [];
      // HIDE TODAY IF 6PM+
      if (currentHour < 18) {
        dateButtons.push('📅 TODAY');
      }
      dateButtons.push('📅 TOMORROW', '📅 THIS WEEKEND', '🗓️ NEXT WEEK', '🔙 BACK');
      return { text: "When would you like to visit?", buttons: dateButtons };
    }

    // If user selected a Date
    if (lastBotMsg.includes('LIKE TO VISIT')) {
      const isToday = last.includes('TODAY');
      const slots: string[] = [];
      
      if (!isToday || currentHour < 10) slots.push('🌅 MORNING (10-12)');
      if (!isToday || currentHour < 14) slots.push('☀️ AFTERNOON (2-4)');
      if (!isToday || currentHour < 17) slots.push('🌆 EVENING (5-7)');
      
      slots.push('🕒 ANYTIME', '🔙 BACK');

      if (isToday && slots.length <= 2) {
         return { 
           text: "It's past visiting hours for today. I've scheduled you for Tomorrow instead. What time works?", 
           buttons: ['🌅 MORNING (10-12)', '☀️ AFTERNOON (2-4)', '🌆 EVENING (5-7)', '🕒 ANYTIME', '🔙 BACK'] 
         };
      }
      return { text: `Great! Which time slot for ${userInput} works best?`, buttons: slots };
    }

    // If user selected a Slot
    if (lastBotMsg.includes('WHICH TIME SLOT') || lastBotMsg.includes('WHICH SLOT WORKS BEST')) {
      return { text: "How should we contact you to confirm this appointment?", buttons: ['📱 WHATSAPP', '📞 PHONE CALL', '🔙 BACK'] };
    }

    // --- FINAL SUMMARY TRIGGER ---
    const contactKeywords = ['WHATSAPP', 'NUMBER', 'EMAIL', 'CALL', 'SHARE', 'DETAILS', 'CALL ME', 'PHONE CALL'];
    const isContactStep = contactKeywords.some(kw => last.includes(kw)) && !last.includes('BACK');

    if (isContactStep) {
       const summaryList = Object.entries(selections).map(([k,v]) => `${v}`).join(' → ');
       return { 
         text: `📋 SITE VISIT REQUEST CAPTURED:\n\n${summaryList}\n\nOur team will contact you shortly.`, 
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

    // Logic for State Engine (Offline)
    if (botRawReply === "__OFFLINE_FLOW__" || !aiEnabled) {
      const stepData = getStepData(textToSend, currentPath);
      if (stepData) {
        cleanText = stepData.text;
        suggestedButtons = stepData.buttons || [];
        isSummary = !!stepData.isSummary;
        setCurrentPath(prev => [...prev, textToSend]);
      } else if (textToSend === '✅ CONFIRM & SEND') {
        cleanText = "✅ SUCCESS! Request received. We will contact you soon.";
        suggestedButtons = ['🏠 HOME'];
      } else {
        cleanText = "I didn't quite catch that. Please use buttons or provide the requested name.";
        const lastBot = messages.filter(m => m.role === 'model').slice(-1)[0];
        suggestedButtons = lastBot?.buttons || ['🏠 HOME'];
      }
    } else {
      // AI Logic
      cleanText = botRawReply;
      const optionsMatch = botRawReply.match(/\[OPTIONS:\s*(.*?)\]/i);
      if (optionsMatch && optionsMatch[1]) {
        suggestedButtons = optionsMatch[1].split(',').map(s => s.trim());
        cleanText = botRawReply.replace(/\[OPTIONS:.*?\]/gi, '').trim();
      }
      setCurrentPath(prev => [...prev, textToSend]);
    }

    setMessages(prev => [...prev, { role: 'model', text: cleanText, buttons: suggestedButtons, isSummary }]);
    setLoading(false);

    if (textToSend === '✅ CONFIRM & SEND' && config.automation?.googleSheetsEnabled) {
       await syncLeadToGoogleSheets({
          name: "Simulator User",
          summary: JSON.stringify(newSelections),
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
      </div>

      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat scroll-smooth pb-10">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-3 duration-300`}>
            <div className={`max-w-[88%] p-3.5 rounded-2xl text-[13px] shadow-sm relative ${
              m.role === 'user' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none border border-slate-200'
            } ${m.isSummary ? 'border-2 border-emerald-500 bg-emerald-50' : ''}`}>
              <p className={`whitespace-pre-wrap leading-relaxed ${m.isSummary ? 'font-bold text-emerald-900' : 'text-slate-800'}`}>{m.text}</p>
              <div className="flex justify-end items-center gap-1 mt-1">
                <p className="text-[8px] text-slate-400 uppercase">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
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
             <div className="bg-white/90 px-5 py-2.5 rounded-full text-[9px] text-slate-500 animate-pulse border border-slate-200">typing...</div>
          </div>
        )}
      </div>

      <div className="bg-[#f0f2f5] p-3 border-t border-slate-200 flex items-center gap-2">
        <button onClick={() => handleSend('🏠 HOME')} className="w-10 h-10 rounded-full bg-white text-slate-500 flex items-center justify-center border border-slate-200 shadow-sm"><i className="fa-solid fa-house-chimney"></i></button>
        <div className="flex-1 relative">
           <input 
             type="text" 
             className="w-full bg-white border border-slate-200 rounded-full px-5 py-2.5 text-[11px] outline-none" 
             placeholder="Type project name..." 
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
