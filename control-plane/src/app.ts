import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { router } from './routes/index.js';

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// API Version 1
app.use('/api/v1', router);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'AegisVPN Control Plane API', timestamp: new Date().toISOString() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: `Route ${req.method} ${req.path} not found` });
});
