import { useEffect, useRef, useCallback } from 'react';

export default function BottomSheet({ open, onClose, title, children }) {
  const sheetRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement;
      requestAnimationFrame(() => {
        sheetRef.current?.focus();
      });
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [open]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key === 'Tab') {
      const sheet = sheetRef.current;
      if (!sheet) return;
      const focusable = sheet.querySelectorAll(
        'button:not([tabindex="-1"]), [href], input:not([tabindex="-1"]), select, textarea, [tabindex="0"]'
      );
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first || document.activeElement === sheet) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last || document.activeElement === sheet) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }, [onClose]);

  if (!open) return null;

  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex flex-col justify-end outline-none"
      onKeyDown={handleKeyDown}
    >
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" onPointerDown={onClose} />
      <div className="relative bg-white rounded-t-2xl pt-4 px-2 pb-6 max-h-[70dvh]" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
        {children}
      </div>
    </div>
  );
}
