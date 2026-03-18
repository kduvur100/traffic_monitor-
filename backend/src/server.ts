import http from 'http';
import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { store } from './store/index.js';
import { TrafficSimulator } from './simulator/index.js';
import { AnomalyDetector } from './detector/index.js';
import { initWebSocket, broadcast } from './websocket/index.js';
import apiRouter from './routes/index.js';

// ─── Express setup ─────────────────────────────────────────────────────────────

const app = express();
app.use(cors({ origin: config.cors.origin }));
app.use(express.json());
app.use('/api', apiRouter);

// ─── HTTP + WebSocket server ───────────────────────────────────────────────────

const server = http.createServer(app);
initWebSocket(server);

// ─── Wire simulator → store → broadcast → detector ────────────────────────────

const simulator = new TrafficSimulator();
const detector = new AnomalyDetector();

simulator.onEvents((events) => {
  store.addEvents(events);

  // Broadcast each event to connected clients
  for (const event of events) {
    broadcast('event', event);
  }

  // Run detection against the rolling window
  const window = store.getEventsInWindow(config.detectionWindowMs);
  detector.analyse(events, window);
});

detector.onAlert((alert) => {
  store.addAlert(alert);
  broadcast('alert', alert);
  console.log(`[Alert] ${alert.severity.toUpperCase()} — ${alert.message}`);
});

// Broadcast aggregated stats on a slower interval
setInterval(() => {
  const stats = store.computeStats();
  broadcast('stats', stats);
}, config.statsIntervalMs);

// ─── Start ────────────────────────────────────────────────────────────────────

simulator.start();

server.listen(config.port, () => {
  console.log(`[Server] listening on http://localhost:${config.port}`);
});

// Graceful shutdown
const shutdown = () => {
  console.log('\n[Server] shutting down...');
  simulator.stop();
  server.close(() => process.exit(0));
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
