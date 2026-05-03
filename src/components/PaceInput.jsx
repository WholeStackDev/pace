import { useState, useEffect, useRef } from 'react';
import NumberPad from './NumberPad';

export default function PaceInput({ minutes, seconds, unit, onChangeUnit, onDone }) {
  const [m, setM] = useState(minutes ? String(minutes) : '');
  const [s, setS] = useState(seconds ? String(seconds) : '');
  const [activeSlot, setActiveSlot] = useState('m');
  const slotFresh = useRef({ m: !!minutes, s: !!seconds });

  useEffect(() => {
    setM(minutes ? String(minutes) : '');
    setS(seconds ? String(seconds) : '');
    slotFresh.current = { m: !!minutes, s: !!seconds };
  }, [minutes, seconds]);

  const switchSlot = (slot) => {
    setActiveSlot(slot);
    const val = slot === 'm' ? m : s;
    if (val) slotFresh.current[slot] = true;
  };

  const getSet = () => {
    if (activeSlot === 'm') return [m, setM];
    return [s, setS];
  };

  const handleDigit = (d) => {
    if (slotFresh.current[activeSlot]) {
      slotFresh.current[activeSlot] = false;
      if (activeSlot === 'm') setM(d);
      else setS(d);
      return;
    }
    const [val, setter] = getSet();
    if (val.length >= 3) return;
    const next = val + d;
    setter(next);
    // Auto-advance after 2 digits in minutes
    if (next.length === 2 && activeSlot === 'm') switchSlot('s');
  };

  const handleBackspace = () => {
    if (slotFresh.current[activeSlot]) {
      slotFresh.current[activeSlot] = false;
      if (activeSlot === 'm') setM('');
      else setS('');
      return;
    }
    const [val, setter] = getSet();
    setter(val.slice(0, -1));
  };

  const handleDone = () => {
    const totalSeconds = (parseInt(m) || 0) * 60 + (parseInt(s) || 0);
    onDone(totalSeconds, unit);
  };

  const slotClass = (slot) =>
    `flex-1 text-center py-2 rounded-lg text-3xl font-light tabular-nums outline-none ${activeSlot === slot ? 'bg-blue-50 ring-2 ring-blue-400' : ''}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-6" role="group" aria-label="Pace value">
        <button tabIndex={-1} className={slotClass('m')} aria-label={`Minutes: ${m || '0'}`} aria-pressed={activeSlot === 'm'} onPointerDown={(e) => { e.preventDefault(); switchSlot('m'); }}>
          <span className="text-3xl">{m || '0'}</span>
          <span className="text-xs text-gray-500 ml-1">min</span>
        </button>
        <span className="text-2xl text-gray-400" aria-hidden="true">:</span>
        <button tabIndex={-1} className={slotClass('s')} aria-label={`Seconds: ${s || '0'}`} aria-pressed={activeSlot === 's'} onPointerDown={(e) => { e.preventDefault(); switchSlot('s'); }}>
          <span className="text-3xl">{s || '0'}</span>
          <span className="text-xs text-gray-500 ml-1">sec</span>
        </button>
      </div>
      <div className="flex justify-center gap-1" role="group" aria-label="Pace unit">
        <button
          tabIndex={-1}
          className={`px-4 py-1.5 rounded-full text-sm font-medium outline-none ${unit === 'mile' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          aria-pressed={unit === 'mile'}
          onPointerDown={(e) => { e.preventDefault(); onChangeUnit('mile'); }}
        >Per Mile</button>
        <button
          tabIndex={-1}
          className={`px-4 py-1.5 rounded-full text-sm font-medium outline-none ${unit === 'km' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          aria-pressed={unit === 'km'}
          onPointerDown={(e) => { e.preventDefault(); onChangeUnit('km'); }}
        >Per KM</button>
      </div>
      <NumberPad
        onDigit={handleDigit}
        onDecimal={() => {}}
        onBackspace={handleBackspace}
        onDone={handleDone}
        onTab={(shiftKey) => {
          const slots = ['m', 's'];
          const idx = slots.indexOf(activeSlot);
          const next = shiftKey
            ? slots[(idx - 1 + 2) % 2]
            : slots[(idx + 1) % 2];
          switchSlot(next);
        }}
        showDecimal={false}
      />
    </div>
  );
}
