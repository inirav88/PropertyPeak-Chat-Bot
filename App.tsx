
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import FeatureToggle from './components/FeatureToggle';
import LeadCard from './components/LeadCard';
import BotSimulator from './components/BotSimulator';
import { INITIAL_FEATURES, DUMMY_LEADS } from './constants';
import { BotFeature, FeatureStatus, Lead } from './types';
import { DEFAULT_CONFIG } from './config';
import { saveToDatabase, loadFromDatabase } from './services/storageService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [features, setFeatures] = useState<BotFeature[]>(INITIAL_FEATURES);
  const [leads, setLeads] = useState<Lead[]>(DUMMY_LEADS as Lead[]);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // New Management States
  const [newPropName, setNewPropName] = useState('');
  const [newAgent, setNewAgent] = useState({ name: '', role: '', specialty: '', image: '' });
  const [newFlowStep, setNewFlowStep] = useState({ step: '', message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedData = loadFromDatabase();
    if (savedData) {
      if (savedData.features) setFeatures(savedData.features);
      if (savedData.leads) setLeads(savedData.leads);
      if (savedData.config) setConfig(savedData.config);
    }
  }, []);

  const syncData = (updatedConfig?: any, updatedFeatures?: BotFeature[]) => {
    saveToDatabase({
      features: updatedFeatures || features,
      leads: leads,
      config: updatedConfig || config
    });
  };

  const handleSaveAll = () => {
    setSaveStatus("Infrastructure State Committed");
    syncData();
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Agent Management
  const addAgent = () => {
    if (!newAgent.name) return;
    const agent = { id: Date.now().toString(), ...newAgent, active: false };
    const updated = { ...config, agents: [...config.agents, agent] };
    setConfig(updated);
    syncData(updated);
    setNewAgent({ name: '', role: '', specialty: '', image: '' });
  };

  const setPrimaryAgent = (id: string) => {
    const updated = { 
      ...config, 
      activeAgentId: id, 
      agents: config.agents.map(a => ({ ...a, active: a.id === id })) 
    };
    setConfig(updated);
    syncData(updated);
  };

  const handleAgentImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewAgent({ ...newAgent, image: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  // Property Vertical Management
  const addPropertyType = () => {
    if (!newPropName.trim()) return;
    const vertical = { id: Date.now().toString(), name: newPropName, icon: 'fa-house-flag', active: true };
    const updated = { ...config, propertyTypes: [...config.propertyTypes, vertical] };
    setConfig(updated);
    syncData(updated);
    setNewPropName('');
  };

  const togglePropertyType = (id: string) => {
    const updated = { 
      ...config, 
      propertyTypes: config.propertyTypes.map(p => p.id === id ? { ...p, active: !p.active } : p) 
    };
    setConfig(updated);
    syncData(updated);
  };

  // Existing Feature Toggle Logic
  const toggleFeature = (id: string) => {
    const updated = features.map(f => f.id === id ? { ...f, status: f.status === FeatureStatus.ENABLED ? FeatureStatus.DISABLED : FeatureStatus.ENABLED } : f);
    setFeatures(updated);
    syncData(undefined, updated);
  };

  const addFlowStep = () => {
    if (!newFlowStep.step || !newFlowStep.message) return;
    const step = { id: Date.now().toString(), ...newFlowStep, type: 'input' };
    const updated = { ...config, chatFlow: [...config.chatFlow, step] };
    setConfig(updated);
    syncData(updated);
    setNewFlowStep({ step: '', message: '' });
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} config={config} />
      
      <main className="flex-1 ml-64 p-10 pb-40">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight capitalize">{activeTab.replace('_', ' ')}</h2>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Enterprise Bot Control</p>
          </div>
          {saveStatus && (
            <div className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl animate-bounce">
              <i className="fa-solid fa-cloud-check mr-2"></i> {saveStatus}
            </div>
          )}
        </header>

        {activeTab === 'features' && (
          <div className="space-y-16 animate-in fade-in duration-500">
            {/* Agent Profile Manager */}
            <section className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-2xl font-black flex items-center gap-3">
                    <i className="fa-solid fa-user-astronaut text-emerald-400"></i> Agent Identity Center
                  </h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Configure persona profiles & avatars</p>
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-[2rem] border border-white/10">
                   <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleAgentImage} />
                      <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                        {newAgent.image ? <img src={newAgent.image} className="w-full h-full object-cover" /> : <i className="fa-solid fa-camera text-slate-400"></i>}
                      </div>
                   </div>
                   <input type="text" placeholder="Name" className="bg-transparent border-b border-white/20 px-2 py-1 outline-none text-sm w-32" value={newAgent.name} onChange={e => setNewAgent({...newAgent, name: e.target.value})} />
                   <input type="text" placeholder="Role" className="bg-transparent border-b border-white/20 px-2 py-1 outline-none text-sm w-32" value={newAgent.role} onChange={e => setNewAgent({...newAgent, role: e.target.value})} />
                   <button onClick={addAgent} className="bg-indigo-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all">Add Agent</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {config.agents.map(agent => (
                  <div key={agent.id} className={`p-6 rounded-[2.5rem] border-2 transition-all ${agent.active ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-white/5'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <img src={agent.image || `https://ui-avatars.com/api/?name=${agent.name}&background=random`} className="w-14 h-14 rounded-2xl object-cover shadow-2xl border-2 border-white/10" />
                      {!agent.active && <button onClick={() => setPrimaryAgent(agent.id)} className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-[10px]"><i className="fa-solid fa-power-off"></i></button>}
                    </div>
                    <h4 className="font-black text-lg text-white">{agent.name}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{agent.role}</p>
                    {agent.active && <span className="mt-4 inline-block text-[8px] font-black uppercase bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">Active Identity</span>}
                  </div>
                ))}
              </div>
            </section>

            {/* Property Types / Verticals Config */}
            <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-xl font-black text-slate-800">Business Verticals</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Manage property segment focus</p>
                </div>
                <div className="flex gap-3">
                  <input type="text" placeholder="e.g. Industrial" className="bg-slate-50 border border-slate-200 px-6 py-3 rounded-2xl text-sm font-bold outline-none focus:border-indigo-600" value={newPropName} onChange={e => setNewPropName(e.target.value)} />
                  <button onClick={addPropertyType} className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><i className="fa-solid fa-plus"></i></button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {config.propertyTypes.map(p => (
                  <div key={p.id} className={`p-8 rounded-[2.5rem] border-2 flex flex-col items-center gap-4 transition-all cursor-pointer ${p.active ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xl shadow-indigo-100' : 'border-slate-50 bg-slate-50 text-slate-400 grayscale'}`} onClick={() => togglePropertyType(p.id)}>
                    <i className={`fa-solid ${p.icon} text-3xl`}></i>
                    <span className="font-black text-[10px] uppercase tracking-widest text-center">{p.name}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Intelligence Modules Matrix */}
            <section>
              <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                <i className="fa-solid fa-puzzle-piece text-indigo-500"></i> Intelligence Modules
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map(f => <FeatureToggle key={f.id} feature={f} onToggle={toggleFeature} />)}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-12 max-w-5xl animate-in fade-in">
            {/* Master AI Intelligence Hub */}
            <section className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
               <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl">
                      <i className="fa-solid fa-brain-circuit"></i>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">AI Engine Control</h3>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Master AI Toggle & Provider Creds</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setConfig({...config, api: {...config.api, aiEnabled: !config.api.aiEnabled}})}
                    className={`h-9 w-18 rounded-full transition-all flex items-center px-1 ${config.api.aiEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <div className={`h-7 w-7 bg-white rounded-full transition-transform ${config.api.aiEnabled ? 'translate-x-9' : 'translate-x-0'}`} />
                  </button>
               </div>

               <div className={`space-y-8 transition-all ${!config.api.aiEnabled ? 'opacity-30 grayscale pointer-events-none' : 'opacity-100'}`}>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4 block">Select Active AI Provider</label>
                    <div className="grid grid-cols-4 gap-4">
                      {['gemini', 'openai', 'grok', 'custom'].map(p => (
                        <button 
                          key={p} 
                          onClick={() => setConfig({...config, api: {...config.api, provider: p as any}})}
                          className={`p-6 rounded-[2rem] border-2 font-black text-[10px] uppercase tracking-widest transition-all ${config.api.provider === p ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xl shadow-indigo-100' : 'border-slate-50 bg-slate-50 text-slate-300 hover:border-slate-200'}`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                    <h4 className="text-xs font-black uppercase text-slate-500 mb-6 flex items-center gap-2">
                      <i className="fa-solid fa-shield-halved text-indigo-500"></i> {config.api.provider} Credentials Configuration
                    </h4>
                    
                    {config.api.provider === 'gemini' && (
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Google AI Studio API Key</label>
                        <input type="password" value={config.api.geminiKey} onChange={e => setConfig({...config, api: {...config.api, geminiKey: e.target.value}})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-mono text-xs outline-none" placeholder="Enter Gemini Key..." />
                      </div>
                    )}

                    {config.api.provider === 'openai' && (
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">OpenAI Secret Key</label>
                          <input type="password" value={config.api.openaiKey} onChange={e => setConfig({...config, api: {...config.api, openaiKey: e.target.value}})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-mono text-xs outline-none" placeholder="sk-..." />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Organization ID</label>
                          <input type="text" value={config.api.openaiOrg} onChange={e => setConfig({...config, api: {...config.api, openaiOrg: e.target.value}})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-mono text-xs outline-none" placeholder="org-..." />
                        </div>
                      </div>
                    )}

                    {config.api.provider === 'grok' && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">xAI API Key</label>
                          <input type="password" value={config.api.grokKey} onChange={e => setConfig({...config, api: {...config.api, grokKey: e.target.value}})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-mono text-xs outline-none" placeholder="xai-..." />
                        </div>
                      </div>
                    )}
                  </div>
               </div>
            </section>

            {/* Meta Cloud API Section */}
            <section className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm border-l-[12px] border-l-blue-600">
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl shadow-xl shadow-blue-100">
                    <i className="fa-brands fa-whatsapp"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Meta Cloud API (WhatsApp)</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Production Bridge Settings</p>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                      <i className="fa-solid fa-hashtag text-[8px]"></i> Phone Number ID
                    </label>
                    <input 
                      type="text" 
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-mono text-xs outline-none focus:border-blue-600 transition-colors" 
                      value={config.meta?.phoneNumberId} 
                      onChange={e => setConfig({...config, meta: {...config.meta, phoneNumberId: e.target.value}})} 
                      placeholder="e.g. 109XXXXXXXXXXXX" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                      <i className="fa-solid fa-briefcase text-[8px]"></i> WABA ID
                    </label>
                    <input 
                      type="text" 
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-mono text-xs outline-none focus:border-blue-600 transition-colors" 
                      value={config.meta?.wabaId} 
                      onChange={e => setConfig({...config, meta: {...config.meta, wabaId: e.target.value}})} 
                      placeholder="e.g. 92XXXXXXXXXXXXX" 
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                      <i className="fa-solid fa-key text-[8px]"></i> Permanent Access Token
                    </label>
                    <div className="relative">
                      <input 
                        type="password" 
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-mono text-xs outline-none focus:border-blue-600 transition-colors pr-12" 
                        value={config.meta?.accessToken} 
                        onChange={e => setConfig({...config, meta: {...config.meta, accessToken: e.target.value}})} 
                        placeholder="EAABw..." 
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                        <i className="fa-solid fa-lock text-sm"></i>
                      </div>
                    </div>
                  </div>
               </div>
               <div className="mt-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                 <p className="text-[10px] text-blue-800 font-bold uppercase leading-relaxed">
                   <i className="fa-solid fa-circle-info mr-2"></i>
                   Ensure these credentials match your Meta Business App settings to enable live WhatsApp messaging.
                 </p>
               </div>
            </section>

            {/* Automation & Lead Sync */}
            <section className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm border-l-[12px] border-l-emerald-600">
               <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl shadow-xl shadow-emerald-100">
                      <i className="fa-solid fa-table-list"></i>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Automation & Lead Sync</h3>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Google Sheets & CRM Integration</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setConfig({...config, automation: {...config.automation, googleSheetsEnabled: !config.automation.googleSheetsEnabled}})}
                    className={`h-9 w-18 rounded-full transition-all flex items-center px-1 ${config.automation.googleSheetsEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <div className={`h-7 w-7 bg-white rounded-full transition-transform ${config.automation.googleSheetsEnabled ? 'translate-x-9' : 'translate-x-0'}`} />
                  </button>
               </div>
               
               <div className={`space-y-6 transition-all ${!config.automation.googleSheetsEnabled ? 'opacity-30 grayscale pointer-events-none' : 'opacity-100'}`}>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Google Apps Script Webhook URL</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-mono text-xs outline-none focus:border-emerald-600" 
                        value={config.automation?.sheetsEndpoint} 
                        onChange={e => setConfig({...config, automation: {...config.automation, sheetsEndpoint: e.target.value}})} 
                        placeholder="https://script.google.com/macros/s/.../exec" 
                      />
                    </div>
                  </div>
               </div>
            </section>
          </div>
        )}

        {activeTab === 'simulator' && <BotSimulator config={config} />}
        {activeTab === 'dashboard' && (
           <div className="grid grid-cols-4 gap-6 animate-in fade-in">
              {['Active Agents', 'Property Types', 'Sync Status', 'AI Status'].map((l, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{l}</p>
                  <h4 className="text-3xl font-black text-slate-800 tracking-tighter">
                    {[config.agents.length, config.propertyTypes.length, config.automation.googleSheetsEnabled ? 'Enabled' : 'Off', config.api.aiEnabled ? 'Online' : 'Disabled'][i]}
                  </h4>
                </div>
              ))}
           </div>
        )}

        {activeTab === 'leads' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in">
              {leads.map(l => <LeadCard key={l.id} lead={l} />)}
           </div>
        )}

        <div className="fixed bottom-12 left-64 right-0 flex justify-center z-50 pointer-events-none">
          <button onClick={handleSaveAll} className="pointer-events-auto px-16 py-6 bg-slate-900 text-white font-black rounded-full shadow-3xl uppercase tracking-[0.3em] text-xs flex items-center gap-4 hover:-translate-y-2 transition-transform border-4 border-white/10 active:scale-95">
            <i className="fa-solid fa-rocket text-indigo-400"></i> Commit Infrastructure State
          </button>
        </div>
      </main>
    </div>
  );
};

export default App;
