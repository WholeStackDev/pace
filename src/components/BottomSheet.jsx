import { useEffect } from 'react';

export default function BottomSheet({ open, onClose, children }) {
  useEffect(() => {
    if (open) {
      document.activeElement?.blur();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onPointerDown={onClose} />
      <div className="relative bg-white rounded-t-2xl pt-4 px-2 pb-6 max-h-[70dvh]" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
        {children}
      </div>
    </div>
  );
}
