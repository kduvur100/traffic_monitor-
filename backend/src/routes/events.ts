import { Router } from 'express';
import { store } from '../store/index.js';

const router = Router();

/** GET /api/events?limit=200 */
router.get('/', (_req, res) => {
  const limit = Math.min(Number(_req.query.limit) || 200, 1000);
  res.json(store.getRecentEvents(limit));
});

/** GET /api/events/stats */
router.get('/stats', (_req, res) => {
  res.json(store.computeStats());
});

export default router;
