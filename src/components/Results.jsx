import {
  RACE_DISTANCES,
  speedToPacePerMile,
  speedToPacePerKm,
  completionTime,
  calculateSpeed,
  formatTime,
  formatPace,
  mphToKph,
  kmToMiles,
  isRelevantRace,
} from '../utils/calculations';

export default function Results({ speedMph, timeSeconds, distanceMiles }) {
  const hasSpeed = speedMph > 0;
  const hasTime = timeSeconds > 0;
  const hasDistance = distanceMiles > 0;

  // Speed + Time + Distance or Speed + Distance
  if (hasSpeed && hasDistance && hasTime) {
    return <SpeedDistanceTime speedMph={speedMph} timeSeconds={timeSeconds} distanceMiles={distanceMiles} />;
  }

  if (hasSpeed && hasDistance) {
    const time = completionTime(speedMph, distanceMiles);
    return <SpeedDistanceTime speedMph={speedMph} timeSeconds={time} distanceMiles={distanceMiles} />;
  }

  if (hasSpeed && hasTime) {
    const dist = speedMph * (timeSeconds / 3600);
    return <SpeedDistanceTime speedMph={speedMph} timeSeconds={timeSeconds} distanceMiles={dist} />;
  }

  if (hasTime && hasDistance) {
    const speed = calculateSpeed(distanceMiles, timeSeconds);
    return <SpeedDistanceTime speedMph={speed} timeSeconds={timeSeconds} distanceMiles={distanceMiles} />;
  }

  // Single value scenarios
  if (hasSpeed) return <SpeedOnly speedMph={speedMph} />;
  if (hasTime) return <TimeOnly timeSeconds={timeSeconds} />;
  if (hasDistance) return <DistanceOnly distanceMiles={distanceMiles} />;

  return (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
      Enter a value to see results
    </div>
  );
}

function PaceDisplay({ speedMph }) {
  const pacePerMile = formatPace(speedToPacePerMile(speedMph));
  const pacePerKm = formatPace(speedToPacePerKm(speedMph));
  return (
    <div className="flex justify-center gap-4 text-sm mb-2">
      <span><span className="font-semibold">{pacePerMile}</span> /mi</span>
      <span><span className="font-semibold">{pacePerKm}</span> /km</span>
    </div>
  );
}

function SpeedOnly({ speedMph }) {
  return (
    <div className="px-3 pt-2">
      <PaceDisplay speedMph={speedMph} />
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 text-xs">
            <th className="text-left font-medium py-1">Distance</th>
            <th className="text-right font-medium py-1">Time</th>
          </tr>
        </thead>
        <tbody>
          {RACE_DISTANCES.map(race => (
            <tr key={race.label} className="border-t border-gray-100">
              <td className="text-left py-1.5">{race.label}</td>
              <td className="text-right py-1.5 tabular-nums font-medium">{formatTime(completionTime(speedMph, race.miles))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TimeOnly({ timeSeconds }) {
  return (
    <div className="px-3 pt-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 text-xs">
            <th className="text-left font-medium py-1">Distance</th>
            <th className="text-right font-medium py-1">Speed</th>
            <th className="text-right font-medium py-1">Pace</th>
          </tr>
        </thead>
        <tbody>
          {RACE_DISTANCES.map(race => {
            const speed = calculateSpeed(race.miles, timeSeconds);
            const relevant = isRelevantRace(race, timeSeconds);
            return (
              <tr key={race.label} className={`border-t border-gray-100 ${relevant ? 'font-bold' : ''}`}>
                <td className="text-left py-1.5">{race.label}</td>
                <td className="text-right py-1.5 tabular-nums">{speed ? speed.toFixed(1) : '—'} mph</td>
                <td className="text-right py-1.5 tabular-nums">{formatPace(speedToPacePerMile(speed))} /mi</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DistanceOnly({ distanceMiles }) {
  const speeds = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  return (
    <div className="px-3 pt-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 text-xs">
            <th className="text-left font-medium py-1">Speed</th>
            <th className="text-right font-medium py-1">Pace</th>
            <th className="text-right font-medium py-1">Time</th>
          </tr>
        </thead>
        <tbody>
          {speeds.map(mph => (
            <tr key={mph} className="border-t border-gray-100">
              <td className="text-left py-1.5">{mph} mph</td>
              <td className="text-right py-1.5 tabular-nums">{formatPace(speedToPacePerMile(mph))} /mi</td>
              <td className="text-right py-1.5 tabular-nums font-medium">{formatTime(completionTime(mph, distanceMiles))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SpeedDistanceTime({ speedMph, timeSeconds, distanceMiles }) {
  return (
    <div className="px-3 pt-3">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Speed</div>
          <div className="text-lg font-semibold tabular-nums">{speedMph.toFixed(1)} mph</div>
          <div className="text-xs text-gray-500">{mphToKph(speedMph).toFixed(1)} kph</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Pace</div>
          <div className="text-lg font-semibold tabular-nums">{formatPace(speedToPacePerMile(speedMph))} /mi</div>
          <div className="text-xs text-gray-500">{formatPace(speedToPacePerKm(speedMph))} /km</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Time</div>
          <div className="text-lg font-semibold tabular-nums">{formatTime(timeSeconds)}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Distance</div>
          <div className="text-lg font-semibold tabular-nums">{distanceMiles.toFixed(2)} mi</div>
          <div className="text-xs text-gray-500">{(distanceMiles * 1.60934).toFixed(2)} km</div>
        </div>
      </div>
    </div>
  );
}
