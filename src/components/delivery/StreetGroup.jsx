import React, { useState } from 'react';
import { Trash2, Pencil, Check, X, Navigation } from 'lucide-react';
import NumberButton from './NumberButton';
import AddNumbersInput from './AddNumbersInput';

export default function StreetGroup({ street, sectionIndex, streetIndex, onNumberTap, onOpenComment, onAddNumbers, onRemoveStreet, onClearNumbers, onRenameStreet, locked, selected }) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(street.name);

  const delivered = street.numbers.filter(n => n.delivered).length;
  const total = street.numbers.length;
  const pct = total > 0 ? (delivered / total) * 100 : 0;

  const openInMaps = () => {
    const sorted = [...street.numbers].sort((a, b) => parseInt(a.value) - parseInt(b.value));
    const addresses = sorted.map(n => `${n.value} ${street.name}`);
    if (addresses.length === 0) return;
    if (addresses.length === 1) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addresses[0])}`, '_blank');
      return;
    }
    const origin = encodeURIComponent(addresses[0]);
    const destination = encodeURIComponent(addresses[addresses.length - 1]);
    const waypoints = addresses.slice(1, -1).slice(0, 9).map(encodeURIComponent).join('|');
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`,
      '_blank'
    );
  };

  const saveName = () => {
    if (editName.trim()) {
      onRenameStreet(sectionIndex, streetIndex, editName.trim());
    } else {
      setEditName(street.name);
    }
    setEditing(false);
  };

  return (
    <div className="bg-slate-50 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        {editing ? (
          <div className="flex items-center gap-1 flex-1">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveName();
                if (e.key === 'Escape') { setEditName(street.name); setEditing(false); }
              }}
              className="text-sm font-semibold text-slate-700 bg-transparent border-b border-indigo-400 focus:outline-none flex-1 min-w-0"
              autoFocus
            />
            <button onClick={saveName} className="text-emerald-500 hover:text-emerald-600 active:scale-90 transition-all p-0.5 min-w-[36px] min-h-[36px] flex items-center justify-center">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => { setEditName(street.name); setEditing(false); }} className="text-slate-400 hover:text-slate-600 active:scale-90 transition-all p-0.5 min-w-[36px] min-h-[36px] flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <h4 className="text-sm font-semibold text-slate-700 truncate">{street.name}</h4>
        )}
        {!editing && (
          <div className="flex items-center gap-2 shrink-0">
            {total > 0 && <span className="text-xs font-medium text-slate-400">{delivered}/{total}</span>}
            {total > 0 && (
              <button
                onClick={openInMaps}
                className="text-slate-300 hover:text-blue-600 active:text-blue-600 active:scale-90 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg"
                title="Open route in Google Maps"
              >
                <Navigation className="w-3.5 h-3.5" />
              </button>
            )}
            {!locked && (
            <button
              onClick={() => setEditing(true)}
              className="text-slate-300 hover:text-indigo-600 active:text-indigo-600 active:scale-90 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg"
              title="Edit street name"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            )}
            {!locked && (
            <button
              onClick={() => onRemoveStreet(sectionIndex, streetIndex)}
              className="text-slate-300 hover:text-red-500 active:text-red-500 active:scale-90 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg"
              title="Remove street"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            )}
          </div>
        )}
      </div>
      {total > 0 && (
        <>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {street.numbers.map((num, ni) => (
              <NumberButton
                key={ni}
                number={num}
                isSelected={
                  selected?.sectionIndex === sectionIndex &&
                  selected?.streetIndex === streetIndex &&
                  selected?.numberIndex === ni
                }
                onClick={() => onNumberTap(sectionIndex, streetIndex, ni)}
                onOpenComment={() => onOpenComment(sectionIndex, streetIndex, ni)}
              />
            ))}
          </div>
          {!locked && (
          <button
            onClick={() => onClearNumbers(sectionIndex, streetIndex)}
            className="text-xs font-medium text-slate-400 hover:text-red-500 active:text-red-500 active:scale-95 transition-all mt-1 min-h-[36px]"
          >
            Clear all numbers
          </button>
          )}
        </>
      )}
      {!locked && <AddNumbersInput onAdd={(nums) => onAddNumbers(sectionIndex, streetIndex, nums)} />}
    </div>
  );
}