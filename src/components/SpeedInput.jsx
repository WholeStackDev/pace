import { useState, useEffect, useRef } from 'react';
import NumberPad from './NumberPad';

export default function SpeedInput({ value, unit, onChangeUnit, onDone }) {
  const [display, setDisplay] = useState(value ? String(value) : '');
  const freshStart = useRef(!!value);

  useEffect(() => {
    setDisplay(value ? String(value) : '');
    freshStart.current = !!value;
  }, [value]);

  const handleDigit = (d) => {
    if (freshStart.current) {
      freshStart.current = false;
      setDisplay(d);
      return;
    }
    setDisplay(prev => {
      if (prev.length >= 6) return prev;
      return prev + d;
    });
  };

  const handleDecimal = () => {
    if (freshStart.current) {
      freshStart.current = false;
      setDisplay('0.');
      return;
    }
    setDisplay(prev => {
      if (prev.includes('.')) return prev;
      return prev === '' ? '0.' : prev + '.';
    });
  };

  const handleBackspace = () => {
    if (freshStart.current) {
      freshStart.current = false;
      setDisplay('');
      return;
    }
    setDisplay(prev => prev.slice(0, -1));
  };

  const handleDone = () => {
    const num = parseFloat(display) || 0;
    onDone(num);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="text-center">
        <div className="text-4xl font-light h-12 flex items-center justify-center tabular-nums" aria-live="polite" aria-label={`Speed: ${display || '0'} ${unit.toUpperCase()}`}>
          {display || '0'}
        </div>
        <div className="flex justify-center gap-1 mt-2" role="group" aria-label="Speed unit">
          <button
            tabIndex={-1}
            className={`px-4 py-1.5 rounded-full text-sm font-medium outline-none ${unit === 'mph' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            aria-pressed={unit === 'mph'}
            onPointerDown={(e) => { e.preventDefault(); onChangeUnit('mph'); }}
          >MPH</button>
          <button
            tabIndex={-1}
            className={`px-4 py-1.5 rounded-full text-sm font-medium outline-none ${unit === 'kph' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            aria-pressed={unit === 'kph'}
            onPointerDown={(e) => { e.preventDefault(); onChangeUnit('kph'); }}
          >KPH</button>
        </div>
      </div>
      <NumberPad
        onDigit={handleDigit}
        onDecimal={handleDecimal}
        onBackspace={handleBackspace}
        onDone={handleDone}
        showDecimal={true}
      />
    </div>
  );
}
