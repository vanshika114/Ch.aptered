// chaptered-api/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initDatabase, isMongoDB, getDBType } from './db';
import authRouter from './routes/auth';
import readingSessionRoutes from './routes/readingSessionRoutes';
import clubRoutes from './routes/clubRoutes';
import voteRoutes from './routes/voteRoutes';
import bookRoutes from './routes/bookRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { auth } from './middleware/auth';
import { authLimiter, inviteLimiter, voteLimiter } from './middleware/rateLimiter';
import { getDashboardStats } from './controllers/dashboardController';

// Define interface for search results if not shared elsewhere
interface SearchResult {
  id: string;
  title: string;
  author?: string;
  totalPages?: number;
  coverImage?: string;
}

dotenv.config(); // Load environment variables

const app = express();
const httpServer = createServer(app); // Create HTTP server for Socket.IO
const io = new Server(httpServer, { // Initialize Socket.IO server
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // Allow frontend origin
    methods: ['GET', 'POST'], // Allowed HTTP methods
  }
});

// Middleware
app.use(cors());       // Enable CORS for all routes
app.use(express.json({ limit: '50mb' })); // Parse incoming JSON requests (large limit for base64 PDFs)
app.set('io', io); // Make Socket.IO accessible in controllers

// Initialize database (SQLite by default, MongoDB when DB_TYPE=mongodb)
initDatabase();

// --- API Endpoints ---

// Self endpoint (not rate-limited — just checks token validity)
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const { User } = require('./models/User');
    const user = await User.findById((req as any).user?.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ id: user._id, username: user.username, email: user.email, createdAt: user.createdAt });
  } catch (e) {
    console.error('[Me Error]:', e);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Authentication routes (rate-limited: 10 req/15min)
app.use('/api/auth', authLimiter, authRouter);

// Reading Session routes
app.use('/api/sessions', readingSessionRoutes);

// Club routes
app.use('/api/clubs', clubRoutes);

// Vote routes
app.use('/api/votes', voteRoutes);

// Book routes (persistent storage)
app.use('/api/books', bookRoutes);

// Notification routes
app.use('/api/notifications', notificationRoutes);

// Dashboard stats (protected)
app.get('/api/dashboard/stats', auth, getDashboardStats);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Chaptered API is running' });
});

// Book Search Endpoint — Google Books API + fallback
app.get('/api/books/search', async (req, res) => {
  const query = req.query.q as string | undefined;

  if (!query) {
    return res.status(400).json({ error: 'Search query parameter "q" is required.' });
  }

  console.log(`[API] Received search query: "${query}"`);

  try {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY || '';
    const url = apiKey
      ? `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=10`
      : `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const results = data.items.map((item: any, index: number) => {
        const info = item.volumeInfo || {};
        return {
          id: item.id || `gb_${index}_${Date.now()}`,
          title: info.title || 'Unknown Title',
          author: (info.authors && info.authors[0]) || 'Unknown Author',
          totalPages: info.pageCount || 0,
          coverImage: info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '',
          description: info.description || '',
        };
      });
      return res.json({ query, results, source: 'google_books' });
    }

    // Fallback to mock results if Google Books returns empty
    const fallback = [
      { id: `mock_1_${Date.now()}`, title: `"${query}" — A Complete Guide`, author: 'Alex Morgan', totalPages: 380, coverImage: '' },
      { id: `mock_2_${Date.now()}`, title: `The World of ${query}`, author: 'Sam Rivera', totalPages: 295, coverImage: '' },
      { id: `mock_3_${Date.now()}`, title: `Mastering ${query}`, author: 'Jordan Lee', totalPages: 420, coverImage: '' },
    ];
    res.json({ query, results: fallback, source: 'fallback' });

  } catch (error) {
    console.error(`[API] Search error for "${query}":`, error);
    // Final fallback
    const fallback = [
      { id: `mock_1_${Date.now()}`, title: `"${query}" — A Complete Guide`, author: 'Alex Morgan', totalPages: 380, coverImage: '' },
      { id: `mock_2_${Date.now()}`, title: `The World of ${query}`, author: 'Sam Rivera', totalPages: 295, coverImage: '' },
      { id: `mock_3_${Date.now()}`, title: `Mastering ${query}`, author: 'Jordan Lee', totalPages: 420, coverImage: '' },
    ];
    res.json({ query, results: fallback, source: 'fallback' });
  }
});

// --- Socket.IO Setup ---
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_user', (userId: string) => {
    socket.join(`user:${userId}`);
    console.log(`Socket ${socket.id} joined user:${userId}`);
  });

  socket.on('join_club', (clubId: string) => {
    socket.join(`club:${clubId}`);
    console.log(`Socket ${socket.id} joined club:${clubId}`);
  });

  socket.on('leave_club', (clubId: string) => {
    socket.leave(`club:${clubId}`);
    console.log(`Socket ${socket.id} left club:${clubId}`);
  });

  socket.on('club_message', (data: { clubId: string; userId: string; username: string; text: string }) => {
    const msg = {
      ...data,
      timestamp: new Date().toISOString(),
    };
    io.to(`club:${data.clubId}`).emit('club_message', msg);
  });

  socket.on('club_typing', (data: { clubId: string; userId: string; username: string }) => {
    socket.to(`club:${data.clubId}`).emit('club_typing', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// --- Server Startup ---
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export { app, httpServer };