import React, { useEffect, useRef } from 'react';

export default function SearchDropdown({
  open,
  items = [],
  highlightedIndex = -1,
  onSelect,
  onClose,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!open) return;
      if (ref.current && !ref.current.contains(e.target)) {
        onClose?.();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div ref={ref} className="dropdown">
      {items.length === 0 && (
        <div className="px-3 py-3 text-sm text-slate-500">No matches found</div>
      )}
      {items.map((item, idx) => (
        <div
          key={item._id}
          className={`dropdown-item ${idx === highlightedIndex ? 'dropdown-item-active' : ''}`}
          onMouseDown={(e) => {
            // onMouseDown so click doesn't blur input before select
            e.preventDefault();
            onSelect?.(item, idx);
          }}
        >
          <span className="truncate">{item.name}</span>
          <span className="ml-3 text-xs text-slate-500">₹{Number(item.price).toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}
