const mongoose = require('mongoose');
require('dotenv').config();

let isConnected = false;

const connectDB = async () => {
  try {
    if (isConnected) {
      console.log('✅ MongoDB already connected');
      return;
    }

    // Force load from .env to override any system variables
    require('dotenv').config({ override: true });

    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI or DATABASE_URL is missing in .env file!');
      throw new Error('Database URI not found in environment variables');
    }

    // Debug log to see what URI is being used (safely)
    let maskedUri = "unknown";
    if (mongoUri.includes('@')) {
      maskedUri = mongoUri.split('@')[1];
    } else {
      maskedUri = mongoUri; // Likely localhost or a local string
    }
    
    console.log(`📡 Connecting to: ${maskedUri}`);

    await mongoose.connect(mongoUri);

    isConnected = true;
    console.log('✅ MongoDB connected successfully to "Telegram" database');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const getDB = () => {
  if (!isConnected) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return mongoose.connection;
};

const closeDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('✅ MongoDB connection closed');
  }
};

module.exports = { connectDB, getDB, closeDB };
