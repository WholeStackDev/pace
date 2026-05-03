# Running Calculator — Implementation Summary

## What This Is

A mobile-first (iPhone SE optimized) running pace/speed/time calculator. React + Tailwind CSS v4, built with Vite. No backend, no component library, no routing. Single-page app.

Run with `npm run dev`.

---

## Core Concept

There are 3 independent values: **speed** (mph internally), **time** (seconds internally), and **distance** (miles internally). A 4th input, **pace**, is just an alternate way to enter/view speed — they share the same underlying state (`speedMph`).

From any 2 of the 3 independent values, the third can be derived. The app calculates and displays results reactively based on what's been entered.

---

## File Structure

```
src/
├── main.jsx                    Entry point (StrictMode + render)
├── index.css                   Tailwind import + viewport lock (100dvh, no scroll, no overscroll)
├── App.jsx                     All state lives here. Orchestrates modals and results.
├── components/
│   ├── BottomSheet.jsx         Modal overlay (instant appear, no animation). Blurs active element on open.
│   ├── NumberPad.jsx           Reusable digit pad. Handles keyboard input too.
│   ├── SpeedInput.jsx          Single value + MPH/KPH toggle
│   ├── PaceInput.jsx           Min:Sec slots + Per Mile/Per KM toggle
│   ├── TimeInput.jsx           H:M:S slots with per-slot fresh-start and auto-advance
│   ├── DistanceInput.jsx       Value + Miles/KM toggle + race preset chips
│   └── Results.jsx             All display scenarios (single value tables, combined 2x2 cards)
└── utils/
    └── calculations.js         Pure math functions + race distance constants + WR data
```

---

## Key Design Decisions

### No native keyboard
All "inputs" are styled `<div>`s, not `<input>` elements. The number pad is composed of `<button>` elements with `tabIndex={-1}`. This prevents the mobile keyboard from appearing and keeps the UI stable.

### Keyboard support for desktop
The `NumberPad` component registers a global `keydown` listener (via `useEffect` with a ref to avoid stale closures). Digits, decimal, Backspace, Enter, and Tab are all handled. All events call `preventDefault()` to stop browser defaults (focus cycling, button activation, etc.).

### "Fresh start" behavior
When a modal opens with an existing value, the first keystroke replaces the entire value rather than appending. This uses a `useRef` flag (`freshStart` or `slotFresh`) that resets on each open. Backspace on a fresh value clears it entirely.

### Per-slot fresh start (TimeInput and PaceInput)
Each time slot (H/M/S or M/S) independently tracks freshness. Switching to a slot that already has a value marks it fresh — the next keystroke replaces just that slot. This means you can re-enter one field without losing the others.

### Instant modals (no animation)
Modals appear/disappear via conditional rendering (`if (!open) return null`). No CSS transitions. This was a deliberate choice for perceived speed — animations may be added later.

### Conflict resolution
When all 3 values are set and the user changes one:
- Editing **speed or pace** → recalculates **time** (keeps speed + distance)
- Editing **time** → recalculates **speed** (keeps time + distance)
- Editing **distance** → recalculates **speed** (keeps time + distance)

The general rule: speed is the "soft" value that gets overridden, unless it was the thing most recently explicitly changed.

### Internal units
Everything is stored as mph / seconds / miles internally. Conversion to display units (KPH, KM, per-km pace) happens only at the UI layer. This simplifies all calculation logic.

### World record relevance highlighting
When only a time is entered, the app bolds race distances that are plausible matches for that time. A race is "relevant" if:
- The implied speed is >= 3 mph (not absurdly slow)
- The time is not faster than 99% of the current world record for that distance

WR times are stored in `RACE_DISTANCES[].wrSeconds`.

---

## UI Layout

```
┌──────────────────────────────┐
│     Running Calculator       │  header
├──────────┬───────────────────┤
│  Speed   │   Pace            │  2x2 button grid
├──────────┼───────────────────┤
│  Time    │   Distance        │
├──────────┴───────────────────┤
│                              │
│        Results Area          │  flex-1, overflow-y-auto
│                              │
└──────────────────────────────┘
```

Each button shows its current value and has a ✕ to clear. The results area content changes based on which values are set (see Results display scenarios below).

---

## Results Display Scenarios

| Inputs Set | What's Shown |
|---|---|
| Speed/Pace only | Pace per mile + per km, then completion time for each of 6 race distances |
| Time only | Table of 6 race distances with implied speed and pace for each (relevant ones bolded) |
| Distance only | Table of speeds 4-13 mph with pace and completion time for that distance |
| Speed + Distance | 2x2 cards: Speed, Pace, Time (calculated), Distance |
| Speed + Time | 2x2 cards: Speed, Pace, Time, Distance (calculated) |
| Time + Distance | 2x2 cards: Speed (calculated), Pace, Time, Distance |
| All three | Same as Time + Distance (speed recalculated) |

The 2x2 result cards match the same positions as the 2x2 input buttons (Speed top-left, Pace top-right, Time bottom-left, Distance bottom-right).

---

## Race Distances

| Label | Miles | KM | WR (seconds) |
|---|---|---|---|
| 400m | 0.2485 | 0.4 | 43.03 |
| 1 Mile | 1 | 1.60934 | 223.13 |
| 5K | 3.10686 | 5 | 755.36 |
| 10K | 6.21371 | 10 | 1571 |
| Half Marathon | 13.1094 | 21.0975 | 3451 |
| Marathon | 26.2188 | 42.195 | 7235 |

---

## Gotchas / Things to Know

1. **Speed and Pace share state.** Clearing either clears both (both call `clearValue('speed')`). Both set `lastEdited('speed')`.

2. **NumberPad uses a ref for callbacks** (`callbacksRef`) to avoid stale closures in the `keydown` listener. The effect registers once (empty deps) and reads the ref on each keystroke.

3. **All buttons in modals are `tabIndex={-1}`** to prevent focus. The `BottomSheet` also calls `document.activeElement?.blur()` on open to kill any lingering focus from the trigger button.

4. **Distance presets auto-close the modal.** They call `onDone()` directly rather than just setting the display value.

5. **Time normalization.** You can type "75" in the minutes slot of TimeInput. When Done is pressed, it's converted to total seconds (75*60 = 4500s) and the button label will show "1:15:00" via `formatTime()`. No clamping during entry.

6. **`formatPace` vs `formatTime`**: `formatPace` takes minutes (decimal) as input and returns "M:SS". `formatTime` takes total seconds and returns "H:MM:SS" or "M:SS". They look similar but have different input units.

7. **No localStorage yet.** Unit preferences reset on refresh. This was noted as a future enhancement in the original plan.

8. **No animations yet.** The plan mentions possibly adding a bottom-sheet slide-up later. Currently instant show/hide.
