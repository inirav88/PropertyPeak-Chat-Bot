
import React from 'react';
import { Lead } from '../types';

interface LeadCardProps {
  lead: Lead;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, isSelected, onToggleSelect }) => {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'New': return 'bg-blue-100 text-blue-700';
      case 'Contacted': return 'bg-amber-100 text-amber-700';
      case 'Visit Done': return 'bg-purple-100 text-purple-700';
      case 'Closed': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getSourceIcon = (source?: string) => {
    if (source?.toLowerCase().includes('whatsapp')) return 'fa-brands fa-whatsapp text-emerald-500';
    if (source?.toLowerCase().includes('facebook')) return 'fa-brands fa-facebook text-blue-600';
    if (source?.toLowerCase().includes('portal')) return 'fa-solid fa-globe text-indigo-500';
    return 'fa-solid fa-hashtag text-slate-400';
  };

  return (
    <div className={`relative bg-white p-4 rounded-2xl border transition-all group ${
      isSelected 
        ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg' 
        : 'border-slate-200 shadow-sm hover:shadow-md'
    }`}>
      {/* Checkbox Overlay */}
      <div className={`absolute top-3 left-3 z-10 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <input 
          type="checkbox" 
          checked={isSelected}
          onChange={onToggleSelect}
          className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
        />
      </div>

      <div className="flex justify-between items-start mb-3 ml-7">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
            {lead.name.charAt(0)}
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 truncate max-w-[120px]">{lead.name}</h4>
            <p className="text-[10px] text-slate-500">{lead.phone}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
           <span className="text-[10px] font-medium text-slate-400 mb-1">{lead.lastActive}</span>
           <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${getStatusColor(lead.status)}`}>
            {lead.status}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="bg-slate-50 p-2 rounded-xl">
          <p className="text-[9px] uppercase text-slate-400 font-black tracking-tighter">Type</p>
          <p className="text-xs font-bold text-slate-700">{lead.type}</p>
        </div>
        <div className="bg-slate-50 p-2 rounded-xl">
          <p className="text-[9px] uppercase text-slate-400 font-black tracking-tighter">Budget</p>
          <p className="text-xs font-bold text-slate-700">{lead.budget}</p>
        </div>
      </div>

      <div className="mb-4 px-2 py-1.5 bg-slate-50 rounded-xl flex items-center gap-2">
        <i className={`${getSourceIcon(lead.leadSource)} text-[10px]`}></i>
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Source: {lead.leadSource || 'Organic'}</span>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${lead.score}%` }}></div>
          </div>
          <span className="text-[10px] font-black text-emerald-600">{lead.score}%</span>
        </div>
        <button className="text-[10px] text-emerald-600 font-black hover:underline uppercase tracking-tighter">
          Timeline <i className="fa-solid fa-chevron-right ml-1"></i>
        </button>
      </div>
    </div>
  );
};

export default LeadCard;
