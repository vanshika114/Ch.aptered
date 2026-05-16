import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';

/**
 * Create Express app
 */
const app = express();

/**
 * Middleware: Parse JSON request bodies
 */
app.use(express.json());

/**
 * Middleware: Enable CORS
 * Allow requests from frontend (http://localhost:5173)
 * In production, restrict to actual frontend domain
 */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true // Allow cookies in requests
  })
);

/**
 * Routes
 */
app.use('/api/auth', authRoutes);

/**
 * Health check endpoint
 * GET /api/health → { status: 'OK' }
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

/**
 * 404 handler: Catch undefined routes
 * Use app.all() instead of app.use() for wildcard routes
 */
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app;