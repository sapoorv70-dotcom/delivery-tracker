import React, { useState } from 'react';
import { Plus } from 'lucide-react';

export default function AddNumbersInput({ onAdd }) {
  const [expanded, setExpanded] = useState(false);
  const [numbers, setNumbers] = useState('');

  const handleSubmit = () => {
    const parsed = numbers.
    split(/[,\s]+/).
    map((s) => s.trim()).
    filter((s) => s.length > 0);
    if (parsed.length > 0) {
      onAdd(parsed);
      setNumbers('');
      setExpanded(false);
    }
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full py-2 min-h-[44px] rounded-lg border border-dashed border-slate-300 text-xs font-medium text-slate-500 hover:border-indigo-400 hover:text-indigo-600 active:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5">
        
        <Plus className="w-3.5 h-3.5" /> Add house numbers
      </button>);

  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={numbers}
        onChange={(e) => setNumbers(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="5, 12, 27, 41"
        className="flex-1 min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-gray-950"
        autoFocus />
      
      <button
        onClick={handleSubmit}
        className="px-4 py-2 min-h-[44px] rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 active:bg-indigo-800 active:scale-95 transition-all">
        
        Add
      </button>
      <button
        onClick={() => {setExpanded(false);setNumbers('');}}
        className="px-3 py-2 min-h-[44px] rounded-lg bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 active:bg-slate-200 active:scale-95 transition-all">
        
        Cancel
      </button>
    </div>);

}