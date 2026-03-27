// Central config — override with env vars in production

export const config = {
  port: Number(process.env.PORT) || 4000,
  wsPath: '/ws',

  // How often (ms) the simulator emits a batch of events
  simulatorIntervalMs: 1000,

  // How often (ms) aggregated stats are broadcast
  statsIntervalMs: 2000,

  // Rolling window used for anomaly detection (ms)
  detectionWindowMs: 30_000,

  // Maximum events kept in memory
  maxStoredEvents: 5_000,

  // Maximum alerts kept in memory
  maxStoredAlerts: 500,

  // Simulate occasional attack bursts (override with ATTACK_CHANCE=0.25 for heavy testing)
  attackScenarioChance: Number(process.env.ATTACK_CHANCE) || 0.08,

  // Max events sent to clients in a single WebSocket tick.
  // Attack bursts can produce 40+ events at once — this prevents
  // flooding slow clients while still delivering all events.
  maxEventsPerBroadcast: 20,

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
} as const;
