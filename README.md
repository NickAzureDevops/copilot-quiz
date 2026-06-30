# 👻 Pac-Man Game

A browser-based Pac-Man game with a purple neon theme, built with vanilla JavaScript and [Vite](https://vite.dev/).

![Pac-Man dashboard preview](./public/pacman-dashboard.png)

The interface includes a modern dashboard shell around the playfield, making it easier to monitor score, lives, level, and controls while testing gameplay.

## Features

- Classic Pac-Man gameplay on a canvas
- Modern arcade dashboard UI
- Purple neon visual theme
- HUD displaying score, lives, and current level
- Keyboard controls for desktop play

## GitHub Copilot Apps Demonstrated

This repository is the **Game Agent** side of a broader **GitHub Copilot Apps** demo. Its job is to keep Pac-Man playable while safely acting as the **event producer** for the wider system.

### Core skill in this repo

- **Game Agent** — understand the existing Pac-Man codebase, preserve gameplay behavior, and add safe, minimal event instrumentation such as `scoreUpdated` and achievement events
- **Context-aware code reasoning** — modify a legacy-style frontend using natural language while respecting the existing structure
- **Planning before execution** — support a human-reviewed workflow where plans can be approved before code changes are applied
- **Event-driven architecture awareness** — treat Pac-Man as the producer in an event flow that feeds downstream services

### Broader GitHub Copilot Apps system

This repo pairs with [NickAzureDevops/pac-man-services](https://github.com/NickAzureDevops/pac-man-services), where the **Platform Agent** and **Integration Agent** demonstrate the larger system story:

- **Platform / services build-out** — API endpoints, event ingestion, and dashboard surfaces live in `NickAzureDevops/pac-man-services`
- **Cross-repo orchestration** — the game emits events and the services repo consumes them to show end-to-end flow
- **Full-stack demo narrative** — frontend gameplay, backend services, and integration behavior are presented as one coordinated Copilot system
- **Tool-augmented AI workflows** — skills, agents, and MCP-style tooling combine to operate like a distributed engineering team

## Controls

| Key | Action |
|-----|--------|
| `Arrow Keys` / `WASD` | Move Pac-Man |
| `Enter` / `Space` | Start / resume game |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)

### Install dependencies

```bash
npm ci
```

### Run in development mode

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
```

The output will be in the `dist/` directory.

### Preview the production build

```bash
npm run preview
```

## Tech Stack

- **Vanilla JavaScript** — no frameworks
- **HTML5 Canvas** — game rendering
- **Vite** — dev server and bundler
- **CSS custom properties** — purple neon theming
