
import React from 'react';

const MetaPermissions: React.FC = () => {
  const permissions = [
    { name: 'messages', description: 'Receive incoming messages and status updates', status: 'Subscribed' },
    { name: 'message_template_status_update', description: 'Updates when templates are approved or rejected', status: 'Subscribed' },
    { name: 'phone_number_name_update', description: 'Updates when a phone number name is updated', status: 'Pending' },
    { name: 'account_update', description: 'Receive updates for changes in the WABA', status: 'Subscribed' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">Webhook Fields</h3>
          <button className="text-blue-600 text-xs font-bold hover:underline">Manage all fields</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <th className="px-6 py-4">Field Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissions.map((p) => (
                <tr key={p.name} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-slate-700">{p.name}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{p.description}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${p.status === 'Subscribed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-800">
                      {p.status === 'Subscribed' ? 'Unsubscribe' : 'Subscribe'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MetaPermissions;
