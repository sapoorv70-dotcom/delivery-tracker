import React, { useState } from 'react';
import { ChevronDown, Pencil, Check, X, Trash2 } from 'lucide-react';
import StreetGroup from './StreetGroup';
import AddStreetForm from './AddStreetForm';

export default function SectionCard({ section, sectionIndex, onAddStreet, onAddNumbers, onRemoveStreet, onClearNumbers, onRenameSection, onRenameStreet, onRemoveSection, onNumberTap, onOpenComment, locked, selected }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(section.name);

  const allNumbers = section.streets.flatMap(s => s.numbers);
  const delivered = allNumbers.filter(n => n.delivered).length;
  const total = allNumbers.length;

  const saveName = () => {
    if (editName.trim()) {
      onRenameSection(sectionIndex, editName.trim());
    } else {
      setEditName(section.name);
    }
    setEditing(false);
  };

  const startEdit = (e) => {
    e.stopPropagation();
    setEditName(section.name);
    setEditing(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="w-full flex items-center justify-between p-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-3 flex-1 min-w-0 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-indigo-600">{sectionIndex + 1}</span>
          </div>
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveName();
                    if (e.key === 'Escape') { setEditName(section.name); setEditing(false); }
                  }}
                  className="font-semibold text-slate-900 bg-transparent border-b border-indigo-400 focus:outline-none flex-1 min-w-0"
                  autoFocus
                />
                <button onClick={saveName} className="text-emerald-500 hover:text-emerald-600 active:scale-90 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => { setEditName(section.name); setEditing(false); }} className="text-slate-400 hover:text-slate-600 active:scale-90 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-semibold text-slate-900 truncate">{section.name}</h3>
                <p className="text-xs text-slate-400">
                  {section.streets.length === 0
                    ? 'No streets yet — add your fixed streets'
                    : `${section.streets.length} ${section.streets.length === 1 ? 'street' : 'streets'}${total > 0 ? ` · ${delivered}/${total} delivered` : ''}`}
                </p>
              </>
            )}
          </div>
        </button>
        {!editing && (
          <div className="flex items-center gap-1 shrink-0">
            {!locked && (
            <button
              onClick={startEdit}
              className="text-slate-300 hover:text-indigo-600 active:scale-90 transition-all p-1 min-w-[36px] min-h-[36px] flex items-center justify-center"
              title="Edit section name"
            >
              <Pencil className="w-4 h-4" />
            </button>
            )}
            {!locked && (
            <button
              onClick={() => onRemoveSection(sectionIndex)}
              className="text-slate-300 hover:text-red-500 active:scale-90 active:text-red-500 transition-all p-1 min-w-[36px] min-h-[36px] flex items-center justify-center"
              title="Remove section"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            )}
            <button onClick={() => setExpanded(!expanded)}>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {section.streets.map((street, si) => (
            <StreetGroup
              key={si}
              street={street}
              sectionIndex={sectionIndex}
              streetIndex={si}
              onNumberTap={onNumberTap}
              onOpenComment={onOpenComment}
              locked={locked}
              onAddNumbers={onAddNumbers}
              onRemoveStreet={onRemoveStreet}
              onClearNumbers={onClearNumbers}
              onRenameStreet={onRenameStreet}
              selected={selected}
            />
          ))}
          {!locked && <AddStreetForm onAdd={(name) => onAddStreet(sectionIndex, name)} />}
        </div>
      )}
    </div>
  );
}