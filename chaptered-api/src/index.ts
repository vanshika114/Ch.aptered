// chaptered-api/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import authRouter from './routes/auth';
import readingSessionRoutes from './routes/readingSessionRoutes';

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
app.use(express.json()); // Parse incoming JSON requests

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chaptered';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('[DB] MongoDB connected successfully'))
  .catch((err) => console.error('[DB] MongoDB connection error:', err));

// --- API Endpoints ---

// Authentication routes
app.use('/api/auth', authRouter);

// Reading Session routes
app.use('/api/sessions', readingSessionRoutes);

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
  
  // Example: You could define socket events here for real-time features
  // socket.on('join_club_room', (clubId) => { socket.join(clubId); });

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