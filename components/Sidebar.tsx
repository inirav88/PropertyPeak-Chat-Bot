
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  config: any;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, config }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
    { id: 'features', label: 'Feature Toggles', icon: 'fa-toggle-on' },
    { id: 'property_types', label: 'Property Types', icon: 'fa-house-medical' },
    { id: 'flows', label: 'Chat Flows', icon: 'fa-route' },
    { id: 'leads', label: 'Leads (CRM)', icon: 'fa-users' },
    { id: 'finance_leads', label: 'Finance Leads', icon: 'fa-building-columns' },
    { id: 'simulator', label: 'Bot Simulator', icon: 'fa-comments' },
    { id: 'settings', label: 'Bot Settings', icon: 'fa-gears' },
  ];

  const activeClass = `bg-${config.identity.primaryColor}-600 text-white shadow-lg`;
  const iconColor = `text-${config.identity.primaryColor}-400`;

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <i className={`fa-solid ${config.identity.logoIcon} ${iconColor}`}></i>
          {config.identity.shortName || "PropAI"}
        </h1>
        <p className="text-slate-400 text-[10px] mt-1 tracking-widest uppercase font-bold">Admin Panel</p>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id 
                ? activeClass 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-5 text-sm`}></i>
            <span className="font-semibold text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
          <img src={`https://ui-avatars.com/api/?name=${config.identity.name}&background=random`} className="w-8 h-8 rounded-full border border-white/10" alt="User" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate">Admin User</p>
            <p className="text-[10px] text-slate-500">System Active</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
