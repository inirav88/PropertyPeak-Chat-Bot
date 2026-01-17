
import React from 'react';

const TechProviderOnboarding: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Tech Provider Onboarding</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">
          If you are building a solution for other businesses, you can enable the Technical Provider onboarding flow. This allows you to manage their WhatsApp Business Accounts on their behalf.
        </p>
        
        <div className="flex items-center justify-between p-6 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-4">
            <i className="fa-solid fa-user-gear text-2xl text-blue-600"></i>
            <div>
              <p className="font-bold text-blue-900">Embedded Signup Flow</p>
              <p className="text-xs text-blue-700">Allow clients to connect their numbers through your interface.</p>
            </div>
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200">
            Setup Now
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-red-100 shadow-sm">
        <h3 className="text-lg font-bold text-red-900 mb-2">Danger Zone</h3>
        <p className="text-xs text-slate-500 mb-6">Manage business links and account deletion.</p>
        
        <div className="flex justify-between items-center p-6 border border-red-50 rounded-xl">
           <div>
             <p className="font-bold text-slate-800">Delete Business Portfolio</p>
             <p className="text-xs text-slate-400">This will unlink your application and delete your business portfolio data.</p>
           </div>
           <button className="bg-white border border-red-200 text-red-600 px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-red-50 transition-all">
             Delete
           </button>
        </div>
      </div>
    </div>
  );
};

export default TechProviderOnboarding;
