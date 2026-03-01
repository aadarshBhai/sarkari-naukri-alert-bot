const { MongoClient } = require('mongodb');
require('dotenv').config();

let db = null;
let client = null;

const connectDB = async () => {
  try {
    if (db) return db;

    client = new MongoClient(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();
    console.log('MongoDB connected successfully');
    
    db = client.db('sarkari_naukri_bot');
    
    // Create indexes for better performance
    await db.collection('users').createIndex({ telegram_id: 1 }, { unique: true });
    await db.collection('users').createIndex({ referral_code: 1 }, { unique: true });
    await db.collection('jobs').createIndex({ created_at: -1 });
    await db.collection('jobs').createIndex({ category: 1 });
    await db.collection('jobs').createIndex({ state: 1 });
    await db.collection('reminders').createIndex({ user_id: 1 });
    await db.collection('reminders').createIndex({ reminder_date: 1 });
    
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

const closeDB = async () => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
};

module.exports = { connectDB, getDB, closeDB };
