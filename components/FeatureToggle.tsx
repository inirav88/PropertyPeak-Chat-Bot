
import React from 'react';
import { BotFeature, FeatureStatus } from '../types';

interface FeatureToggleProps {
  feature: BotFeature;
  onToggle: (id: string) => void;
}

const FeatureToggle: React.FC<FeatureToggleProps> = ({ feature, onToggle }) => {
  const isEnabled = feature.status === FeatureStatus.ENABLED;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
      <div className={`p-3 rounded-lg ${isEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
        <i className={`fa-solid ${feature.icon} text-xl`}></i>
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-semibold text-slate-800">{feature.name}</h3>
          <button 
            onClick={() => onToggle(feature.id)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              isEnabled ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <p className="text-sm text-slate-500 leading-snug">{feature.description}</p>
        <div className="mt-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
            isEnabled ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-50 text-slate-400 border border-slate-200'
          }`}>
            {isEnabled ? 'Active' : 'Disabled'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FeatureToggle;
