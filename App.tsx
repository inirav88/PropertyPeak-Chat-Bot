
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import FeatureToggle from './components/FeatureToggle';
import LeadCard from './components/LeadCard';
import BotSimulator from './components/BotSimulator';
import MetaWebhookConfig from './components/MetaWebhookConfig';
import PropertyTypeManager from './components/PropertyTypeManager';
import MetaAPISetup from './components/MetaAPISetup';
import ChatFlowBuilder from './components/ChatFlowBuilder';
import { INITIAL_FEATURES, DUMMY_LEADS } from './constants';
import { BotFeature, FeatureStatus, Lead } from './types';
import { DEFAULT_CONFIG } from './config';
import { saveToDatabase, loadFromDatabase } from './services/storageService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeMetaSubTab, setActiveMetaSubTab] = useState('configuration');
  const [features, setFeatures] = useState<BotFeature[]>(INITIAL_FEATURES);
  const [leads, setLeads] = useState<Lead[]>(DUMMY_LEADS as Lead[]);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    // Correctly await the promise from loadFromDatabase
    const initData = async () => {
      const savedData = await loadFromDatabase();
      if (savedData) {
        if (savedData.features) setFeatures(savedData.features);
        if (savedData.leads) setLeads(savedData.leads);
        if (savedData.config) setConfig(savedData.config);
      }
    };
    initData();
  }, []);

  const syncData = (updatedConfig?: any, updatedFeatures?: BotFeature[]) => {
    saveToDatabase({
      features: updatedFeatures || features,
      leads: leads,
      config: updatedConfig || config
    });
  };

  const handleSaveAll = () => {
    setSaveStatus("Settings Saved Successfully");
    syncData();
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const toggleFeature = (id: string) => {
    const updated = features.map(f => f.id === id ? { ...f, status: f.status === FeatureStatus.ENABLED ? FeatureStatus.DISABLED : FeatureStatus.ENABLED } : f);
    setFeatures(updated);
    syncData(undefined, updated);
  };

  const getHeaderTitle = (tab: string) => {
    switch(tab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'features': return 'Feature Management';
      case 'property_types': return 'Property Type Config';
      case 'flows': return 'Chat Flow Architect';
      case 'leads': return 'Leads & CRM';
      case 'finance_leads': return 'Finance & Loan Inquiries';
      case 'simulator': return 'WhatsApp Bot Simulator';
      case 'settings': return 'Global Bot Settings';
      default: return tab;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-['Inter']">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} config={config} />
      
      <main className="flex-1 ml-64 p-10 pb-40">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight capitalize">{getHeaderTitle(activeTab)}</h2>
            <p className="text-slate-500 text-sm mt-1.5 font-medium">Control and monitor your smart real estate ecosystem.</p>
          </div>
          {saveStatus && (
            <div className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-500/20 animate-in fade-in slide-in-from-top-4 border border-emerald-400/30">
              <i className="fa-solid fa-circle-check mr-2"></i> {saveStatus}
            </div>
          )}
        </header>

        {activeTab === 'dashboard' && (
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in duration-500">
              {['Active Agents', 'Property Types', 'Total Leads', 'AI Engine'].map((l, i) => (
                <div key={i} className="bg-white p-7 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-xl transition-all group">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-[0.1em]">{l}</p>
                  <h4 className="text-3xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {[config.agents.length, config.propertyTypes.length, leads.length, config.api.aiEnabled ? 'Active' : 'Flow-Only'][i]}
                  </h4>
                </div>
              ))}
           </div>
        )}

        {activeTab === 'features' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
              {features.map(f => <FeatureToggle key={f.id} feature={f} onToggle={toggleFeature} />)}
           </div>
        )}

        {activeTab === 'property_types' && (
          <PropertyTypeManager config={config} setConfig={setConfig} />
        )}

        {activeTab === 'flows' && (
          <ChatFlowBuilder config={config} setConfig={setConfig} />
        )}

        {activeTab === 'leads' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
              {leads.map(l => <LeadCard key={l.id} lead={l} />)}
           </div>
        )}

        {activeTab === 'finance_leads' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm flex justify-between items-center">
              <div>
                <h3 className="font-black text-slate-900 text-xl">Finance & Home Loan Leads</h3>
                <p className="text-sm text-slate-500 mt-1">Qualified prospects requiring financial assistance.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
              {leads.filter(l => l.type === 'Buyer').map(l => (
                <LeadCard key={l.id} lead={{...l, budget: 'Loan Inquiry', status: 'New'}} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'simulator' && <BotSimulator config={config} />}

        {activeTab === 'settings' && (
          <div className="flex gap-10">
            <aside className="w-64 space-y-3">
              {['Configuration', 'Meta Integration'].map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveMetaSubTab(item.toLowerCase().replace(' ', '_'))}
                  className={`w-full text-left px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
                    activeMetaSubTab === item.toLowerCase().replace(' ', '_') 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                      : 'text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200'
                  }`}
                >
                  {item}
                </button>
              ))}
            </aside>
            <div className="flex-1">
              {activeMetaSubTab === 'configuration' && <MetaWebhookConfig config={config} setConfig={setConfig} />}
              {activeMetaSubTab === 'meta_integration' && <MetaAPISetup config={config} />}
            </div>
          </div>
        )}

        <div className="fixed bottom-10 left-64 right-0 flex justify-center z-50 pointer-events-none">
          <button 
            onClick={handleSaveAll} 
            className="pointer-events-auto px-12 py-5 bg-slate-900 text-white font-black rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:bg-slate-800 hover:shadow-[0_25px_50px_rgba(0,0,0,0.4)] transition-all active:scale-95 flex items-center gap-3 uppercase text-xs tracking-[0.2em] border border-white/10"
          >
            <i className="fa-solid fa-cloud-arrow-up"></i> Sync Environment
          </button>
        </div>
      </main>
    </div>
  );
};

export default App;
