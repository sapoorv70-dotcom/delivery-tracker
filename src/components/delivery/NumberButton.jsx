import React from 'react';
import { Check, MessageSquare } from 'lucide-react';

export default function NumberButton({ number, isSelected, onClick, onOpenComment }) {
  const { value, delivered, comment } = number;
  const hasComment = comment && comment.trim().length > 0;

  return (
    <div className="relative aspect-square">
      <button
        onClick={onClick}
        className={`w-full h-full min-h-[44px] rounded-xl flex items-center justify-center text-sm font-semibold transition-all active:scale-95
          ${delivered
            ? 'bg-emerald-500 text-white shadow-sm'
            : isSelected
              ? 'bg-indigo-600 text-white ring-2 ring-indigo-300 ring-offset-1'
              : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 active:border-indigo-400 active:text-indigo-600'}`}
      >
        {delivered ? <Check className="w-4 h-4" /> : value}
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onOpenComment(); }}
        className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-all shadow-sm active:scale-90
          before:absolute before:content-[''] before:w-11 before:h-11 before:-left-3 before:-top-3
          ${hasComment ? 'bg-amber-400' : 'bg-slate-200 hover:bg-amber-400 active:bg-amber-400'}`}
        title="Add note"
        aria-label="Add note"
      >
        <MessageSquare className={`w-3 h-3 ${hasComment ? 'text-white' : 'text-slate-500'}`} />
      </button>
    </div>
  );
}