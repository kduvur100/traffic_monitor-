# TrafficMonitor

A real-time network security monitoring dashboard built with Node.js, TypeScript, React, and WebSockets. It simulates live network traffic, detects anomalies using rule-based detection, and displays everything in a dark-mode dashboard.

---

## What it does

**Backend**
- Generates a continuous stream of simulated network events (normal traffic + randomized attack scenarios)
- Runs 5 built-in detection rules against a rolling 30-second window:
  - Port scan — one IP probing 10+ distinct ports
  - Brute force — repeated SSH/FTP login attempts
  - DDoS / flood — 20+ unique sources hammering one destination
  - Data exfiltration — large outbound transfers from internal IPs
  - Unusual protocol — unexpected protocol on a standard port (80/443)
- Broadcasts events, alerts, and aggregated stats to connected clients over WebSocket
- Exposes a REST API for querying historical events and alerts

**Frontend**
- Live stat bar — total events, blocked, flagged, bytes transferred, events/sec
- Area chart — 30-second rolling traffic breakdown (total / blocked / flagged)
- Pie chart — live protocol breakdown
- Alert panel — dismissible alerts color-coded by severity with acknowledge support
- Connection log — searchable, sortable, filterable table of the last 500 events

---

## Project structure

```
traffic_monitor-/
├── backend/
│   └── src/
│       ├── config/        ← all tuneable settings in one place
│       ├── types/         ← shared TypeScript interfaces
│       ├── simulator/     ← traffic generator + attack scenarios
│       ├── detector/      ← detection rules (easy to add new ones)
│       ├── store/         ← in-memory ring buffer
│       ├── routes/        ← REST API (events, alerts, health)
│       ├── websocket/     ← broadcast helper
│       └── server.ts      ← entry point
└── frontend/
    └── src/
        ├── hooks/         ← useWebSocket, useEventStore
        ├── components/    ← ui/, layout/, stats/, charts/, alerts/, logs/
        └── pages/         ← Dashboard
```

---

## Requirements

- Node.js 18+
- npm 9+

---

## Getting started

### 1. Install dependencies

```bash
npm run install:all
```

This installs packages for the root, backend, and frontend in one shot.

### 2. Run in development mode

```bash
npm run dev
```

- Backend starts on `http://localhost:4000`
- Frontend starts on `http://localhost:5173`
- Open `http://localhost:5173` in your browser

The frontend proxies `/api` and `/ws` to the backend automatically, so no CORS setup is needed in development.

### 3. Build for production

```bash
npm run build
```

Compiles the backend TypeScript to `backend/dist/` and bundles the frontend to `frontend/dist/`.

---

## REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server uptime check |
| GET | `/api/events?limit=200` | Recent network events |
| GET | `/api/events/stats` | Aggregated stats snapshot |
| GET | `/api/alerts?limit=100` | Recent alerts |
| PATCH | `/api/alerts/:id/acknowledge` | Mark an alert acknowledged |

---

## WebSocket

Connect to `ws://localhost:4000/ws`. Messages are JSON with this shape:

```json
{ "type": "event" | "alert" | "stats", "payload": { ... } }
```

---

## Configuration

All settings live in `backend/src/config/index.ts`:

| Setting | Default | Description |
|---------|---------|-------------|
| `port` | `4000` | Backend port |
| `simulatorIntervalMs` | `1000` | How often traffic is generated |
| `statsIntervalMs` | `2000` | How often stats are broadcast |
| `detectionWindowMs` | `30000` | Rolling window for anomaly detection |
| `attackScenarioChance` | `0.08` | Probability of attack burst per tick |
| `maxStoredEvents` | `5000` | Max events kept in memory |

---

## Ideas for future features

- [ ] GeoIP lookup and world map heatmap
- [ ] Persistent storage with SQLite or PostgreSQL
- [ ] Custom rule builder in the UI
- [ ] Email / Slack alert notifications
- [ ] Docker + docker-compose setup
- [ ] User-defined IP blocklists
- [ ] Dark/light theme toggle
- [ ] Export logs to CSV
