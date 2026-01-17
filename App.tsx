
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import FeatureToggle from './components/FeatureToggle';
import LeadCard from './components/LeadCard';
import BotSimulator from './components/BotSimulator';
import MetaWebhookConfig from './components/MetaWebhookConfig';
import TechProviderOnboarding from './components/TechProviderOnboarding';
import MetaPermissions from './components/MetaPermissions';
import MetaQuickstart from './components/MetaQuickstart';
import MetaAPISetup from './components/MetaAPISetup';
import MetaResources from './components/MetaResources';
import { INITIAL_FEATURES, DUMMY_LEADS } from './constants';
import { BotFeature, FeatureStatus, Lead } from './types';
import { DEFAULT_CONFIG } from './config';
import { saveToDatabase, loadFromDatabase } from './services/storageService';
import { sendWhatsAppMessage } from './services/whatsappService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeMetaSubTab, setActiveMetaSubTab] = useState('configuration');
  const [features, setFeatures] = useState<BotFeature[]>(INITIAL_FEATURES);
  const [leads, setLeads] = useState<Lead[]>(DUMMY_LEADS as Lead[]);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<{msg: string, type: 'success' | 'error' | 'warning', link?: string} | null>(null);

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

  const testWhatsAppConnection = async () => {
    if (!config.meta.testRecipient) {
      setTestStatus({ msg: "Please enter a 'Test Recipient Number' in the field below before testing.", type: 'error' });
      return;
    }
    setTestStatus({ msg: "Sending Test Message...", type: 'warning' });
    const result = await sendWhatsAppMessage(config.meta.testRecipient, "PropAI Dashboard: Connection Test Successful! 🚀", config);
    if (result.success) {
      setTestStatus({ msg: "Connection Verified!", type: 'success' });
    } else {
      setTestStatus({ msg: `Connection Failed: ${result.data?.error?.message}`, type: 'error', link: "https://developers.facebook.com/apps/" });
    }
  };

  const toggleFeature = (id: string) => {
    const updated = features.map(f => f.id === id ? { ...f, status: f.status === FeatureStatus.ENABLED ? FeatureStatus.DISABLED : FeatureStatus.ENABLED } : f);
    setFeatures(updated);
    syncData(undefined, updated);
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

        {activeTab === 'settings' && (
          <div className="flex gap-10">
            {/* Meta-style Sub Navigation */}
            <aside className="w-72 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm h-fit sticky top-10">
              <div className="flex items-center gap-3 mb-8 p-2 border-b border-slate-50">
                <i className="fa-brands fa-whatsapp text-blue-600 text-xl"></i>
                <span className="font-black text-xs uppercase tracking-widest text-slate-900">Customize use case</span>
              </div>
              <nav className="space-y-1">
                {[
                  { id: 'permissions', label: 'Permissions and features', icon: 'fa-shield-halved' },
                  { id: 'quickstart', label: 'Quickstart', icon: 'fa-bolt' },
                  { id: 'api_setup', label: 'API Setup', icon: 'fa-code' },
                  { id: 'configuration', label: 'Configuration', icon: 'fa-gears' },
                  { id: 'resources', label: 'Resources', icon: 'fa-book' },
                  { id: 'tech_onboarding', label: 'Tech Provider onboarding', icon: 'fa-user-group' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveMetaSubTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                      activeMetaSubTab === item.id 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <i className={`fa-solid ${item.icon} w-4`}></i>
                    {item.label}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Sub Content Area */}
            <div className="flex-1 space-y-8 animate-in fade-in duration-300">
               {activeMetaSubTab === 'configuration' && (
                 <>
                   <MetaWebhookConfig config={config} setConfig={setConfig} />
                   
                   <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-800 mb-6">Phone numbers</h3>
                      <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-sm text-slate-600 font-medium">
                          You have <span className="font-bold text-slate-900">0 production numbers</span> and <span className="font-bold text-slate-900">1 test number</span>.
                        </p>
                        <button className="bg-white border border-slate-200 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all">
                          Manage phone numbers
                        </button>
                      </div>
                   </div>

                   <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-center mb-10">
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">Connection Bridge</h3>
                          <p className="text-xs text-slate-400 mt-1">Credentials for Cloud API access</p>
                        </div>
                        <button onClick={testWhatsAppConnection} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg">Test Connection</button>
                      </div>

                      {testStatus && (
                        <div className={`mb-8 p-4 rounded-xl text-xs font-bold border ${testStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          {testStatus.msg}
                        </div>
                      )}

                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Phone Number ID</label>
                            <input type="text" value={config.meta.phoneNumberId} onChange={e => setConfig({...config, meta: {...config.meta, phoneNumberId: e.target.value}})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-mono text-xs outline-none" placeholder="109..." />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">WABA ID</label>
                            <input type="text" value={config.meta.wabaId} onChange={e => setConfig({...config, meta: {...config.meta, wabaId: e.target.value}})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-mono text-xs outline-none" placeholder="92..." />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Permanent Access Token</label>
                          <input type="password" value={config.meta.accessToken} onChange={e => setConfig({...config, meta: {...config.meta, accessToken: e.target.value}})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-mono text-xs outline-none" placeholder="EAAB..." />
                        </div>
                      </div>
                   </div>
                 </>
               )}

               {activeMetaSubTab === 'permissions' && <MetaPermissions />}
               {activeMetaSubTab === 'quickstart' && <MetaQuickstart />}
               {activeMetaSubTab === 'api_setup' && <MetaAPISetup config={config} />}
               {activeMetaSubTab === 'resources' && <MetaResources />}
               {activeMetaSubTab === 'tech_onboarding' && <TechProviderOnboarding />}
            </div>
          </div>
        )}

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

        {activeTab === 'features' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
              {features.map(f => <FeatureToggle key={f.id} feature={f} onToggle={toggleFeature} />)}
           </div>
        )}

        {activeTab === 'leads' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in">
              {leads.map(l => <LeadCard key={l.id} lead={l} />)}
           </div>
        )}

        {activeTab === 'simulator' && <BotSimulator config={config} />}

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
