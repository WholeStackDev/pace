import { useEffect, useRef } from 'react';

export default function NumberPad({ onDigit, onDecimal, onBackspace, onDone, onTab, showDecimal = true }) {
  const callbacksRef = useRef({ onDigit, onDecimal, onBackspace, onDone, onTab, showDecimal });
  callbacksRef.current = { onDigit, onDecimal, onBackspace, onDone, onTab, showDecimal };

  useEffect(() => {
    const handler = (e) => {
      const { onDigit, onDecimal, onBackspace, onDone, onTab, showDecimal } = callbacksRef.current;
      if (e.key === 'Tab') {
        e.preventDefault();
        if (onTab) onTab(e.shiftKey);
        return;
      }
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        onDigit(e.key);
      } else if (e.key === '.' && showDecimal) {
        e.preventDefault();
        onDecimal();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        onBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onDone();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const btn = "flex items-center justify-center h-12 rounded-lg bg-gray-100 active:bg-gray-300 text-xl font-medium select-none touch-manipulation outline-none";

  return (
    <div className="grid grid-cols-3 gap-2 px-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
        <button key={n} tabIndex={-1} className={btn} onPointerDown={(e) => { e.preventDefault(); onDigit(String(n)); }}>
          {n}
        </button>
      ))}
      {showDecimal ? (
        <button tabIndex={-1} className={btn} onPointerDown={(e) => { e.preventDefault(); onDecimal(); }}>.</button>
      ) : (
        <div />
      )}
      <button tabIndex={-1} className={btn} onPointerDown={(e) => { e.preventDefault(); onDigit('0'); }}>0</button>
      <button tabIndex={-1} className={btn + " text-2xl"} onPointerDown={(e) => { e.preventDefault(); onBackspace(); }}>⌫</button>
      <button
        tabIndex={-1}
        className="col-span-3 h-11 rounded-lg bg-blue-600 active:bg-blue-700 text-white font-semibold text-lg select-none touch-manipulation outline-none"
        onPointerDown={(e) => { e.preventDefault(); onDone(); }}
      >
        Done
      </button>
    </div>
  );
}
