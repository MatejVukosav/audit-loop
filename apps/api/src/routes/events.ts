import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { sendEventsToQueue, getMetrics } from '../services/eventService';

const router = Router();

const EventPayloadSchema = z.object({
  workspace_id: z.string(),
  event_type: z.string(),
  latency_ms: z.number(),
  ai_spend_usd: z.number(),
  timestamp: z.string(),
});

// POST /events (single or batch)
router.post('/events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const events = Array.isArray(req.body) ? req.body : [req.body];
    const parsed = events.map((e) => EventPayloadSchema.parse(e));
    await sendEventsToQueue(parsed);
    res.status(202).json({ status: 'queued', count: parsed.length });
  } catch (err) {
    next(err);
  }
});

// GET /metrics?workspace_id=...
router.get('/metrics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspace_id = req.query.workspace_id;
    if (!workspace_id || typeof workspace_id !== 'string') {
      return res.status(400).json({ error: 'workspace_id required' });
    }
    const metrics = await getMetrics(workspace_id);
    res.json(metrics);
  } catch (err) {
    next(err);
  }
});

export default router;
