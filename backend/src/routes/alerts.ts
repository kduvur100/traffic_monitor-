import { Router } from 'express';
import { store } from '../store/index.js';

const router = Router();

/** GET /api/alerts?limit=100 */
router.get('/', (_req, res) => {
  const limit = Math.min(Number(_req.query.limit) || 100, 500);
  res.json(store.getAlerts(limit));
});

/** PATCH /api/alerts/:id/acknowledge */
router.patch('/:id/acknowledge', (req, res) => {
  const ok = store.acknowledgeAlert(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Alert not found' });
  res.json({ success: true });
});

export default router;
