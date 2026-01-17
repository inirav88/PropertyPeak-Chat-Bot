
import React, { useState } from 'react';

interface PropertyType {
  id: string;
  name: string;
  icon: string;
  active: boolean;
}

interface PropertyTypeManagerProps {
  config: any;
  setConfig: (config: any) => void;
}

const PropertyTypeManager: React.FC<PropertyTypeManagerProps> = ({ config, setConfig }) => {
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeIcon, setNewTypeIcon] = useState('fa-house');

  const updateTypes = (updatedTypes: PropertyType[]) => {
    setConfig({
      ...config,
      propertyTypes: updatedTypes
    });
  };

  const handleAddType = () => {
    if (!newTypeName.trim()) return;
    const newType: PropertyType = {
      id: Date.now().toString(),
      name: newTypeName,
      icon: newTypeIcon,
      active: true
    };
    updateTypes([...config.propertyTypes, newType]);
    setNewTypeName('');
    setNewTypeIcon('fa-house');
  };

  const toggleStatus = (id: string) => {
    const updated = config.propertyTypes.map((t: PropertyType) => 
      t.id === id ? { ...t, active: !t.active } : t
    );
    updateTypes(updated);
  };

  const deleteType = (id: string) => {
    const updated = config.propertyTypes.filter((t: PropertyType) => t.id !== id);
    updateTypes(updated);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 mb-6">Define Property Categories</h3>
        
        <div className="flex flex-wrap gap-4 mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
          <div className="flex-1 min-w-[200px] space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400">Type Name</label>
            <input 
              type="text" 
              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none"
              placeholder="e.g. Studio Apartment"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
            />
          </div>
          <div className="w-48 space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400">FA Icon Class</label>
            <input 
              type="text" 
              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none font-mono"
              placeholder="fa-house"
              value={newTypeIcon}
              onChange={(e) => setNewTypeIcon(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleAddType}
              className="bg-emerald-600 text-white px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
            >
              Add Type
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {config.propertyTypes.map((type: PropertyType) => (
            <div key={type.id} className={`p-6 rounded-3xl border transition-all ${type.active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${type.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                  <i className={`fa-solid ${type.icon}`}></i>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => toggleStatus(type.id)}
                    className={`w-10 h-6 rounded-full transition-colors relative ${type.active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${type.active ? 'translate-x-4' : ''}`}></span>
                  </button>
                  <button 
                    onClick={() => deleteType(type.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <i className="fa-solid fa-trash-can text-sm"></i>
                  </button>
                </div>
              </div>
              <h4 className="font-bold text-slate-800">{type.name}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                {type.active ? 'Available in Bot' : 'Hidden from Bot'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyTypeManager;
