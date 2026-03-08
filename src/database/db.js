const mongoose = require('mongoose');
require('dotenv').config();

let isConnected = false;

const connectDB = async () => {
  try {
    if (isConnected) {
      console.log('✅ MongoDB already connected');
      return;
    }

    // Load from .env explicitly to ensure variables are present
    require('dotenv').config();

    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI or DATABASE_URL is missing in .env file!');
      throw new Error('Database URI not found in environment variables');
    }

    // Log which variable we're using (masked)
    const maskedUri = mongoUri.replace(/:([^@]+)@/, ':****@').split('@')[1] || 'localhost';
    console.log(`📡 Attempting to connect to MongoDB: ${maskedUri}`);

    await mongoose.connect(mongoUri);

    isConnected = true;
    console.log('✅ MongoDB connected successfully');
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
