# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Frontend (Vite dev server)
npm run dev

# Server (Socket.io room server — run in a separate terminal)
npm run dev:server

# Production build
npm run build
```

No test framework is configured.

## Architecture

Single-page React app for tracking Magic: The Gathering game state (life totals and creatures) for 2–4 players. The entire frontend lives in `src/App.tsx` as a single functional component. A separate Node.js server (`server/index.js`) handles real-time room sync via Socket.io.

### Multiplayer / Room system

- **server/index.js** — Express + Socket.io server. Stores game state per room in a `Map` keyed by 6-char room code. Events: `create-room`, `join-room`, `update-state` (broadcast to others via `socket.to(code).emit`).
- **Frontend** connects lazily via `initSocket()` only when creating or joining a room. Solo play never touches the socket.
- Every local state mutation (life, creatures) calls `emitState(updatedPlayers)` which sends full state to the server; server relays to all other clients in the room.
- `numPlayersRef` (a `useRef`) keeps `numPlayers` accessible inside `emitState` without stale closure issues.
- `SetupMode` union type drives the pre-game screens: `'home' | 'solo' | 'create' | 'join' | 'waiting'`.
- The server URL defaults to `http://localhost:3001`; override via `VITE_SERVER_URL` env variable for production.

**State shape:**
```typescript
interface Creature {
  id: number;
  name: string;
  basePower: number;
  baseToughness: number;
  powerMod: number;      // runtime counter adjustments
  toughnessMod: number;
}

interface Player {
  id: number;
  name: string;
  life: number;
  creatures: Creature[];
}
```

**UI flow:** Setup screen (player count) → Game screen (player cards with life totals and creature lists).

**Styling:** All CSS is written as inline style objects in `App.tsx`. Tailwind is installed but unused — do not add Tailwind classes.

**Responsive layout:** `windowWidth` state drives column count; the component listens to `window.resize`.

**Deployment:** Deployed to Render as a static site. The `serve` package is included for this purpose.
