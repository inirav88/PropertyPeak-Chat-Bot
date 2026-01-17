
import React from 'react';

const MetaResources: React.FC = () => {
  const resources = [
    { title: 'API Documentation', icon: 'fa-book', color: 'bg-blue-500', link: 'https://developers.facebook.com/docs/whatsapp/cloud-api' },
    { title: 'Business Help Center', icon: 'fa-circle-question', color: 'bg-purple-500', link: '#' },
    { title: 'Billing & Pricing', icon: 'fa-credit-card', color: 'bg-emerald-500', link: 'https://business.facebook.com/billing_hub' },
    { title: 'Developer Community', icon: 'fa-comments', color: 'bg-orange-500', link: '#' }
  ];

  return (
    <div className="grid grid-cols-2 gap-6 animate-in fade-in">
      {resources.map((r) => (
        <a key={r.title} href={r.link} target="_blank" rel="noopener noreferrer" className="bg-white p-8 rounded-[2rem] border border-slate-200 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-50 transition-all group">
          <div className={`w-12 h-12 ${r.color} text-white rounded-xl flex items-center justify-center text-xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
            <i className={`fa-solid ${r.icon}`}></i>
          </div>
          <h4 className="text-lg font-bold text-slate-800">{r.title}</h4>
          <p className="text-xs text-slate-400 mt-1">Explore official {r.title.toLowerCase()} for Meta integration.</p>
        </a>
      ))}
    </div>
  );
};

export default MetaResources;
