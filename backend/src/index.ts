import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db';
import { initSocket } from './sockets';
import assignmentRoutes from './routes/assignment.routes';

// Import worker so it runs in the same process (simple setup)
// For production: run worker as a separate process with `npm run worker`
import './workers/generation.worker';

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting: 10 assessment generations per IP per 24 hours
const generationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10, // 10 requests per 24 hours
  keyGenerator: (req) => req.ip || 'unknown',
  message: 'Too many assessment generations. Limit: 10 per 24 hours',
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/assignments', assignmentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Create HTTP server and attach Socket.IO
const httpServer = http.createServer(app);
initSocket(httpServer, FRONTEND_URL);

// Start
async function start() {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
    console.log(`[Server] WebSocket ready`);
  });
}

start().catch(console.error);