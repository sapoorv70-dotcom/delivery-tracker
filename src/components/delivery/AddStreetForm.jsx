import React, { useState } from 'react';
import { Plus } from 'lucide-react';

export default function AddStreetForm({ onAdd }) {
  const [expanded, setExpanded] = useState(false);
  const [streetName, setStreetName] = useState('');

  const handleSubmit = () => {
    if (streetName.trim()) {
      onAdd(streetName.trim());
      setStreetName('');
      setExpanded(false);
    }
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full py-2.5 min-h-[44px] rounded-xl border border-dashed border-slate-300 text-sm font-medium text-slate-500 hover:border-indigo-400 hover:text-indigo-600 active:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5">
        
        <Plus className="w-4 h-4" /> Add Street
      </button>);

  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2">
      <input
        type="text"
        value={streetName}
        onChange={(e) => setStreetName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="Street name (e.g. Addoide Drive)"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent opacity-100 text-gray-950"
        autoFocus />
      
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="flex-1 py-2 min-h-[44px] rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 active:bg-indigo-800 active:scale-95 transition-all">
          
          Add Street
        </button>
        <button
          onClick={() => setExpanded(false)}
          className="px-4 py-2 min-h-[44px] rounded-lg bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 active:bg-slate-200 active:scale-95 transition-all">
          
          Cancel
        </button>
      </div>
    </div>);

}