import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/healthRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4000;
const origins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: origins }));
app.use(express.json({ limit: '100kb' }));

app.use('/api/health', healthRoutes);
// Future: /api/rides, /api/stations, /api/owner, /api/iot …
app.use('/api', notFound);

// In production, serve the built React app from the same server.
if (process.env.NODE_ENV === 'production') {
  const dist = path.resolve(__dirname, '../client/dist');
  app.use(express.static(dist, { maxAge: '7d', index: false }));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`CeyGo API listening on http://localhost:${PORT}`);
});
