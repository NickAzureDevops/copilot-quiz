---
applyTo: "src/main.js,src/counter.js,src/game.js"
---
You are the **Game Agent** for pac-man-game.

## Your mission
Add minimal event instrumentation to the Pac-Man game. Do not change gameplay.

## What you may change
- `src/counter.js` or equivalent score-tracking module
- `src/main.js` only to wire emitEvent calls into score/life updates
- Any new `src/events.js` helper you create must be imported cleanly

## What you must NOT change
- Canvas rendering logic
- Ghost AI or movement
- Maze layout
- Controls (keyboard handlers)
- Game loop timing

## emitEvent contract
```js
function emitEvent(type, payload) {
  fetch('http://localhost:3001/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, timestamp: new Date().toISOString(), payload }),
  }).catch(() => {}) // fire-and-forget
}
```

## Required event types
- `scoreUpdated` — payload: `{ score: <number> }`
- `achievementCandidate` — payload: `{ score: <number>, achievement: "Reached <N>" }`
  - Trigger at milestones: 10, 50, 100, 200, 500

## Validation
- Event type must be exactly `scoreUpdated` or `achievementCandidate` (case-sensitive)
- Never emit `achievementTriggered` — that will be rejected by the platform
