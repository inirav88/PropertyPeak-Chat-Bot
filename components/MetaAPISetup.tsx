
import React from 'react';

const MetaAPISetup: React.FC<{ config: any }> = ({ config }) => {
  const curlExample = `curl -X POST \\
  'https://graph.facebook.com/${config.meta.apiVersion}/${config.meta.phoneNumberId || 'YOUR_PHONE_NUMBER_ID'}/messages' \\
  -H 'Authorization: Bearer ${config.meta.accessToken ? '********' : 'YOUR_ACCESS_TOKEN'}' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "messaging_product": "whatsapp",
    "to": "${config.meta.testRecipient || 'RECIPIENT_PHONE_NUMBER'}",
    "type": "template",
    "template": { "name": "hello_world", "language": { "code": "en_US" } }
  }'`;

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white p-8 rounded-3xl border border-slate-200">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Step 1: Live Number Status</h3>
            <p className="text-sm text-slate-500 mt-1">Status of your configured WhatsApp Business number.</p>
          </div>
          <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${config.meta.phoneNumberId ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
            {config.meta.phoneNumberId ? 'Configured' : 'Action Required'}
          </span>
        </div>
        
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-emerald-500">
               <i className="fa-brands fa-whatsapp text-xl"></i>
             </div>
             <div>
               <p className="text-sm font-bold text-slate-700">Active ID: {config.meta.phoneNumberId || 'None'}</p>
               <p className="text-[10px] text-slate-400 font-medium">WABA: {config.meta.wabaId || 'Not set'}</p>
             </div>
          </div>
          <button onClick={() => window.open('https://developers.facebook.com/apps/', '_blank')} className="text-blue-600 text-xs font-bold hover:underline">
            View in Meta Portal
          </button>
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-3xl overflow-hidden relative group">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-bold">Step 2: Test API Call (cURL)</h3>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(curlExample);
              alert("Snippet copied to clipboard!");
            }}
            className="text-emerald-400 text-xs font-black uppercase tracking-widest hover:text-emerald-300"
          >
            Copy Snippet
          </button>
        </div>
        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
          <pre className="text-emerald-400 font-mono text-[11px] leading-relaxed overflow-x-auto">
            {curlExample}
          </pre>
        </div>
        <p className="text-[10px] text-slate-500 mt-4 italic">Note: Access token is masked for security in this view.</p>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity"></div>
      </div>

      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
        <h4 className="text-blue-900 font-bold text-sm mb-2">Pro Tip: Development Mode</h4>
        <p className="text-blue-700 text-xs leading-relaxed">
          While your app is in "Development Mode" on Meta, you MUST add the recipient's phone number to the 
          <span className="font-bold"> WhatsApp > API Setup > To </span> whitelist dropdown on the Meta Dashboard before testing.
        </p>
      </div>
    </div>
  );
};

export default MetaAPISetup;
