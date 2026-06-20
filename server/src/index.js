/**
 * EcoLens Backend — Express Server (ESM)
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/auth.js';
import entryRoutes from './routes/entries.js';
import goalRoutes from './routes/goals.js';
import communityRoutes from './routes/community.js';
import reportRoutes from './routes/reports.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Rate limiting
const rateMap = new Map();
app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  if (!rateMap.has(ip)) rateMap.set(ip, []);
  const hits = rateMap.get(ip).filter(t => now - t < 60000);
  hits.push(now);
  rateMap.set(ip, hits);
  if (hits.length > 100) return res.status(429).json({ error: 'Too many requests' });
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🌱 EcoLens API running on http://localhost:${PORT}`);
});

export default app;
