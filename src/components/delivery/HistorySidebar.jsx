import React from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import BreakControls from './BreakControls';

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today - d) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getProgress(log) {
  const allNumbers = log.sections?.flatMap(s => s.streets?.flatMap(st => st.numbers || [])) || [];
  const total = allNumbers.length;
  const delivered = allNumbers.filter(n => n.delivered).length;
  return { delivered, total };
}

export default function HistorySidebar({ history, selectedDate, onSelectDate, onClose, log, now, onStartBreak, onFinishBreak }) {
  const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between p-4 pt-safe border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-500" />
          <h2 className="font-semibold text-slate-900">History</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <BreakControls log={log} now={now} onStartBreak={onStartBreak} onFinishBreak={onFinishBreak} />
      <div className="flex-1 overflow-y-auto p-2 no-overscroll">
        {sorted.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No past days yet</p>
        ) : (
          sorted.map((log) => {
            const { delivered, total } = getProgress(log);
            const isActive = log.date === selectedDate;
            return (
              <button
                key={log.id}
                onClick={() => onSelectDate(log.date)}
                className={`
                  w-full text-left p-3 rounded-xl mb-1 transition-colors
                  ${isActive ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-slate-50'}
                `}
              >
                <div className="flex items-center gap-2">
                  <Calendar className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-500' : 'text-slate-400'}`} />
                  <span className={`text-sm font-medium truncate ${isActive ? 'text-indigo-700' : 'text-slate-700'}`}>
                    {formatDate(log.date)}
                  </span>
                </div>
                {total > 0 && (
                  <p className="text-xs text-slate-400 mt-1 pl-5">
                    {delivered}/{total} delivered
                  </p>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}