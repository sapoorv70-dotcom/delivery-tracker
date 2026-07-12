import React from 'react';
import { CheckCircle2, Package } from 'lucide-react';

export default function DailySummary({ sections }) {
  const allNumbers = sections.flatMap((s) => s.streets.flatMap((st) => st.numbers));
  const total = allNumbers.length;
  const delivered = allNumbers.filter((n) => n.delivered).length;
  const remaining = total - delivered;
  const pct = total > 0 ? Math.round(delivered / total * 100) : 0;

  return (
    <div className="bg-white shadow-sm p-4 border border-slate-100 rounded-2xl">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Today's Progress</h2>
        <span className="text-sm font-bold text-slate-600">{pct}%</span>
      </div>
      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="text-3xl font-bold text-slate-900 tracking-tight">{delivered}</span>
        <span className="text-sm text-slate-400">/ {total} delivered</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }} />
        
      </div>
      <div className="flex gap-4">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-medium text-slate-600">{delivered} done</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Package className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-600">{remaining} left</span>
        </div>
      </div>
    </div>);

}