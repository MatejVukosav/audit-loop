import { query } from '@audit-loop/db';
import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

router.get('/workspaces', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query('SELECT DISTINCT workspace_id FROM events ORDER BY workspace_id');
    res.json(rows.map((r: any) => r.workspace_id));
  } catch (err) {
    next(err);
  }
});

export default router;
