import { Router } from 'express';
import eventsRouter from './events.js';
import alertsRouter from './alerts.js';

const router = Router();

router.use('/events', eventsRouter);
router.use('/alerts', alertsRouter);

/** GET /api/health */
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

export default router;
