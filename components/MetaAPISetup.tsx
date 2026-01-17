
import React from 'react';

const MetaAPISetup: React.FC<{ config: any }> = ({ config }) => {
  const curlExample = `curl -X POST \\
  'https://graph.facebook.com/${config.meta.apiVersion}/${config.meta.phoneNumberId}/messages' \\
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "messaging_product": "whatsapp",
    "to": "RECIPIENT_PHONE_NUMBER",
    "type": "template",
    "template": { "name": "hello_world", "language": { "code": "en_US" } }
  }'`;

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white p-8 rounded-3xl border border-slate-200">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Step 1: Select phone numbers</h3>
            <p className="text-sm text-slate-500 mt-1">Select the number you want to use for the API.</p>
          </div>
          <button className="text-blue-600 font-bold text-sm">Add Phone Number</button>
        </div>
        
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-emerald-500">
               <i className="fa-brands fa-whatsapp text-xl"></i>
             </div>
             <div>
               <p className="text-sm font-bold text-slate-700">Test Number (+1 555-0123)</p>
               <p className="text-[10px] text-slate-400 font-medium">ID: {config.meta.phoneNumberId || 'Not Configured'}</p>
             </div>
          </div>
          <i className="fa-solid fa-chevron-down text-slate-300"></i>
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-3xl overflow-hidden relative group">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-bold">Step 2: Send messages with the API</h3>
          <button className="text-emerald-400 text-xs font-black uppercase tracking-widest">Copy Code</button>
        </div>
        <pre className="text-emerald-400 font-mono text-[11px] leading-relaxed overflow-x-auto pb-4">
          {curlExample}
        </pre>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity"></div>
      </div>
    </div>
  );
};

export default MetaAPISetup;
