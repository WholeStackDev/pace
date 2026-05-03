import { useState, useEffect, useRef } from 'react';
import NumberPad from './NumberPad';

export default function TimeInput({ hours, minutes, seconds, onDone }) {
  const [h, setH] = useState(hours ? String(hours) : '');
  const [m, setM] = useState(minutes ? String(minutes) : '');
  const [s, setS] = useState(seconds ? String(seconds) : '');
  const [activeSlot, setActiveSlot] = useState('m');
  // Track per-slot fresh state: first keystroke in a slot replaces its value
  const slotFresh = useRef({ h: !!hours, m: !!minutes, s: !!seconds });

  useEffect(() => {
    setH(hours ? String(hours) : '');
    setM(minutes ? String(minutes) : '');
    setS(seconds ? String(seconds) : '');
    slotFresh.current = { h: !!hours, m: !!minutes, s: !!seconds };
  }, [hours, minutes, seconds]);

  const switchSlot = (slot) => {
    // Switching to a slot that has a value marks it fresh (next keystroke replaces)
    setActiveSlot(slot);
    const val = slot === 'h' ? h : slot === 'm' ? m : s;
    if (val) slotFresh.current[slot] = true;
  };

  const getSet = () => {
    if (activeSlot === 'h') return [h, setH];
    if (activeSlot === 'm') return [m, setM];
    return [s, setS];
  };

  const handleDigit = (d) => {
    if (slotFresh.current[activeSlot]) {
      slotFresh.current[activeSlot] = false;
      // Replace the active slot's value with this digit
      if (activeSlot === 'h') setH(d);
      else if (activeSlot === 'm') setM(d);
      else setS(d);
      return;
    }
    const [val, setter] = getSet();
    if (val.length >= 3) return;
    const next = val + d;
    setter(next);
    // Auto-advance after 2 digits (except seconds)
    if (next.length === 2 && activeSlot === 'h') switchSlot('m');
    else if (next.length === 2 && activeSlot === 'm') switchSlot('s');
  };

  const handleBackspace = () => {
    if (slotFresh.current[activeSlot]) {
      slotFresh.current[activeSlot] = false;
      if (activeSlot === 'h') setH('');
      else if (activeSlot === 'm') setM('');
      else setS('');
      return;
    }
    const [val, setter] = getSet();
    setter(val.slice(0, -1));
  };

  const handleDone = () => {
    // Normalize: overflow minutes/seconds into higher units
    let totalSeconds = (parseInt(h) || 0) * 3600 + (parseInt(m) || 0) * 60 + (parseInt(s) || 0);
    onDone(totalSeconds);
  };

  const slotClass = (slot) =>
    `flex-1 text-center py-2 rounded-lg text-3xl font-light tabular-nums outline-none ${activeSlot === slot ? 'bg-blue-50 ring-2 ring-blue-400' : ''}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1 px-4">
        <button tabIndex={-1} className={slotClass('h')} onPointerDown={(e) => { e.preventDefault(); switchSlot('h'); }}>
          <span className="text-3xl">{h || '0'}</span>
          <span className="text-xs text-gray-500 ml-1">h</span>
        </button>
        <span className="text-2xl text-gray-400">:</span>
        <button tabIndex={-1} className={slotClass('m')} onPointerDown={(e) => { e.preventDefault(); switchSlot('m'); }}>
          <span className="text-3xl">{m || '0'}</span>
          <span className="text-xs text-gray-500 ml-1">m</span>
        </button>
        <span className="text-2xl text-gray-400">:</span>
        <button tabIndex={-1} className={slotClass('s')} onPointerDown={(e) => { e.preventDefault(); switchSlot('s'); }}>
          <span className="text-3xl">{s || '0'}</span>
          <span className="text-xs text-gray-500 ml-1">s</span>
        </button>
      </div>
      <NumberPad
        onDigit={handleDigit}
        onDecimal={() => {}}
        onBackspace={handleBackspace}
        onDone={handleDone}
        onTab={(shiftKey) => {
          const slots = ['h', 'm', 's'];
          const idx = slots.indexOf(activeSlot);
          const next = shiftKey
            ? slots[(idx - 1 + 3) % 3]
            : slots[(idx + 1) % 3];
          switchSlot(next);
        }}
        showDecimal={false}
      />
    </div>
  );
}
