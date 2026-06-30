# Product

## Register

product

## Users
Developers and testers are the primary audience. They use the game as a runnable interface while instrumenting events, verifying gameplay behavior, and demoing the app locally. The UI should optimize for immediate readability, predictable controls, and quick visual parsing while the game is in motion.

## Product Purpose
This project delivers a browser-based Pac-Man experience with clear game-state feedback and lightweight instrumentation hooks. It exists to provide a playable surface that is easy to run, easy to inspect, and strong enough visually to support demos without getting in the way of the gameplay loop.

## Brand Personality
Modern arcade neon. Clear, energetic, and confident rather than nostalgic-for-its-own-sake. The interface should feel playful and alive while staying legible and functional for developers who are watching score, lives, level, and event behavior.

## Anti-references
Avoid anything that looks like a generic Vite starter or template-derived demo surface. Also avoid overcomplicated dashboard styling that competes with the playfield instead of supporting it.

## Design Principles
1. Gameplay stays primary; interface chrome supports the canvas rather than stealing focus.
2. Fast readability beats decorative complexity; score, lives, level, and prompts should parse instantly.
3. Modern arcade energy comes from committed color, glow discipline, and contrast, not visual noise.
4. Interaction patterns should remain familiar and frictionless so developers can focus on testing and demoing.
5. Presentation should feel polished enough for demos while remaining lightweight and direct in day-to-day use.

## Accessibility & Inclusion
Prioritize basic readability with strong contrast and obvious state changes. Use restrained motion outside the gameplay itself, keep interface text legible against dark surfaces, and avoid color choices that weaken scannability of essential HUD elements.
