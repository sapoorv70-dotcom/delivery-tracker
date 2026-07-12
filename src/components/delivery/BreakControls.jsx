import React from 'react';
import { Coffee, Play, Square } from 'lucide-react';
import { formatTimer, formatDuration, computeTiming } from './timeUtils';

export default function BreakControls({ log, now, onStartBreak, onFinishBreak }) {
  if (log?.finished || !log?.start_time) return null;

  const { onBreak, breakMs } = computeTiming(log, now);

  return (
    <div className="px-3 py-2">
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Coffee className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold text-slate-700">Break</span>
        </div>
        {onBreak ? (
          <>
            <p className="font-mono text-sm text-amber-600 mb-2">
              On break — {formatTimer(breakMs)}
            </p>
            <button
              onClick={onFinishBreak}
              className="w-full py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors flex items-center justify-center gap-1.5"
            >
              <Square className="w-3.5 h-3.5" /> Finish Break
            </button>
          </>
        ) : (
          <>
            {breakMs > 0 && (
              <p className="text-xs text-slate-400 mb-2">Total breaks: {formatDuration(breakMs)}</p>
            )}
            <button
              onClick={onStartBreak}
              className="w-full py-2 rounded-lg bg-white border border-amber-300 text-amber-600 text-sm font-medium hover:bg-amber-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" /> Start Break
            </button>
          </>
        )}
      </div>
    </div>
  );
}