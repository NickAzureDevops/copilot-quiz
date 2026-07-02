# 🧩 GitHub Copilot Apps — Lab Instructions

> **Goal:** Use GitHub Copilot Chat, Agents, Canvas, MCP, and automation to evolve a legacy game into a multi-repo, event-driven system — without rebuilding it.

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────┐
│       CANVAS (Runtime)       │
│   Plan + Agents + Approval   │
└─────────────┬────────────────┘
              │
   ┌──────────┼──────────────┐
   ▼          ▼              ▼
🎮 maze-game   🌐 pac-man-services   🔗 MCP Layer
(event producer) (event consumer)   (tool bridge)
   │                   │
   └──── HTTP POST ────┘
         /event
              │
              ▼
      live dashboard UI
```

---

## 📦 Repositories

| Repo | Role | Your job |
|------|------|----------|
| **maze-game** (this repo) | Legacy frontend, event producer | Add minimal event emission hooks only |
| **pac-man-services** | AI-built backend platform, event consumer | Build the API, event store, and dashboard |

---

## 🤖 Agents

| Agent | Repo | Responsibility |
|-------|------|---------------|
| **Game Agent** | maze-game | Instruments the game with safe event emission |
| **Platform Agent** | pac-man-services | Creates the Express API, event store, and UI dashboard |
| **Integration Agent** | Both | Connects event flow and validates schema consistency end-to-end |

---

## 🎮 Lab 1 — maze-game (this repo)

**Owner: Game Agent**

### Prerequisites

```bash
git clone https://github.com/NickAzureDevops/maze-game
cd maze-game
npm ci
npm run dev       # http://localhost:5173
```

### What you are allowed to change

- `src/counter.js` — the `emitEvent()` HTTP bridge
- `emitEvent()` call sites in `src/main.js` — adding calls only

### What you must NOT touch

- `draw()` — canvas rendering
- `moveGhost()` — ghost AI
- `TEMPLATE` array — maze layout
- `keydown` handler — controls
- `PAC_SPEED`, `GHOST_SPEED` — timing constants
- `index.html` — HUD structure

### Step 1 — Implement `emitEvent`

Open `src/counter.js` and implement the fire-and-forget HTTP bridge:

```js
export function emitEvent(type, payload) {
  fetch('http://localhost:3001/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, timestamp: new Date().toISOString(), payload }),
  }).catch(() => {}) // never let event errors affect gameplay
}
```

> **Rule:** Always swallow errors. The game loop must never be blocked or interrupted by event emission.

### Step 2 — Emit `scoreUpdated`

In `src/main.js`, find where the score increases (dot collection, power pellet) and add:

```js
emitEvent('scoreUpdated', { score, delta: points, level })
```

Emit on **every** score change.

### Step 3 — Emit `achievementCandidate`

Milestones: `100, 500, 1000, 2500, 5000` points and each level-up.

```js
emitEvent('achievementCandidate', {
  score,
  achievement: `Reached ${score} points!`,
  level
})
```

Emit **once per milestone** — track which thresholds have already fired.

### Step 4 — Event shape

Every POST to `http://localhost:3001/event` must match:

```json
{
  "type": "scoreUpdated",
  "timestamp": "2026-07-02T21:00:00.000Z",
  "payload": { "score": 150, "delta": 10, "level": 1 }
}
```

> **Never** use `achievementTriggered` — it is rejected by pac-man-services.

### Step 5 — Verify

1. Start pac-man-services: `cd ../pac-man-services && node src/server.js`
2. Start game: `npm run dev`
3. Play and earn points
4. Open `http://localhost:3001` — events should appear within 2 seconds
5. Check browser console — there must be no CORS errors

---

## 🌐 Lab 2 — pac-man-services

**Owner: Platform Agent**

> These instructions belong in the [pac-man-services](https://github.com/NickAzureDevops/pac-man-services) repo.

### Prerequisites

```bash
git clone https://github.com/NickAzureDevops/pac-man-services
cd pac-man-services
npm ci
node src/server.js    # http://localhost:3001
```

### What to build

The Platform Agent creates a minimal Node.js + Express platform with:

| Piece | Description |
|-------|-------------|
| `POST /event` | Accepts and stores incoming game events |
| `GET /events` | Returns all stored events as JSON |
| `GET /` | Simple live dashboard UI |
| In-memory store | Array of events, reset on restart |
| CORS | Open (`*`) — the game runs on a different port |

### Step 1 — Express server + CORS

```js
const express = require('express')
const app = express()
app.use(express.json())
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  next()
})
```

### Step 2 — Event store + POST /event

```js
const events = []

app.post('/event', (req, res) => {
  const { type, timestamp, payload } = req.body
  if (!['scoreUpdated', 'achievementCandidate'].includes(type)) {
    return res.status(400).json({ error: 'Unknown event type' })
  }
  events.push({ type, timestamp, payload, receivedAt: new Date().toISOString() })
  res.status(201).json({ ok: true })
})
```

### Step 3 — GET /events

```js
app.get('/events', (req, res) => res.json(events))
```

### Step 4 — Dashboard UI (GET /)

Serve an HTML page that polls `GET /events` every 2 seconds and renders a live table of score and achievement events.

### Step 5 — Schema contract

| Event type | Required payload fields |
|------------|------------------------|
| `scoreUpdated` | `score`, `delta`, `level` |
| `achievementCandidate` | `score`, `achievement`, `level` |

Reject any event type not in the allowed list with HTTP 400.

### Step 6 — Verify

1. `node src/server.js`
2. `curl -X POST http://localhost:3001/event -H "Content-Type: application/json" -d '{"type":"scoreUpdated","timestamp":"2026-07-02T00:00:00Z","payload":{"score":10,"delta":10,"level":1}}'`
3. `curl http://localhost:3001/events` — should return the event
4. Open `http://localhost:3001` — dashboard should show the event

---

## 🔗 Lab 3 — Integration (both repos)

**Owner: Integration Agent**

### End-to-end checklist

- [ ] `pac-man-services` is running on port `3001`
- [ ] `maze-game` is running on port `5173`
- [ ] Playing the game triggers `scoreUpdated` POSTs visible in `GET /events`
- [ ] Reaching a milestone threshold triggers `achievementCandidate`
- [ ] No CORS errors in the browser console
- [ ] No gameplay disruption — the game loop is unaffected by network failures

### Schema consistency check

Run this against the live service while playing:

```bash
watch -n 2 'curl -s http://localhost:3001/events | python3 -m json.tool'
```

Every `scoreUpdated` event must have `score`, `delta`, and `level` in payload.
Every `achievementCandidate` event must have `score`, `achievement`, and `level`.

---

## 📋 What each feature proves

| Feature | Demo proof |
|---------|------------|
| **Copilot Chat** | Natural language code changes in a legacy repo |
| **Copilot Agents** | Role-based execution across repos |
| **Canvas** | Plan generation, human approval, then execution |
| **MCP** | Safe tool bridge — agents read/write repos and call APIs |
| **Multi-repo orchestration** | Game + services working together live |
| **Full-stack generation** | API + dashboard + repo scaffolding from a prompt |
| **Event-driven architecture** | Score events flow into a live UI |
| **Automation** | End-to-end workflow from a single trigger |

---

## 🧭 Demo Narrative (30 seconds)

> "We start with a legacy game. Copilot Chat understands it, the Game Agent instruments it, Canvas governs the plan, MCP connects the tools, and the Platform and Integration Agents turn it into a multi-repo event-driven system."
