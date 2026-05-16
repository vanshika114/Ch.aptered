import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from './app';

/**
 * Load environment variables from .env file
 * Must be called before accessing process.env
 */

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chaptered';

/**
 * Start server
 * 1. Connect to MongoDB
 * 2. Start Express server
 * 3. Log startup info
 */
async function startServer() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📖 Frontend: http://localhost:5173`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Startup error:', error);
    process.exit(1);
  }
}

startServer();