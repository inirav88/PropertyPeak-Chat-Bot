
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  config: any;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, config }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
    { id: 'features', label: 'Bot Config', icon: 'fa-toggle-on' },
    { id: 'leads', label: 'Leads (CRM)', icon: 'fa-users' },
    { id: 'simulator', label: 'Simulator', icon: 'fa-comments' },
    { id: 'settings', label: 'System Settings', icon: 'fa-gears' },
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
        <p className="text-slate-400 text-[10px] mt-1 tracking-widest uppercase font-bold">Admin Console</p>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === item.id 
                ? activeClass 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-5`}></i>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800">
          <img src={`https://ui-avatars.com/api/?name=${config.identity.name}&background=random`} className="w-8 h-8 rounded-full" alt="User" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">Master Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
