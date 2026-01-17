
import React, { useState, useRef, useEffect } from 'react';
import { getBotResponse } from '../services/geminiService';
import { sendWhatsAppMessage } from '../services/whatsappService';

type FlowMessage = {
  role: 'user' | 'model';
  text: string;
  buttons?: string[];
  isPushed?: boolean;
  pushError?: string;
  stepId?: string;
};

const BotSimulator: React.FC<{ config: any }> = ({ config }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [messages, setMessages] = useState<FlowMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pushingIdx, setPushingIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (config.chatFlow && config.chatFlow.length > 0) {
      const firstStep = config.chatFlow[0];
      setMessages([{
        role: 'model',
        text: firstStep.message,
        buttons: firstStep.type === 'selection' ? firstStep.options : [],
        stepId: firstStep.id
      }]);
      setCurrentIndex(0);
    }
  }, [config.chatFlow]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading]);

  const resetFlow = () => {
    setCurrentIndex(0);
    if (config.chatFlow && config.chatFlow.length > 0) {
      const firstStep = config.chatFlow[0];
      setMessages([{
        role: 'model',
        text: firstStep.message,
        buttons: firstStep.type === 'selection' ? firstStep.options : [],
        stepId: firstStep.id
      }]);
    }
  };

  const handleSend = async (forcedText?: string) => {
    const text = (forcedText || input).trim();
    if (!text || loading) return;

    if (text.toUpperCase() === 'RESTART CONSULTATION' || text.toUpperCase() === 'RESET FLOW') {
      resetFlow();
      return;
    }

    const isBackCommand = text === '🔙 Go Back' || text.toLowerCase() === 'back';

    const userMsg: FlowMessage = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    if (config.api.aiEnabled && !isBackCommand) {
      const aiReply = await getBotResponse(text, messages.map(m => ({ text: m.text })), config);
      if (aiReply) {
        setMessages(prev => [...prev, { role: 'model', text: aiReply }]);
        setLoading(false);
        return;
      }
    }

    setTimeout(() => {
      let nextIndex = currentIndex + 1;
      
      const historyText = messages.map(m => m.text).join(' ') + ' ' + text;
      const isResidential = historyText.includes('Residential');
      const isCommercial = historyText.includes('Commercial');
      const isLoan = historyText.includes('Loan');
      const isSell = historyText.includes('Sell');
      const isRent = historyText.includes('Rent');
      const isBuy = historyText.includes('Buy');

      if (isBackCommand) {
        const currentStep = config.chatFlow[currentIndex];
        if (currentStep.id === 'location_input' && isLoan) {
          nextIndex = config.chatFlow.findIndex((s: any) => s.id === 'loan_type');
        } else if (currentStep.id === 'loan_type') {
          nextIndex = config.chatFlow.findIndex((s: any) => s.id === 'greeting');
        } else if (currentStep.id === 'location_input' && isResidential) {
          nextIndex = config.chatFlow.findIndex((s: any) => s.id === 'residential_type');
        } else if (currentStep.id === 'location_input' && isCommercial) {
          nextIndex = config.chatFlow.findIndex((s: any) => s.id === 'commercial_type');
        } else {
          nextIndex = Math.max(0, currentIndex - 1);
        }
      } else {
        const currentStep = config.chatFlow[currentIndex];
        
        // 1. From Greeting to either Loan Type or Category Selection
        if (currentStep.id === 'greeting') {
           if (isLoan) {
             nextIndex = config.chatFlow.findIndex((s: any) => s.id === 'loan_type');
           } else {
             nextIndex = config.chatFlow.findIndex((s: any) => s.id === 'category_selection');
           }
        }

        // 2. From Loan Type to Location
        else if (currentStep.id === 'loan_type') {
          nextIndex = config.chatFlow.findIndex((s: any) => s.id === 'location_input');
        }

        // 3. Branch between Residential and Commercial
        else if (currentStep.id === 'category_selection') {
          if (isResidential) {
            nextIndex = config.chatFlow.findIndex((s: any) => s.id === 'residential_type');
          } else {
            nextIndex = config.chatFlow.findIndex((s: any) => s.id === 'commercial_type');
          }
        }

        // 4. From types to Location
        else if (currentStep.id === 'residential_type' || currentStep.id === 'commercial_type') {
          nextIndex = config.chatFlow.findIndex((s: any) => s.id === 'location_input');
        }

        // 5. Skip furnishing for Loan/Sell
        if (config.chatFlow[nextIndex]?.id === 'furnishing_selection' && (isLoan || isSell)) {
          nextIndex = config.chatFlow.findIndex((s: any) => s.id === 'budget_selection');
        }
      }

      let botMsg: FlowMessage;
      if (config.chatFlow[nextIndex]) {
        const nextStep = config.chatFlow[nextIndex];
        let messageText = nextStep.message;
        let options = nextStep.options ? [...nextStep.options] : [];

        // Dynamic Text Adjustments for context
        if (nextStep.id === 'category_selection') {
           if (isSell) messageText = "What kind of property are you looking to sell?";
           else if (isRent) messageText = "What kind of property do you want to rent?";
           else if (isBuy) messageText = "What kind of property are you looking to buy?";
        }

        if (nextStep.id === 'location_input') {
           if (isSell) messageText = "Where is your property located?";
           else if (isLoan) messageText = "For which location do you need this loan?";
        }

        if (nextStep.id === 'budget_selection') {
          if (isLoan) {
            messageText = "What is the loan amount you are looking for?";
            options = ['Up to ₹25 Lacs', '₹25 Lacs - ₹75 Lacs', '₹75 Lacs - ₹2 Cr', 'Above ₹2 Cr', '🔙 Go Back'];
          } else if (isRent) {
            messageText = "What is your monthly rent budget?";
            options = ['Under ₹15,000', '₹15,000 - ₹35,000', '₹35,000 - ₹75,000', 'Above ₹75,000', '🔙 Go Back'];
          } else if (isSell) {
            messageText = "What is your expected selling price?";
            options = ['Under ₹50 Lacs', '₹50 Lacs - ₹1.5 Cr', '₹1.5 Cr - ₹5 Cr', 'High-end Portfolio', '🔙 Go Back'];
          }
        }

        if (nextStep.type === 'selection' && nextIndex > 0 && !options.includes('🔙 Go Back')) {
          options.push('🔙 Go Back');
        }

        botMsg = {
          role: 'model',
          text: messageText,
          buttons: options,
          stepId: nextStep.id
        };
        setCurrentIndex(nextIndex);
      } else {
        botMsg = {
          role: 'model',
          text: "✅ Thank you! Your request has been recorded. Our financial experts will review the details and contact you shortly.",
          buttons: ['RESTART CONSULTATION', '🔙 Go Back'],
          stepId: 'completed'
        };
      }

      setMessages(prev => [...prev, botMsg]);
      setLoading(false);
    }, 800);
  };

  const lastMessage = messages[messages.length - 1];
  const isWaitingForButton = lastMessage?.role === 'model' && lastMessage?.buttons && lastMessage.buttons.length > 0;

  return (
    <div className="flex flex-col h-[800px] w-full max-w-md mx-auto bg-[#e5ddd5] rounded-[3rem] overflow-hidden border-[12px] border-slate-900 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] relative">
      <div className="bg-[#075e54] text-white p-4 pt-12 z-20 shadow-lg flex items-center gap-3 backdrop-blur-md bg-opacity-95">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
           <i className="fa-solid fa-house-chimney text-white text-sm"></i>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-sm leading-tight tracking-tight">{config.identity.shortName} Assistant</h3>
          <p className="text-[9px] text-emerald-300 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
            Agent Online
          </p>
        </div>
        <button onClick={resetFlow} className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center transition-all active:scale-90">
          <i className="fa-solid fa-arrows-rotate text-xs"></i>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-5 scroll-smooth bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-3 duration-500`}>
            <div className={`max-w-[88%] p-3.5 rounded-2xl text-[12.5px] shadow-sm relative ${
              m.role === 'user' 
                ? 'bg-[#dcf8c6] rounded-tr-none text-slate-800' 
                : 'bg-white rounded-tl-none border border-slate-200/50 text-slate-800'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed font-medium">{m.text}</p>
              
              {m.role === 'model' && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-4">
                  <button 
                    onClick={() => pushToWhatsApp(m.text, i)}
                    disabled={pushingIdx === i}
                    className={`text-[8px] font-black uppercase transition-all flex items-center gap-1.5 py-1 px-2 rounded-md ${m.isPushed ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-500 hover:bg-blue-100'}`}
                  >
                    {pushingIdx === i ? <i className="fa-solid fa-circle-notch animate-spin"></i> : m.isPushed ? <><i className="fa-solid fa-check-double text-[7px]"></i> WHATSAPP SENT</> : <><i className="fa-solid fa-share-nodes text-[7px]"></i> PUSH TO MOBILE</>}
                  </button>
                  <span className="text-[7px] text-slate-300 font-bold tracking-tighter">REF: {m.stepId?.toUpperCase() || 'SYSTEM'}</span>
                </div>
              )}
            </div>

            {m.role === 'model' && m.buttons && i === messages.length - 1 && (
              <div className="flex flex-col gap-2.5 mt-4 w-full max-w-[90%] animate-in zoom-in-95 duration-500">
                {m.buttons.map((btn) => (
                  <button 
                    key={btn} 
                    onClick={() => handleSend(btn)} 
                    disabled={loading}
                    className={`group relative overflow-hidden w-full py-3.5 px-5 rounded-2xl text-[12px] font-bold shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all active:scale-[0.97] flex items-center justify-between border ${
                      btn.includes('Go Back') 
                      ? 'bg-white/80 backdrop-blur-sm border-slate-200 text-slate-500 hover:bg-slate-50' 
                      : 'bg-gradient-to-br from-white to-emerald-50/30 border-emerald-100 text-[#075e54] hover:shadow-emerald-200/50 hover:border-emerald-300 hover:shadow-xl'
                    }`}
                  >
                    <span className="relative z-10">{btn}</span>
                    <div className={`relative z-10 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                      btn.includes('Go Back') 
                      ? 'bg-slate-100 text-slate-400 group-hover:bg-slate-200' 
                      : 'bg-emerald-500 text-white group-hover:scale-110 shadow-lg shadow-emerald-500/30'
                    }`}>
                      <i className={`fa-solid ${btn.includes('Go Back') ? 'fa-arrow-left' : 'fa-chevron-right'} text-[9px]`}></i>
                    </div>
                    {!btn.includes('Go Back') && (
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-start">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white/90 backdrop-blur-md p-4 flex items-center gap-3 border-t border-slate-100/50 relative z-30">
        <div className="flex-1 relative">
          <input 
            type="text" 
            disabled={isWaitingForButton || loading}
            className={`w-full bg-slate-50 px-6 py-4 rounded-2xl text-[13px] outline-none border-2 transition-all ${
              isWaitingForButton 
                ? 'border-transparent bg-slate-100/50 italic text-slate-400 cursor-not-allowed' 
                : 'border-slate-100 focus:border-emerald-500 focus:bg-white focus:shadow-inner'
            }`} 
            placeholder={isWaitingForButton ? "Selection Required" : "Message..."} 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
        </div>
        <button 
          onClick={() => handleSend()} 
          disabled={isWaitingForButton || loading || !input.trim()}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-90 ${
            isWaitingForButton || !input.trim() 
              ? 'bg-slate-200 text-slate-400' 
              : 'bg-[#00a884] text-white hover:bg-[#008f6f] shadow-emerald-500/20'
          }`}
        >
          <i className="fa-solid fa-paper-plane text-sm"></i>
        </button>
      </div>
    </div>
  );

  async function pushToWhatsApp(message: string, index: number) {
    if (!config.meta.phoneNumberId || !config.meta.accessToken || !config.meta.testRecipient) {
      alert("Please configure Meta API settings first.");
      return;
    }
    setPushingIdx(index);
    const result = await sendWhatsAppMessage(config.meta.testRecipient, message, config);
    setPushingIdx(null);
    const updatedMsgs = [...messages];
    if (result.success) {
      updatedMsgs[index].isPushed = true;
    } else {
      updatedMsgs[index].pushError = "Err";
    }
    setMessages(updatedMsgs);
  }
};

export default BotSimulator;
