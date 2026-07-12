import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import DailySummary from '@/components/delivery/DailySummary';
import SectionCard from '@/components/delivery/SectionCard';
import CommentPanel from '@/components/delivery/CommentPanel';
import HistoryView from '@/components/delivery/HistoryView';
import DayControls from '@/components/delivery/DayControls';
import SettingsView from '@/components/delivery/SettingsView';
import PullToRefresh from '@/components/delivery/PullToRefresh';
import ConfirmDialog from '@/components/delivery/ConfirmDialog';
import BottomTabBar from '@/components/delivery/BottomTabBar';
import { toast } from '@/components/ui/use-toast';

const SECTION_COUNT = 9;

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [log, setLog] = useState(null);
  const [template, setTemplate] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', confirmText: 'Confirm', cancelText: 'Cancel', destructive: false, onConfirm: null });
  const skipSaveLog = useRef(true);
  const skipSaveTemplate = useRef(true);

  // Path-based tab navigation — system back button walks backward across tabs
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.startsWith('/history') ? 'history'
    : location.pathname.startsWith('/settings') ? 'settings'
    : 'tracker';
  const commentParam = searchParams.get('comment');
  const selected = commentParam
    ? (() => {
        const parts = commentParam.split('-').map(Number);
        if (parts.length === 3 && parts.every(n => !isNaN(n))) {
          return { sectionIndex: parts[0], streetIndex: parts[1], numberIndex: parts[2] };
        }
        return null;
      })()
    : null;

  const switchTab = (tab) => {
    const target = `/${tab}`;
    if (location.pathname === target) return;
    const qs = searchParams.toString();
    navigate(qs ? `${target}?${qs}` : target);
  };
  const handleTabReset = () => {
    closeComment();
  };
  const openComment = (si, sti, ni) => {
    const next = new URLSearchParams(searchParams);
    next.set('comment', `${si}-${sti}-${ni}`);
    setSearchParams(next);
  };
  const closeComment = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('comment');
    setSearchParams(next);
  };

  const handleRefresh = useCallback(async () => {
    const allLogs = await base44.entities.DeliveryLog.list('-date', 200);
    setHistory(allLogs);
    const current = allLogs.find(l => l.date === selectedDate);
    if (current) {
      skipSaveLog.current = true;
      setLog(current);
    }
  }, [selectedDate]);

  useEffect(() => {
    (async () => {
      try {
        const today = todayStr();

        // Load all delivery logs (history), sorted newest first
        const allLogs = await base44.entities.DeliveryLog.list('-date', 200);
        setHistory(allLogs);
        const existing = allLogs.find(l => l.date === today);

        // Load or create the fixed street template
        let tmpl = await base44.entities.DeliveryTemplate.list();
        let templateDoc;
        if (tmpl.length > 0) {
          templateDoc = tmpl[0];
        } else {
          // First run: seed template from today's existing streets, else empty
          const seedSections = existing
            ? existing.sections.map(s => ({
                name: s.name,
                streets: s.streets.map(st => st.name)
              }))
            : Array.from({ length: SECTION_COUNT }, (_, i) => ({
                name: `Section ${i + 1}`,
                streets: []
              }));
          templateDoc = await base44.entities.DeliveryTemplate.create({ sections: seedSections });
        }
        setTemplate(templateDoc);

        // Load or create today's log, pre-populated from the template
        if (existing) {
          setLog(existing);
        } else {
          const sections = templateDoc.sections.map(s => ({
            name: s.name,
            streets: s.streets.map(stName => ({ name: stName, numbers: [] }))
          }));
          const created = await base44.entities.DeliveryLog.create({ date: today, sections });
          setLog(created);
          setHistory(prev => [created, ...prev]);
        }
      } catch (e) {
        console.error('Failed to load delivery data:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Live ticking timer — only when day is active
  useEffect(() => {
    if (log?.start_time && !log?.finished) {
      const interval = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(interval);
    }
  }, [log?.start_time, log?.finished]);

  // Debounced autosave of the day's log (numbers, deliveries, comments)
  useEffect(() => {
    if (!log) return;
    if (skipSaveLog.current) {
      skipSaveLog.current = false;
      return;
    }
    const timeout = setTimeout(() => {
      base44.entities.DeliveryLog.update(log.id, { sections: log.sections, finished: log.finished, start_time: log.start_time, finish_time: log.finish_time, breaks: log.breaks }).catch(() => {
        toast({ title: 'Save failed', description: 'Could not save today\u2019s delivery log.', variant: 'destructive' });
      });
      setHistory(prev => prev.map(h => h.id === log.id ? { ...h, sections: log.sections, finished: log.finished, start_time: log.start_time, finish_time: log.finish_time, breaks: log.breaks } : h));
    }, 400);
    return () => clearTimeout(timeout);
  }, [log]);

  // Switch to a different date — loads that day's saved log, or creates today's
  const handleSelectDate = async (date) => {
    if (date === selectedDate) {
      switchTab('tracker');
      return;
    }
    const existing = history.find(l => l.date === date);
    if (existing) {
      skipSaveLog.current = true;
      setLog(existing);
      setSelectedDate(date);
    } else if (date === todayStr() && template) {
      const sections = template.sections.map(s => ({
        name: s.name,
        streets: s.streets.map(stName => ({ name: stName, numbers: [] }))
      }));
      const created = await base44.entities.DeliveryLog.create({ date, sections });
      skipSaveLog.current = true;
      setLog(created);
      setHistory(prev => [created, ...prev]);
      setSelectedDate(date);
    }
    closeComment();
    switchTab('tracker');
  };

  // Debounced autosave of the fixed street template
  useEffect(() => {
    if (!template) return;
    if (skipSaveTemplate.current) {
      skipSaveTemplate.current = false;
      return;
    }
    const timeout = setTimeout(() => {
      base44.entities.DeliveryTemplate.update(template.id, { sections: template.sections }).catch(() => {
        toast({ title: 'Save failed', description: 'Could not save street template.', variant: 'destructive' });
      });
    }, 400);
    return () => clearTimeout(timeout);
  }, [template]);

  // Add house numbers to an existing (fixed) street — current day only
  const handleAddNumbers = (sectionIndex, streetIndex, numbers) => {
    setLog(prev => ({
      ...prev,
      sections: prev.sections.map((s, si) =>
        si === sectionIndex
          ? {
              ...s,
              streets: s.streets.map((st, sti) =>
                sti === streetIndex
                  ? {
                      ...st,
                      numbers: [
                        ...st.numbers,
                        ...numbers
                          .filter(n => !st.numbers.some(x => x.value === n))
                          .map(n => ({ value: n, delivered: false, comment: '' }))
                      ].sort((a, b) => {
                        const na = parseInt(a.value, 10);
                        const nb = parseInt(b.value, 10);
                        if (isNaN(na) || isNaN(nb)) return a.value.localeCompare(b.value);
                        return na - nb;
                      })
                    }
                  : st
              )
            }
          : s
      )
    }));
  };

  // Add a brand-new fixed street — persists to template + current day
  const handleAddStreet = (sectionIndex, streetName) => {
    setTemplate(prev => ({
      ...prev,
      sections: prev.sections.map((s, si) =>
        si === sectionIndex
          ? { ...s, streets: [...s.streets, streetName] }
          : s
      )
    }));
    setLog(prev => ({
      ...prev,
      sections: prev.sections.map((s, si) =>
        si === sectionIndex
          ? {
              ...s,
              streets: [...s.streets, { name: streetName, numbers: [] }]
            }
          : s
      )
    }));
  };

  // Remove a fixed street — persists to template + current day
  const handleRemoveStreet = (sectionIndex, streetIndex) => {
    setConfirmDialog({
      open: true,
      title: 'Remove Street',
      description: 'Remove this street from all future days?',
      confirmText: 'Remove',
      destructive: true,
      onConfirm: () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
        setTemplate(prev => ({
          ...prev,
          sections: prev.sections.map((s, si) =>
            si === sectionIndex
              ? { ...s, streets: s.streets.filter((_, sti) => sti !== streetIndex) }
              : s
          )
        }));
        setLog(prev => ({
          ...prev,
          sections: prev.sections.map((s, si) =>
            si === sectionIndex
              ? { ...s, streets: s.streets.filter((_, sti) => sti !== streetIndex) }
              : s
          )
        }));
        closeComment();
      }
    });
  };

  const handleNumberTap = (sectionIndex, streetIndex, numberIndex) => {
    if (log?.finished) return;
    setLog(prev => ({
      ...prev,
      sections: prev.sections.map((s, si) =>
        si === sectionIndex
          ? {
              ...s,
              streets: s.streets.map((st, sti) =>
                sti === streetIndex
                  ? {
                      ...st,
                      numbers: st.numbers.map((n, ni) =>
                        ni === numberIndex ? { ...n, delivered: !n.delivered } : n
                      )
                    }
                  : st
              )
            }
          : s
      )
    }));
  };

  const handleOpenComment = (sectionIndex, streetIndex, numberIndex) => {
    openComment(sectionIndex, streetIndex, numberIndex);
  };

  const handleStartDay = () => {
    const startTime = new Date().toISOString();
    setLog(prev => ({ ...prev, start_time: startTime }));
    setHistory(prev => prev.map(h => h.id === log.id ? { ...h, start_time: startTime } : h));
  };

  const handleFinishDay = () => {
    setConfirmDialog({
      open: true,
      title: 'Finish Day',
      description: 'Once finished, delivery details cannot be changed (comments can still be edited).',
      confirmText: 'Finish Day',
      destructive: false,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
        const finishTime = new Date().toISOString();
        const closedBreaks = (log.breaks || []).map(b => b.end ? b : { ...b, end: finishTime });
        setLog(prev => ({ ...prev, finished: true, finish_time: finishTime, breaks: closedBreaks }));
        setHistory(prev => prev.map(h => h.id === log.id ? { ...h, finished: true, finish_time: finishTime, breaks: closedBreaks } : h));
        await base44.entities.DeliveryLog.update(log.id, { finished: true, finish_time: finishTime, breaks: closedBreaks });
      }
    });
  };

  const handleStartBreak = () => {
    const breakStart = new Date().toISOString();
    setLog(prev => ({ ...prev, breaks: [...(prev.breaks || []), { start: breakStart, end: null }] }));
  };

  const handleFinishBreak = () => {
    const breakEnd = new Date().toISOString();
    setLog(prev => ({
      ...prev,
      breaks: prev.breaks.map((b, i) =>
        i === prev.breaks.length - 1 ? { ...b, end: breakEnd } : b
      )
    }));
  };

  const handleComment = (comment) => {
    if (!selected) return;
    const { sectionIndex, streetIndex, numberIndex } = selected;
    setLog(prev => ({
      ...prev,
      sections: prev.sections.map((s, si) =>
        si === sectionIndex
          ? {
              ...s,
              streets: s.streets.map((st, sti) =>
                sti === streetIndex
                  ? {
                      ...st,
                      numbers: st.numbers.map((n, ni) =>
                        ni === numberIndex ? { ...n, comment } : n
                      )
                    }
                  : st
              )
            }
          : s
      )
    }));
  };

  const handleUndo = () => {
    if (log?.finished) return;
    if (!selected) return;
    const { sectionIndex, streetIndex, numberIndex } = selected;
    setLog(prev => ({
      ...prev,
      sections: prev.sections.map((s, si) =>
        si === sectionIndex
          ? {
              ...s,
              streets: s.streets.map((st, sti) =>
                sti === streetIndex
                  ? {
                      ...st,
                      numbers: st.numbers.map((n, ni) =>
                        ni === numberIndex ? { ...n, delivered: false } : n
                      )
                    }
                  : st
              )
            }
          : s
      )
    }));
  };

  const handleRemoveNumber = () => {
    if (log?.finished) return;
    if (!selected) return;
    const { sectionIndex, streetIndex, numberIndex } = selected;
    setLog(prev => ({
      ...prev,
      sections: prev.sections.map((s, si) =>
        si === sectionIndex
          ? {
              ...s,
              streets: s.streets.map((st, sti) =>
                sti === streetIndex
                  ? { ...st, numbers: st.numbers.filter((_, ni) => ni !== numberIndex) }
                  : st
              )
            }
          : s
      )
    }));
    closeComment();
  };

  const handleClearNumbers = (sectionIndex, streetIndex) => {
    setLog(prev => ({
      ...prev,
      sections: prev.sections.map((s, si) =>
        si === sectionIndex
          ? {
              ...s,
              streets: s.streets.map((st, sti) =>
                sti === streetIndex ? { ...st, numbers: [] } : st
              )
            }
          : s
      )
    }));
    closeComment();
  };

  const handleAddSection = () => {
    const newSection = { name: `Section ${(template?.sections?.length || 0) + 1}`, streets: [] };
    setTemplate(prev => prev ? { ...prev, sections: [...prev.sections, newSection] } : prev);
    setLog(prev => prev ? { ...prev, sections: [...prev.sections, { ...newSection, streets: [] }] } : prev);
  };

  const handleRemoveSection = (sectionIndex) => {
    setConfirmDialog({
      open: true,
      title: 'Remove Section',
      description: 'Remove this section and all its streets from all future days?',
      confirmText: 'Remove',
      destructive: true,
      onConfirm: () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
        setTemplate(prev => prev ? { ...prev, sections: prev.sections.filter((_, si) => si !== sectionIndex) } : prev);
        setLog(prev => prev ? { ...prev, sections: prev.sections.filter((_, si) => si !== sectionIndex) } : prev);
        closeComment();
      }
    });
  };

  const handleRenameSection = (sectionIndex, newName) => {
    setTemplate(prev => ({
      ...prev,
      sections: prev.sections.map((s, si) =>
        si === sectionIndex ? { ...s, name: newName } : s
      )
    }));
    setLog(prev => ({
      ...prev,
      sections: prev.sections.map((s, si) =>
        si === sectionIndex ? { ...s, name: newName } : s
      )
    }));
  };

  const handleRenameStreet = (sectionIndex, streetIndex, newName) => {
    setTemplate(prev => ({
      ...prev,
      sections: prev.sections.map((s, si) =>
        si === sectionIndex
          ? { ...s, streets: s.streets.map((st, sti) => sti === streetIndex ? newName : st) }
          : s
      )
    }));
    setLog(prev => ({
      ...prev,
      sections: prev.sections.map((s, si) =>
        si === sectionIndex
          ? {
              ...s,
              streets: s.streets.map((st, sti) =>
                sti === streetIndex ? { ...st, name: newName } : st
              )
            }
          : s
      )
    }));
  };

  const selectedNumber = selected && log
    ? log.sections[selected.sectionIndex]?.streets[selected.streetIndex]?.numbers[selected.numberIndex]
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
      </div>
    );
  }

  if (!log) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400 text-sm">
        Unable to load delivery data. Please try again.
      </div>
    );
  }

  const isToday = selectedDate === todayStr();
  const dateLabel = isToday
    ? new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {activeTab === 'tracker' && (
      <PullToRefresh onRefresh={handleRefresh} className="flex-1 min-w-0 flex flex-col pb-28">
        <div className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md px-4 pt-safe pb-3 border-b border-slate-100">
          <div className="mb-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Delivery Tracker</h1>
            <p className="text-sm text-slate-400">{dateLabel}</p>
          </div>
          <DailySummary sections={log.sections} />
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 px-4 pt-3 ${selectedNumber ? 'pb-52' : 'pb-8'}`}>
          {log.sections.map((section, si) => (
            <SectionCard
              key={si}
              section={section}
              sectionIndex={si}
              onAddStreet={handleAddStreet}
              onAddNumbers={handleAddNumbers}
              onRemoveStreet={handleRemoveStreet}
              onClearNumbers={handleClearNumbers}
              onRenameSection={handleRenameSection}
              onRenameStreet={handleRenameStreet}
              onRemoveSection={handleRemoveSection}
              onNumberTap={handleNumberTap}
              onOpenComment={handleOpenComment}
              locked={log.finished}
              selected={selected}
            />
          ))}
          {!log.finished && (
            <button
              onClick={handleAddSection}
              className="col-span-1 sm:col-span-2 py-3 min-h-[48px] rounded-2xl border border-dashed border-slate-300 text-sm font-medium text-slate-500 hover:border-indigo-400 hover:text-indigo-600 active:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
            >
              + Add Section
            </button>
          )}
        </div>

        <DayControls log={log} now={now} onStartDay={handleStartDay} onFinishDay={handleFinishDay} />
      </PullToRefresh>
      )}

      {activeTab === 'history' && (
        <HistoryView
          history={history}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          log={log}
          now={now}
          onStartBreak={handleStartBreak}
          onFinishBreak={handleFinishBreak}
        />
      )}

      {activeTab === 'settings' && <SettingsView />}

      <AnimatePresence>
        {selectedNumber && activeTab === 'tracker' && (
          <CommentPanel
            number={selectedNumber}
            streetName={log.sections[selected.sectionIndex].streets[selected.streetIndex].name}
            sectionName={log.sections[selected.sectionIndex].name}
            onComment={handleComment}
            onClose={closeComment}
            onUndo={handleUndo}
            onRemoveNumber={handleRemoveNumber}
            locked={log.finished}
          />
        )}
      </AnimatePresence>

      <BottomTabBar activeTab={activeTab} onTabChange={switchTab} onTabReset={handleTabReset} />
      <ConfirmDialog {...confirmDialog} onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))} />
      <Outlet />
    </div>
  );
}