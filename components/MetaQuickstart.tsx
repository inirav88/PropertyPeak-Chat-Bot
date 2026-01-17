
import React from 'react';

const MetaQuickstart: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <h3 className="text-2xl font-black text-slate-900 mb-6">Quickstart Guide</h3>
        <div className="space-y-8">
          {[
            { step: 1, title: 'Add a phone number', desc: 'Select a number to start sending messages.', status: 'Done' },
            { step: 2, title: 'Send a test message', desc: 'Test your setup by sending a message to yourself.', status: 'In Progress' },
            { step: 3, title: 'Configure webhooks', desc: 'Receive real-time notifications for incoming messages.', status: 'Pending' }
          ].map((s) => (
            <div key={s.step} className="flex gap-6 items-start">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${s.status === 'Done' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {s.status === 'Done' ? <i className="fa-solid fa-check"></i> : s.step}
              </div>
              <div className="flex-1 pb-8 border-b border-slate-50 last:border-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-slate-800">{s.title}</h4>
                  <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${s.status === 'Done' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 bg-slate-50'}`}>
                    {s.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500">{s.desc}</p>
                {s.status === 'In Progress' && (
                  <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-100">
                    Send Message
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MetaQuickstart;
