
import React from 'react';

interface MetaWebhookConfigProps {
  config: any;
  setConfig: (config: any) => void;
}

const MetaWebhookConfig: React.FC<MetaWebhookConfigProps> = ({ config, setConfig }) => {
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [callbackUrl, setCallbackUrl] = React.useState(config.meta?.webhookUrl || '');
  const [verifyToken, setVerifyToken] = React.useState(config.meta?.webhookVerifyToken || '');

  const handleVerifyAndSave = () => {
    setIsVerifying(true);
    // Simulate Meta's handshake
    setTimeout(() => {
      setConfig({
        ...config,
        meta: {
          ...config.meta,
          webhookUrl: callbackUrl,
          webhookVerifyToken: verifyToken
        }
      });
      setIsVerifying(false);
      alert("Webhook configuration saved! Ensure your backend endpoint handles the GET challenge correctly.");
    }, 1500);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-800">Webhook</h3>
        <p className="text-sm text-slate-500 mt-1">
          To get alerted when you receive a message or when a message's status has changed, you need to set up a Webhooks endpoint.
        </p>
      </div>
      
      <div className="p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
            Callback URL <i className="fa-solid fa-circle-info text-[10px]"></i>
          </label>
          <input 
            type="text" 
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            placeholder="https://your-domain.com/api/whatsapp/webhook"
            value={callbackUrl}
            onChange={(e) => setCallbackUrl(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
            Verify Token <i className="fa-solid fa-circle-info text-[10px]"></i>
          </label>
          <input 
            type="text" 
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            placeholder="e.g. propai_secure_token_2025"
            value={verifyToken}
            onChange={(e) => setVerifyToken(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 py-4 border-t border-slate-100">
          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 cursor-not-allowed">
            <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
          </div>
          <span className="text-sm text-slate-400">Attach a client certificate to Webhook requests. <a href="#" className="text-blue-600">Learn more.</a></span>
        </div>
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
        <button className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-400 hover:bg-slate-200 transition-all">
          Remove subscription
        </button>
        <button 
          onClick={handleVerifyAndSave}
          disabled={isVerifying}
          className="px-8 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-600 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          {isVerifying ? <i className="fa-solid fa-spinner animate-spin"></i> : null}
          Verify and save
        </button>
      </div>
    </div>
  );
};

export default MetaWebhookConfig;
