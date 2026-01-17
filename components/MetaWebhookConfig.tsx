
import React, { useState } from 'react';
import { sendWhatsAppMessage } from '../services/whatsappService';

interface MetaWebhookConfigProps {
  config: any;
  setConfig: (config: any) => void;
}

const MetaWebhookConfig: React.FC<MetaWebhookConfigProps> = ({ config, setConfig }) => {
  const [testStatus, setTestStatus] = useState<{msg: string, type: 'success' | 'error' | 'loading'} | null>(null);

  const handleChange = (section: string, field: string, value: any) => {
    setConfig({
      ...config,
      [section]: {
        ...config[section],
        [field]: value
      }
    });
  };

  const handleTestWhatsApp = async () => {
    if (!config.meta.testRecipient || !config.meta.accessToken) {
      setTestStatus({ msg: "Missing Recipient or Token", type: 'error' });
      return;
    }
    setTestStatus({ msg: "Initiating Handshake...", type: 'loading' });
    const result = await sendWhatsAppMessage(config.meta.testRecipient, "PropAI: Infrastructure Handshake Successful! ✅", config);
    if (result.success) {
      setTestStatus({ msg: "Verified! Message sent to test phone.", type: 'success' });
    } else {
      setTestStatus({ msg: "Handshake Failed. Verify IDs & Permanent Token.", type: 'error' });
    }
  };

  const isAiEnabled = config.api.aiEnabled;

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      {/* AI INTELLIGENCE CENTER */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Bot Intelligence Mode</h3>
            <p className="text-xs text-slate-500">Structured flows or AI-powered conversations.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-400">AI Active</span>
            <button 
              onClick={() => handleChange('api', 'aiEnabled', !config.api.aiEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAiEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAiEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        <div className={`p-6 space-y-6 transition-all ${isAiEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select AI Provider</label>
              <select 
                value={config.api.provider}
                onChange={(e) => handleChange('api', 'provider', e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 appearance-none cursor-pointer"
              >
                <option value="gemini">Google Gemini (Multi-lingual)</option>
                <option value="openai">OpenAI GPT-4o</option>
                <option value="llama">Meta Llama 3</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">API Endpoint Model</label>
              <input 
                type="text" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 font-mono"
                placeholder="e.g. gemini-3-flash-preview"
                value={config.api.modelName}
                onChange={(e) => handleChange('api', 'modelName', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* META API CONFIGURATION SUBSECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-emerald-50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
              <i className="fa-brands fa-meta"></i> Meta API Configuration
            </h3>
            <p className="text-xs text-emerald-700">Manage your WhatsApp Business API credentials.</p>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase rounded-full">Secure Entry</span>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Phone Number ID</label>
              <input 
                type="text" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Enter ID from Meta Dashboard"
                value={config.meta.phoneNumberId}
                onChange={(e) => handleChange('meta', 'phoneNumberId', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">WABA ID</label>
              <input 
                type="text" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="WhatsApp Business Account ID"
                value={config.meta.wabaId}
                onChange={(e) => handleChange('meta', 'wabaId', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">WhatsApp Access Token (System User)</label>
            <textarea 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-[11px] outline-none h-24 focus:ring-2 focus:ring-emerald-500/20 resize-none"
              placeholder="Paste your Permanent Access Token here..."
              value={config.meta.accessToken}
              onChange={(e) => handleChange('meta', 'accessToken', e.target.value)}
            />
            <p className="text-[9px] text-slate-400 italic">Use a Permanent Token for production bots.</p>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row items-end gap-6">
            <div className="flex-1 w-full space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Test Recipient Number</label>
              <input 
                type="text" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500"
                placeholder="e.g. 9198XXXXXXXX"
                value={config.meta.testRecipient}
                onChange={(e) => handleChange('meta', 'testRecipient', e.target.value)}
              />
            </div>
            <button 
              onClick={handleTestWhatsApp}
              className="w-full md:w-auto px-10 py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95"
            >
              {testStatus?.type === 'loading' ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
              Send Connectivity Test
            </button>
          </div>

          {testStatus && (
            <div className={`p-4 rounded-2xl border text-[10px] font-bold flex items-center gap-3 animate-in slide-in-from-top-4 ${
              testStatus.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
            }`}>
              <i className={`fa-solid ${testStatus.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'} text-lg`}></i>
              {testStatus.msg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetaWebhookConfig;
