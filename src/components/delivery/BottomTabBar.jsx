import React from 'react';
import { ClipboardList, Clock, Settings } from 'lucide-react';

const TABS = [
  { id: 'tracker', label: 'Tracker', icon: ClipboardList },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function BottomTabBar({ activeTab, onTabChange, onTabReset }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-t border-slate-200/60 pb-safe">
      <div className="flex items-stretch justify-around max-w-md mx-auto">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => (active ? onTabReset?.(id) : onTabChange(id))}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[52px] transition-colors active:scale-95 ${active ? 'text-indigo-600' : 'text-slate-400'}`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[10px] ${active ? 'font-semibold' : 'font-medium'}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}