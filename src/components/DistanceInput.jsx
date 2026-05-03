import { useState, useEffect, useRef } from 'react';
import NumberPad from './NumberPad';
import { RACE_DISTANCES } from '../utils/calculations';

export default function DistanceInput({ value, unit, onChangeUnit, onDone }) {
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
      if (prev.length >= 7) return prev;
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
    onDone(num, unit);
  };

  const handlePreset = (race) => {
    if (unit === 'miles') {
      onDone(race.miles, 'miles');
    } else {
      onDone(race.km, 'km');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="text-center">
        <div className="text-4xl font-light h-12 flex items-center justify-center tabular-nums">
          {display || '0'}
        </div>
        <div className="flex justify-center gap-1 mt-2">
          <button
            tabIndex={-1}
            className={`px-4 py-1.5 rounded-full text-sm font-medium outline-none ${unit === 'miles' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onPointerDown={(e) => { e.preventDefault(); onChangeUnit('miles'); }}
          >Miles</button>
          <button
            tabIndex={-1}
            className={`px-4 py-1.5 rounded-full text-sm font-medium outline-none ${unit === 'km' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onPointerDown={(e) => { e.preventDefault(); onChangeUnit('km'); }}
          >Kilometers</button>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-1.5 px-2">
        {RACE_DISTANCES.map(race => (
          <button
            key={race.label}
            tabIndex={-1}
            className="px-3 py-1.5 rounded-full bg-gray-100 active:bg-gray-300 text-sm font-medium text-gray-700 select-none touch-manipulation outline-none"
            onPointerDown={(e) => { e.preventDefault(); handlePreset(race); }}
          >
            {race.label}
          </button>
        ))}
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
