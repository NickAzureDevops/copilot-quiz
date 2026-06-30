# Copilot instructions for pac-man-game

This repository is the **legacy Pac-Man game** being AI-instrumented as part of the Copilot Apps demo.

## Role in demo
This is the **event producer**. It runs a browser-based Pac-Man game and emits events to `pac-man-services` when meaningful things happen (score changes, achievements).

## Hard constraints
- Do NOT refactor gameplay logic
- Do NOT add new game features
- Do NOT change the canvas rendering or controls
- Only add minimal event emission hooks
- Keep `emitEvent()` fire-and-forget (errors must be silently swallowed)

## Event emission rules
All events POST to `http://localhost:3001/event` with shape:
```json
{
  "type": "scoreUpdated" | "achievementCandidate",
  "timestamp": "<ISO-8601>",
  "payload": {}
}
```

### scoreUpdated
Emit whenever the player score increases:
```json
{ "score": 150 }
```

### achievementCandidate
Emit when score crosses milestone thresholds (e.g. 10, 50, 100, 200):
```json
{ "score": 100, "achievement": "Reached 100" }
```

## Integration context
Consumer repo: https://github.com/NickAzureDevops/pac-man-services

## Agent role
The **Game Agent** owns this repo. Its only job is adding/fixing event emission — nothing else.
