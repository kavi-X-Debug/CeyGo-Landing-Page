import { Router } from 'express';

const router = Router();

// GET /api/health — lightweight liveness check for the API.
router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'ceygo-api',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

export default router;
