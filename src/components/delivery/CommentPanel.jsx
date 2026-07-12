import React from 'react';
import { motion } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';

export default function CommentPanel({ number, streetName, sectionName, onComment, onClose, onUndo, onRemoveNumber, locked }) {
  return (
    <motion.div
      key="comment-panel"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      className="fixed bottom-0 inset-x-0 z-50"
    >
      <div
        className="max-w-md mx-auto bg-white border-t border-slate-200 rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.08)] px-4 pt-4"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-3" />
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">{sectionName} · {streetName}</p>
            <p className="text-lg font-bold text-slate-900">House #{number.value}</p>
          </div>
          <div className="flex items-center gap-2">
            {number.delivered ? (
              locked ? (
                <span className="text-xs font-medium text-emerald-600 px-3 py-1.5 rounded-lg bg-emerald-50">
                  Delivered
                </span>
              ) : (
                <button
                  onClick={onUndo}
                  className="text-xs font-medium text-amber-600 px-3 py-1.5 min-h-[36px] rounded-lg bg-amber-50 hover:bg-amber-100 active:bg-amber-100 active:scale-95 transition-all"
                >
                  Undo
                </button>
              )
            ) : (
              <span className="text-xs font-medium text-slate-400 px-3 py-1.5 rounded-lg bg-slate-50">
                Pending
              </span>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 min-w-[36px] min-h-[36px] active:scale-90 transition-all flex items-center justify-center">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <textarea
          value={number.comment}
          onChange={(e) => onComment(e.target.value)}
          placeholder="Add a delivery note..."
          className="w-full rounded-xl border border-slate-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          rows={2}
          autoFocus
        />
        {!locked && (
        <button
          onClick={onRemoveNumber}
          className="w-full mt-2 py-2 min-h-[44px] rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 active:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" /> Remove number
        </button>
        )}
      </div>
    </motion.div>
  );
}