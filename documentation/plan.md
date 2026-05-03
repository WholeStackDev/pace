# Running Pace Calculator — Implementation Plan

## Overview

A mobile-first React + Tailwind web app that converts between running speed, pace, and completion times. No backend, no component library. Optimized for iPhone SE (375×667) portrait without scrolling.

---

## Architecture

- **Vite** + React (fast dev server, tiny bundle)
- **Tailwind CSS v4** for styling
- All calculations are pure functions, no external math libraries needed
- Single-page app, no routing

---

## Core UI Layout

The viewport is divided into two zones:

```
┌─────────────────────────┐
│  [Speed] [Time] [Dist]  │  ← 3 buttons, ~60px tall
├─────────────────────────┤
│                         │
│       Results Area      │  ← fills remaining space
│                         │
│                         │
└─────────────────────────┘
```

### The 3 Buttons

Displayed as a horizontal row at the top. Each button shows its current value (or a placeholder when unset):

| Button | Set State Example | Unset State |
|--------|-------------------|-------------|
| Speed | `6.5 MPH` | `— MPH` |
| Time | `32:00` | `—:——` |
| Distance | `5K` | `— mi` |

Each button should also have a small "×" to clear its value (appears only when set).

### Results Area

Content depends on which inputs are filled (see Calculation Logic below). Uses compact typography to fit on iPhone SE. Results are displayed directly — no scrolling required for the primary case (speed-only shows pace + 6 race times = ~8 rows).

---

## Modal / Bottom Sheet

When a button is tapped, a bottom sheet slides up covering ~60-70% of the screen. Contains:

1. **Display area** at the top showing the current value being entered
2. **Unit toggle** (where applicable)
3. **Preset buttons** (for distance only)
4. **Number pad** at the bottom

### Critical: No Native Keyboard

The "input display" is a styled `<div>` with a blinking cursor, NOT an `<input>` element. This prevents the native keyboard from appearing. The number pad is composed of `<button>` elements.

### Number Pad Layout

```
┌─────┬─────┬─────┐
│  1  │  2  │  3  │
├─────┼─────┼─────┤
│  4  │  5  │  6  │
├─────┼─────┼─────┤
│  7  │  8  │  9  │
├─────┼─────┼─────┤
│  .  │  0  │  ⌫  │
└─────┴─────┴─────┘
       [ Done ]
```

- The decimal key (`.`) is shown for Speed and Distance, hidden for Time
- `⌫` = backspace (delete last digit)
- `Done` confirms and closes the modal
- Tapping outside the modal or swiping down also closes it (applying the current value)

### Modal Variants

**Speed Modal:**
- Single numeric display: `6.5`
- Toggle: `MPH | KPH`
- Number pad with decimal

**Time Modal:**
- Three slot display: `[HH] : [MM] : [SS]`
- Active slot is highlighted (starts at Minutes since that's most common)
- Tap a slot to make it active
- Digits fill right-to-left within active slot (typing "3" then "2" → `32`)
- Auto-advance: after 2 digits, focus moves right (M→S). Won't auto-advance out of S.
- Number pad without decimal

**Distance Modal:**
- Numeric display: `3.1`
- Toggle: `Miles | Kilometers`
- Preset chips: `400m` `1 mi` `5K` `10K` `Half` `Marathon`
- Tapping a preset fills both value and unit, then auto-closes the modal (since the user's intent is clear)
- Number pad with decimal

---

## Calculation Logic

### Relationships

The three values are related by: `speed = distance / time`

From any two, we derive the third. Pace (min/mile or min/km) is derived from speed.

### Common Race Distances

| Label | Distance |
|-------|----------|
| 400m | 0.4 km / 0.2485 mi |
| 1 Mile | 1.609 km / 1 mi |
| 5K | 5 km / 3.107 mi |
| 10K | 10 km / 6.214 mi |
| Half Marathon | 21.097 km / 13.109 mi |
| Marathon | 42.195 km / 26.219 mi |

### Display Scenarios

**Speed only:**
- Pace: `X:XX /mi` and `X:XX /km`
- Table of race completion times (6 rows: 400m through Marathon)

**Time only:**
- Table showing for each common distance: what speed/pace that time implies
- 6 rows, each showing the distance label + implied speed + implied pace

**Distance only:**
- Table of speeds from 3 to 13 MPH (11 rows), each showing the pace and completion time at that speed for the entered distance
- Start at 3 rather than 1 (nobody runs 1-2 mph, and it saves vertical space)

**Speed + Distance (no time):**
- Calculated completion time (prominently displayed)
- Pace per mile and per km

**Speed + Time (no distance):**
- Calculated distance (prominently displayed)
- Pace per mile and per km

**Time + Distance (no speed):**
- Calculated speed in MPH and KPH (prominently displayed)
- Pace per mile and per km

**All three entered:**
- This state is reached when the user overrides a previously-calculated value
- Speed recalculates from time + distance (speed is always the "soft" value)
- Display same as Time + Distance case

### Edge Cases

- **Zero or invalid values**: A field with value 0 is treated as "not set"
- **Very small times**: Prevent division by zero (time < 1 second → treat as unset)
- **Unreasonable speeds**: Still calculate, don't gate the math. People use these for cycling/walking too.

---

## Recalculation Priority

The rule: **the most recently touched inputs win; speed is always recalculated when all three conflict.**

More precisely:
1. If only one value is set, show informational tables (no derivation needed)
2. If two values are set, derive the third
3. If the user edits a value that creates a conflict (all three set), recalculate speed from time + distance
4. Exception: if the user edits speed when time + distance are already set, recalculate time instead (since they explicitly chose to change speed, it should stick)

This means we need to track which value was most recently edited. Store a `lastEdited: 'speed' | 'time' | 'distance' | null` state.

**Revised conflict resolution:**
- `lastEdited === 'speed'` → recalculate time (keep speed + distance)
- `lastEdited === 'time'` → recalculate speed (keep time + distance)
- `lastEdited === 'distance'` → recalculate speed (keep time + distance)

Wait — this still needs care. Let's simplify:

- When the user sets a value, if all three are now set, recalculate the one that was set *earliest* (least recently touched). Track edit order.

Actually, the simplest mental model: **speed is always derived unless it was the most recent edit.** This matches the user's described behavior and covers the common case (runner knows their time and distance, wants speed/pace).

---

## Performance Considerations

- **No debouncing on calculations**: All math is trivial (division/multiplication). Calculate synchronously on every state change.
- **Avoid unnecessary re-renders**: The results component receives primitive values, so React.memo is likely unnecessary, but keep the component tree shallow.
- **No modal animation initially**: Instant show/hide for maximum snappiness. Can experiment with transitions later.
- **Touch response**: Number pad buttons should have `:active` states with zero delay. Add `touch-action: manipulation` to prevent 300ms tap delay on older browsers.
- **No layout shifts**: Reserve space for results so nothing jumps when values change.

---

## Styling & Layout Budget (iPhone SE: 375×667)

Available viewport height after Safari chrome: ~553px (worst case with address bar visible).

| Element | Height |
|---------|--------|
| Top padding | 12px |
| Button row | 52px |
| Gap | 12px |
| Results area | ~477px |

Results area needs to fit the largest non-scrolling case. "Speed only" shows:
- Pace line: ~40px
- Section header: ~24px  
- 6 race time rows × ~36px = 216px
- Total: ~280px ✓ (fits easily)

"Distance only" (11 speed rows) is the tightest:
- 11 rows × 36px = 396px + header = 420px — tight but fits within 477px

If it's too tight, we can:
- Reduce row height to 32px
- Start the speed range at 4 MPH instead of 3 (saves one row)
- Use smaller font sizes for the table

---

## File Structure

```
pace/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js (if needed beyond v4 defaults)
├── postcss.config.js
├── documentation/
│   └── plan.md (this file)
└── src/
    ├── main.jsx
    ├── index.css (tailwind imports)
    ├── App.jsx
    ├── components/
    │   ├── InputButton.jsx        (the 3 top buttons)
    │   ├── BottomSheet.jsx        (modal container with slide animation)
    │   ├── NumberPad.jsx          (reusable keypad)
    │   ├── SpeedInput.jsx         (speed modal content)
    │   ├── TimeInput.jsx          (time modal content with H/M/S slots)
    │   ├── DistanceInput.jsx      (distance modal content with presets)
    │   └── Results.jsx            (displays calculated values)
    └── utils/
        └── calculations.js        (pure conversion functions)
```

---

## Design Decisions & Potential Difficulties

### 1. Preventing native keyboard on iOS

Using a `<div>` instead of `<input>` should work, but we need to ensure:
- No hidden input is focused (some tutorials suggest a hidden input for accessibility)
- If we want accessibility, use `role="application"` on the number pad area
- Test that `contentEditable` isn't accidentally triggered

### 2. Bottom sheet dismissal

- Tap outside → close with current value applied
- Swipe down → same behavior
- "Done" button → same
- No "cancel" — the value updates live as digits are typed (user sees the results update behind the semi-transparent overlay). This makes it feel snappier.

**Decision: Live update vs. confirm?**

Option A: Results update in real-time as the user types digits in the modal (modal has semi-transparent backdrop so results are visible behind it).

Option B: Results only update when the modal is dismissed.

**Recommendation: Option A (live update).** It gives immediate feedback and makes the app feel responsive. The semi-transparent backdrop lets users see results changing. If they don't like what they see, they can keep editing.

### 3. Time entry — overflow handling

Should "75" in the minutes slot be allowed? Options:
- Clamp to 59 → frustrating if you make a typo
- Allow any value and normalize (75 min = 1h 15min) → surprising behavior
- Allow any value, don't normalize → 0:75:00 is weird but unambiguous

**Recommendation: Allow any value, normalize on close.** While editing, show raw digits. When the modal closes, normalize (75 min → 1h 15m) so the display is always clean. This is forgiving and unsurprising.

### 4. The speed range for "distance only" display

3-13 MPH covers walking (3-4), jogging (5-6), recreational running (7-9), competitive running (10-12), and elite (13+). This is a good range for most users. If space is tight, 4-12 MPH (9 rows) still covers the useful range.

### 5. Unit persistence

When the user toggles MPH↔KPH or Miles↔Km, should we remember their preference? **Yes** — store in localStorage. Default to MPH/Miles (US-centric per user's spec).

### 6. Clear behavior

Each button has a small × to clear its value. Clearing a value that was derived (calculated) should also work — it just removes it from the "set" state. This lets users go from "all three set" back to "two set" easily.

### 7. What "set" means

A value is "set" if the user has explicitly entered it (or it was calculated from other inputs). A value of 0 or empty is "unset." When a value is derived/calculated, it shows on the button but with a slightly different visual treatment (e.g., lighter color or italic) to indicate it was calculated rather than entered.

### 8. Decimal point in speed/distance

- Only allow one decimal point
- Limit to reasonable precision (2 decimal places for speed, 3 for distance)
- Leading zero: typing `.5` should display `0.5`

### 9. Modal appearance

No animation initially — the modal appears instantly (display toggle) for maximum perceived responsiveness. The backdrop appears simultaneously. We may experiment with a subtle slide-up or fade transition later if it feels better, but snappiness is the priority.

### 10. PWA considerations

Not in initial scope, but the app would benefit from being installable (add to home screen). Could add a minimal manifest.json and service worker later. Worth keeping in mind for file structure.

---

## Implementation Order

1. **Project setup**: Vite + React + Tailwind, verify build works
2. **Calculation utilities**: Pure functions with unit tests (can verify math before any UI)
3. **App shell**: Layout with 3 placeholder buttons and results area
4. **Number pad component**: Reusable, handles digit/decimal/backspace
5. **Bottom sheet component**: Slide-up animation, backdrop, dismiss behavior
6. **Speed input modal**: Simplest case (single value + unit toggle)
7. **Wire up speed → results**: Show pace and race times
8. **Time input modal**: H/M/S slot switching, auto-advance
9. **Distance input modal**: Presets + manual entry
10. **Full calculation logic**: All display scenarios, conflict resolution
11. **Polish**: Transitions, active states, touch optimization, localStorage for units
12. **Viewport testing**: Verify iPhone SE fit, adjust spacing/font sizes

---

## Tech Notes

- Use `dvh` (dynamic viewport height) units to handle mobile browser chrome appearing/disappearing
- Set `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">` to prevent zoom on "input" tap
- Add `-webkit-tap-highlight-color: transparent` to remove tap flash
- Consider `overscroll-behavior: none` on body to prevent pull-to-refresh interfering
