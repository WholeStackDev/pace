// Common race distances in miles, with world record times in seconds
export const RACE_DISTANCES = [
  { label: '400m', miles: 0.2485, km: 0.4, wrSeconds: 43.03 },
  { label: '1 Mile', miles: 1, km: 1.60934, wrSeconds: 223.13 },
  { label: '5K', miles: 3.10686, km: 5, wrSeconds: 755.36 },
  { label: '10K', miles: 6.21371, km: 10, wrSeconds: 1571 },
  { label: 'Half Marathon', miles: 13.1094, km: 21.0975, wrSeconds: 3451 },
  { label: 'Marathon', miles: 26.2188, km: 42.195, wrSeconds: 7235 },
];

// Determine if a race distance is a plausible match for a given time.
// Valid if implied speed >= 3mph AND time >= 99% of WR (not unrealistically fast).
export function isRelevantRace(race, timeSeconds) {
  if (!timeSeconds || timeSeconds <= 0) return false;
  const impliedSpeed = race.miles / (timeSeconds / 3600);
  const tooSlow = impliedSpeed < 3;
  const fasterThanWR = timeSeconds < race.wrSeconds * 0.99;
  return !tooSlow && !fasterThanWR;
}

// Convert speed (mph) to pace (minutes per mile)
export function speedToPacePerMile(mph) {
  if (!mph || mph <= 0) return null;
  return 60 / mph;
}

// Convert speed (mph) to pace (minutes per km)
export function speedToPacePerKm(mph) {
  if (!mph || mph <= 0) return null;
  const kph = mph * 1.60934;
  return 60 / kph;
}

// Convert mph to kph
export function mphToKph(mph) {
  return mph * 1.60934;
}

// Convert kph to mph
export function kphToMph(kph) {
  return kph / 1.60934;
}

// Convert miles to km
export function milesToKm(miles) {
  return miles * 1.60934;
}

// Convert km to miles
export function kmToMiles(km) {
  return km / 1.60934;
}

// Calculate completion time in seconds given speed (mph) and distance (miles)
export function completionTime(mph, miles) {
  if (!mph || mph <= 0 || !miles || miles <= 0) return null;
  return (miles / mph) * 3600;
}

// Calculate speed (mph) from distance (miles) and time (seconds)
export function calculateSpeed(miles, seconds) {
  if (!miles || miles <= 0 || !seconds || seconds <= 0) return null;
  return miles / (seconds / 3600);
}

// Calculate distance (miles) from speed (mph) and time (seconds)
export function calculateDistance(mph, seconds) {
  if (!mph || mph <= 0 || !seconds || seconds <= 0) return null;
  return mph * (seconds / 3600);
}

// Format seconds to H:MM:SS or M:SS or S
export function formatTime(totalSeconds) {
  if (totalSeconds == null || totalSeconds <= 0) return '—';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.round(totalSeconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Format pace (minutes as decimal) to M:SS
export function formatPace(minutes) {
  if (minutes == null || minutes <= 0) return '—';
  const m = Math.floor(minutes);
  const s = Math.round((minutes - m) * 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Convert pace (seconds per mile) to speed (mph)
export function pacePerMileToMph(paceSeconds) {
  if (!paceSeconds || paceSeconds <= 0) return 0;
  return 3600 / paceSeconds;
}

// Convert pace (seconds per km) to speed (mph)
export function pacePerKmToMph(paceSeconds) {
  if (!paceSeconds || paceSeconds <= 0) return 0;
  return (3600 / paceSeconds) / 1.60934;
}

// Convert speed (mph) to pace in seconds per mile
export function mphToPaceSeconds(mph) {
  if (!mph || mph <= 0) return 0;
  return 3600 / mph;
}

// Convert speed (mph) to pace in seconds per km
export function mphToPaceSecondsPerKm(mph) {
  if (!mph || mph <= 0) return 0;
  const kph = mph * 1.60934;
  return 3600 / kph;
}

// Convert H, M, S to total seconds
export function timeToSeconds(h, m, s) {
  return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
}

// Convert total seconds to { h, m, s }
export function secondsToHMS(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.round(totalSeconds % 60);
  return { h, m, s };
}
