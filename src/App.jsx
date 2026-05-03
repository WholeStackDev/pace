import { useState } from 'react';
import BottomSheet from './components/BottomSheet';
import SpeedInput from './components/SpeedInput';
import PaceInput from './components/PaceInput';
import TimeInput from './components/TimeInput';
import DistanceInput from './components/DistanceInput';
import Results from './components/Results';
import {
  kphToMph, mphToKph, kmToMiles, milesToKm,
  secondsToHMS, formatTime, formatPace, speedToPacePerMile, speedToPacePerKm,
  pacePerMileToMph, pacePerKmToMph, mphToPaceSeconds, mphToPaceSecondsPerKm,
} from './utils/calculations';

export default function App() {
  // Core state - always stored in mph, seconds, miles internally
  // Speed and pace are the same underlying value (speedMph). Pace is just a different view.
  const [speedMph, setSpeedMph] = useState(0);
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [distanceMiles, setDistanceMiles] = useState(0);
  const [lastEdited, setLastEdited] = useState(null);

  // Unit preferences
  const [speedUnit, setSpeedUnit] = useState('mph');
  const [paceUnit, setPaceUnit] = useState('mile');
  const [distanceUnit, setDistanceUnit] = useState('miles');

  // Modal state
  const [activeModal, setActiveModal] = useState(null);

  const handleSpeedDone = (value) => {
    let mph = value;
    if (speedUnit === 'kph') mph = kphToMph(value);
    setSpeedMph(mph);
    setLastEdited('speed');
    setActiveModal(null);
    if (mph > 0 && timeSeconds > 0 && distanceMiles > 0) {
      const time = (distanceMiles / mph) * 3600;
      setTimeSeconds(time);
    }
  };

  const handlePaceDone = (paceSeconds, unit) => {
    let mph = unit === 'mile'
      ? pacePerMileToMph(paceSeconds)
      : pacePerKmToMph(paceSeconds);
    setSpeedMph(mph);
    setLastEdited('speed');
    setActiveModal(null);
    if (mph > 0 && timeSeconds > 0 && distanceMiles > 0) {
      const time = (distanceMiles / mph) * 3600;
      setTimeSeconds(time);
    }
  };

  const handleTimeDone = (totalSeconds) => {
    setTimeSeconds(totalSeconds);
    setLastEdited('time');
    setActiveModal(null);
    if (speedMph > 0 && totalSeconds > 0 && distanceMiles > 0) {
      const speed = distanceMiles / (totalSeconds / 3600);
      setSpeedMph(speed);
    }
  };

  const handleDistanceDone = (value, unit) => {
    let miles = value;
    if (unit === 'km') miles = kmToMiles(value);
    setDistanceMiles(miles);
    setDistanceUnit(unit);
    setLastEdited('distance');
    setActiveModal(null);
    if (speedMph > 0 && timeSeconds > 0 && miles > 0) {
      const speed = miles / (timeSeconds / 3600);
      setSpeedMph(speed);
    }
  };

  const clearValue = (field, e) => {
    e.stopPropagation();
    if (field === 'speed') setSpeedMph(0);
    else if (field === 'time') setTimeSeconds(0);
    else if (field === 'distance') setDistanceMiles(0);
  };

  // Format button labels
  const speedLabel = speedMph > 0
    ? `${speedUnit === 'mph' ? speedMph.toFixed(1) : mphToKph(speedMph).toFixed(1)} ${speedUnit.toUpperCase()}`
    : `— ${speedUnit.toUpperCase()}`;

  const paceLabel = speedMph > 0
    ? `${formatPace(paceUnit === 'mile' ? speedToPacePerMile(speedMph) : speedToPacePerKm(speedMph))} /${paceUnit === 'mile' ? 'mi' : 'km'}`
    : `—:—— /${paceUnit === 'mile' ? 'mi' : 'km'}`;

  const timeLabel = timeSeconds > 0 ? formatTime(timeSeconds) : '—:——';

  const distanceLabel = distanceMiles > 0
    ? distanceUnit === 'miles'
      ? `${distanceMiles.toFixed(2)} mi`
      : `${milesToKm(distanceMiles).toFixed(2)} km`
    : `— ${distanceUnit === 'miles' ? 'mi' : 'km'}`;

  // Get values for modals
  const speedDisplayValue = speedMph > 0
    ? (speedUnit === 'mph' ? speedMph : mphToKph(speedMph))
    : 0;

  const paceDisplaySeconds = speedMph > 0
    ? (paceUnit === 'mile' ? mphToPaceSeconds(speedMph) : mphToPaceSecondsPerKm(speedMph))
    : 0;
  const paceMinutes = Math.floor(paceDisplaySeconds / 60);
  const paceSeconds = Math.round(paceDisplaySeconds % 60);

  const distanceDisplayValue = distanceMiles > 0
    ? (distanceUnit === 'miles' ? distanceMiles : milesToKm(distanceMiles))
    : 0;

  const { h, m, s } = secondsToHMS(timeSeconds);

  const btnBase = "flex flex-col items-center justify-center py-2 px-1 rounded-xl relative touch-manipulation select-none";
  const btnActive = "bg-gray-100 active:bg-gray-200";

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="text-center pt-3 pb-1 shrink-0">
        <h1 className="text-lg font-semibold text-gray-800">Running Calculator</h1>
      </div>

      {/* Input buttons - 2x2 grid */}
      <div className="grid grid-cols-2 gap-2 px-3 pb-3 shrink-0">
        <button className={`${btnBase} ${btnActive}`} onClick={() => setActiveModal('speed')}>
          <span className="text-xs text-gray-500">Speed</span>
          <span className="text-sm font-semibold tabular-nums">{speedLabel}</span>
          {speedMph > 0 && (
            <span className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-gray-400 text-xs" onClick={(e) => clearValue('speed', e)}>✕</span>
          )}
        </button>
        <button className={`${btnBase} ${btnActive}`} onClick={() => setActiveModal('pace')}>
          <span className="text-xs text-gray-500">Pace</span>
          <span className="text-sm font-semibold tabular-nums">{paceLabel}</span>
          {speedMph > 0 && (
            <span className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-gray-400 text-xs" onClick={(e) => clearValue('speed', e)}>✕</span>
          )}
        </button>
        <button className={`${btnBase} ${btnActive}`} onClick={() => setActiveModal('time')}>
          <span className="text-xs text-gray-500">Time</span>
          <span className="text-sm font-semibold tabular-nums">{timeLabel}</span>
          {timeSeconds > 0 && (
            <span className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-gray-400 text-xs" onClick={(e) => clearValue('time', e)}>✕</span>
          )}
        </button>
        <button className={`${btnBase} ${btnActive}`} onClick={() => setActiveModal('distance')}>
          <span className="text-xs text-gray-500">Distance</span>
          <span className="text-sm font-semibold tabular-nums">{distanceLabel}</span>
          {distanceMiles > 0 && (
            <span className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-gray-400 text-xs" onClick={(e) => clearValue('distance', e)}>✕</span>
          )}
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        <Results speedMph={speedMph} timeSeconds={timeSeconds} distanceMiles={distanceMiles} />
      </div>

      {/* Modals */}
      <BottomSheet open={activeModal === 'speed'} onClose={() => setActiveModal(null)}>
        <SpeedInput
          value={speedDisplayValue ? parseFloat(speedDisplayValue.toFixed(2)) : 0}
          unit={speedUnit}
          onChangeUnit={setSpeedUnit}
          onDone={handleSpeedDone}
        />
      </BottomSheet>

      <BottomSheet open={activeModal === 'pace'} onClose={() => setActiveModal(null)}>
        <PaceInput
          minutes={paceMinutes}
          seconds={paceSeconds}
          unit={paceUnit}
          onChangeUnit={setPaceUnit}
          onDone={handlePaceDone}
        />
      </BottomSheet>

      <BottomSheet open={activeModal === 'time'} onClose={() => setActiveModal(null)}>
        <TimeInput
          hours={h}
          minutes={m}
          seconds={s}
          onDone={handleTimeDone}
        />
      </BottomSheet>

      <BottomSheet open={activeModal === 'distance'} onClose={() => setActiveModal(null)}>
        <DistanceInput
          value={distanceDisplayValue ? parseFloat(distanceDisplayValue.toFixed(3)) : 0}
          unit={distanceUnit}
          onChangeUnit={setDistanceUnit}
          onDone={handleDistanceDone}
        />
      </BottomSheet>
    </div>
  );
}
