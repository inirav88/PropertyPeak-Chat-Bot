
import React, { useState } from 'react';

interface ChatStep {
  id: string;
  step: string;
  message: string;
  type: 'selection' | 'input';
  options?: string[];
}

interface ChatFlowBuilderProps {
  config: any;
  setConfig: (config: any) => void;
}

const ChatFlowBuilder: React.FC<ChatFlowBuilderProps> = ({ config, setConfig }) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const updateFlow = (newFlow: ChatStep[]) => {
    setConfig({
      ...config,
      chatFlow: newFlow
    });
  };

  const handleAddStep = () => {
    const newStep: ChatStep = {
      id: `stage_${Date.now()}`,
      step: 'Strategic Interaction Stage',
      message: 'Greetings. Please specify your preference.',
      type: 'selection',
      options: ['Preference A', 'Preference B']
    };
    updateFlow([...config.chatFlow, newStep]);
    setEditingId(newStep.id);
  };

  const handleDeleteStep = (id: string) => {
    updateFlow(config.chatFlow.filter((s: ChatStep) => s.id !== id));
  };

  const handleUpdateStep = (id: string, field: keyof ChatStep, value: any) => {
    const updated = config.chatFlow.map((s: ChatStep) => 
      s.id === id ? { ...s, [field]: value } : s
    );
    updateFlow(updated);
  };

  const handleOptionChange = (stepId: string, optIndex: number, newValue: string) => {
    const step = config.chatFlow.find((s: ChatStep) => s.id === stepId);
    if (!step || !step.options) return;
    
    const newOptions = [...step.options];
    newOptions[optIndex] = newValue;
    handleUpdateStep(stepId, 'options', newOptions);
  };

  const addOption = (stepId: string) => {
    const step = config.chatFlow.find((s: ChatStep) => s.id === stepId);
    if (!step) return;
    const newOptions = [...(step.options || []), 'New Strategic Option'];
    handleUpdateStep(stepId, 'options', newOptions);
  };

  const removeOption = (stepId: string, optIndex: number) => {
    const step = config.chatFlow.find((s: ChatStep) => s.id === stepId);
    if (!step || !step.options) return;
    const newOptions = step.options.filter((_: any, i: number) => i !== optIndex);
    handleUpdateStep(stepId, 'options', newOptions);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-2xl font-black text-slate-900">Engagement Strategy Designer</h3>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-[0.2em] font-black">Configure Professional Communication Protocols</p>
        </div>
        <button 
          onClick={handleAddStep}
          className="bg-emerald-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
        >
          <i className="fa-solid fa-plus-circle"></i> Create Strategy Stage
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 pb-40">
        {config.chatFlow.map((step: ChatStep, index: number) => (
          <div 
            key={step.id} 
            className={`bg-white rounded-[2.5rem] border transition-all overflow-hidden ${
              editingId === step.id ? 'border-emerald-500 ring-4 ring-emerald-50 shadow-2xl' : 'border-slate-200 shadow-sm hover:shadow-md'
            }`}
          >
            <div className="p-8 flex items-start justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg ${editingId === step.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {index + 1}
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">{step.step}</h4>
                  <div className="flex items-center gap-3 mt-1">
                     <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${step.type === 'selection' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                      {step.type === 'selection' ? 'Structured Response' : 'Consultative Input'}
                    </span>
                    <span className="text-[8px] text-slate-300 font-bold uppercase tracking-widest">Protocol ID: {step.id}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setEditingId(editingId === step.id ? null : step.id)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    editingId === step.id ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <i className={`fa-solid ${editingId === step.id ? 'fa-check' : 'fa-pen-to-square'}`}></i>
                </button>
                <button 
                  onClick={() => handleDeleteStep(step.id)}
                  className="w-12 h-12 rounded-2xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>

            {editingId === step.id && (
              <div className="px-8 pb-8 border-t border-slate-50 pt-8 space-y-8 animate-in slide-in-from-top-4">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Internal Stage Reference</label>
                    <input 
                      type="text" 
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500 transition-all"
                      value={step.step}
                      onChange={(e) => handleUpdateStep(step.id, 'step', e.target.value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Interaction Protocol</label>
                    <select 
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black outline-none appearance-none cursor-pointer focus:border-emerald-500"
                      value={step.type}
                      onChange={(e) => handleUpdateStep(step.id, 'type', e.target.value)}
                    >
                      <option value="selection">Structured Selection (Interactive)</option>
                      <option value="input">Advisory Input (Free Text)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Advisory Content (Visible to Client)</label>
                  <textarea 
                    className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-sm font-medium outline-none focus:border-emerald-500 h-32 resize-none leading-relaxed transition-all"
                    placeholder="Compose professional engagement script..."
                    value={step.message}
                    onChange={(e) => handleUpdateStep(step.id, 'message', e.target.value)}
                  />
                </div>

                {step.type === 'selection' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Interactive Response Options</label>
                      <button 
                        onClick={() => addOption(step.id)}
                        className="text-[10px] font-black text-emerald-600 uppercase hover:underline flex items-center gap-1"
                      >
                        <i className="fa-solid fa-plus-circle"></i> Add Strategic Option
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {step.options?.map((opt, i) => (
                        <div key={i} className="flex items-center gap-3 group">
                          <div className="flex-1 relative">
                            <input 
                              type="text" 
                              className="w-full p-4 bg-white border-2 border-emerald-100 rounded-xl text-xs font-bold outline-none focus:border-emerald-500"
                              value={opt}
                              onChange={(e) => handleOptionChange(step.id, i, e.target.value)}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-emerald-300 font-black uppercase">Opt {i+1}</div>
                          </div>
                          <button 
                            onClick={() => removeOption(step.id, i)}
                            className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatFlowBuilder;
