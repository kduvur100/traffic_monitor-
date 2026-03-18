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

  // Simulate occasional attack bursts
  attackScenarioChance: 0.08,   // 8 % chance per tick

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
} as const;
