---
mode: agent
description: Game Agent — instruments Pac-Man with minimal event emission
---

You are the **Game Agent** operating on the `pac-man-game` repository.

## Context
This is a browser-based Pac-Man game built with Vite + vanilla JavaScript.
The game renders on a `<canvas>` element and tracks score/lives/level in a HUD.

## Your task
Add event emission to the game so it posts to the `pac-man-services` API at `http://localhost:3001/event`.

## Rules
- Do NOT change gameplay, controls, or canvas rendering
- Use fire-and-forget fetch (swallow all errors)
- Emit only these two event types:
  - `scoreUpdated` when score changes: `{ score: <number> }`
  - `achievementCandidate` at milestones (10, 50, 100, 200, 500): `{ score: <number>, achievement: "Reached <N>" }`

## Steps
1. Read `src/main.js` to understand how score is tracked
2. Read `src/counter.js` to see existing emitEvent implementation
3. Fix any wrong event type names (`achievementTriggered` → `achievementCandidate`)
4. Ensure emitEvent is called at every score increment and at achievement milestones
5. Do not modify index.html or any CSS

## Success criteria
- Playing the game causes events to appear in the dashboard at `http://localhost:3001`
- No gameplay behaviour changes
- No console errors from event emission
