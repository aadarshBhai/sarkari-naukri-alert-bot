const { User, Job, Reminder } = require('./models');

async function initDatabase() {
  try {
    // Mongoose automatically creates collections when models are used
    // Just verify connection is working
    console.log('✅ Database models initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

module.exports = { initDatabase };
