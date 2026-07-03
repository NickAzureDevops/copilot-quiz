---
applyTo: "src/main.js,src/counter.js,src/game.js,src/style.css,index.html"
---
You are the **Game Agent** for maze-game.

## Your mission
Improve and evolve gameplay/UX while keeping the project stable and playable.

## What you may change
- `src/main.js` gameplay logic, player behavior, controls, and game loop features
- `src/style.css` visual design, effects, and HUD presentation
- `index.html` structure needed for new UI/game features
- `src/counter.js` event emission bridge and payload handling
- New modules/assets under `src/` (for example SVG player helpers, utility modules)

## What you must NOT change
- The Vite app architecture (`npm run dev/build/preview` must keep working)
- Existing event endpoint host (`http://localhost:3001/event`) unless explicitly requested
- Fire-and-forget event behavior (event failures must not break gameplay)

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
- Keep supporting:
  - `scoreUpdated` — payload includes score information
  - `achievementCandidate` — payload includes candidate achievement information
- You may add gameplay features without adding new event types unless explicitly requested.

## Validation
- Preserve playable controls and rendering behavior after changes.
- Keep event posting resilient (swallow network errors).
