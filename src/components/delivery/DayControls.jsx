import React from 'react';
import { Play, Square, Check, Clock } from 'lucide-react';
import { formatTimer, formatDuration, computeTiming } from './timeUtils';

export default function DayControls({ log, now, onStartDay, onFinishDay }) {
  const { startTime, onBreak, breakMs, elapsedMs } = computeTiming(log, now);

  if (log?.finished) {
    return (
      <div className="px-4 pb-safe pt-2">
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold mb-2">
            <Check className="w-4 h-4" /> Day Finished
          </div>
          <div className="flex justify-center gap-6 text-sm text-slate-600">
            <span>Total: <strong>{formatDuration(elapsedMs)}</strong></span>
            <span>Breaks: <strong>{formatDuration(breakMs)}</strong></span>
          </div>
        </div>
      </div>
    );
  }

  if (!startTime) {
    return (
      <div className="px-4 pb-safe pt-2">
        <button
          onClick={onStartDay}
          className="w-full py-3 min-h-[48px] rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 active:bg-indigo-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" /> Start Day
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pb-safe pt-2">
      <div className="rounded-xl bg-white border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-700">
            <Clock className={`w-4 h-4 ${onBreak ? 'text-amber-400' : 'text-indigo-500'}`} />
            <span className="font-mono text-lg font-semibold">{formatTimer(elapsedMs)}</span>
          </div>
          <button
            onClick={onFinishDay}
            className="px-4 py-2 min-h-[44px] rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 active:bg-emerald-800 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Square className="w-3.5 h-3.5" /> Finish Day
          </button>
        </div>
        {breakMs > 0 && (
          <p className="text-xs text-slate-400 mt-1">Break time: {formatDuration(breakMs)}</p>
        )}
      </div>
    </div>
  );
}