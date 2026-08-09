require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const mongoose = require('mongoose');
const { initSocket } = require('./src/sockets');

const PORT = process.env.PORT || 5000;

// Create HTTP server (needed to attach Socket.io)
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Connect to MongoDB then start server
const startServer = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    const isProduction = process.env.NODE_ENV === 'production';

    if (!mongoUri && isProduction) {
      throw new Error('MONGODB_URI environment variable is required in production.');
    }

    try {
      await mongoose.connect(mongoUri || 'mongodb://127.0.0.1:27017/foodexpress');
      console.log('✅ Connected to MongoDB database');
    } catch (dbErr) {
      if (isProduction) {
        throw new Error(`Cloud MongoDB connection failed: ${dbErr.message}`);
      }
      console.warn('⚠️ Cloud MongoDB connection notice:', dbErr.message);
      console.log('🔄 Connecting to fallback database...');
      await mongoose.connect('mongodb://127.0.0.1:27017/foodexpress');
      console.log('✅ Connected to database');
    }

    server.listen(PORT, () => {
      console.log(`🚀 FoodExpress API running on port ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Client URL:  ${process.env.CLIENT_URL}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Rejection:', reason);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

startServer();
