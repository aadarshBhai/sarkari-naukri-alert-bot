require('dotenv').config();
const express = require('express');
const bot = require('./bot');
const { connectDB } = require('./database/db');
const { getPendingReminders, markReminderSent } = require('./services/reminderService');

const app = express();
const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Bot is running!', timestamp: new Date().toISOString() });
});

// Webhook endpoint
app.post('/webhook', (req, res) => {
  bot.handleUpdate(req.body, res);
});

// Trigger reminders endpoint
app.get('/trigger-reminders', async (req, res) => {
  try {
    const reminders = await getPendingReminders();
    
    if (reminders.length === 0) {
      return res.json({ message: 'No pending reminders', count: 0 });
    }

    let sentCount = 0;
    for (const reminder of reminders) {
      try {
        const job = reminder.job_id;
        const user = reminder.user_id;

        if (!job || !user) {
          console.error(`Missing job or user for reminder ${reminder._id}`);
          continue;
        }

        const message = `🔔 **Reminder!**\n\n` +
          `📌 ${job.title}\n` +
          `🏛️ ${job.organization}\n` +
          `📅 Last Date: ${new Date(job.last_date).toLocaleDateString('en-IN')}\n` +
          `🔗 ${job.official_link}\n\n` +
          `⚠️ Jaldi apply karein!`;

        await bot.telegram.sendMessage(user.telegram_id, message, { parse_mode: 'Markdown' });
        await markReminderSent(reminder._id);
        sentCount++;
      } catch (error) {
        console.error(`Error sending reminder ${reminder._id}:`, error);
      }
    }

    res.json({ message: 'Reminders sent', count: sentCount, total: reminders.length });
  } catch (error) {
    console.error('Error triggering reminders:', error);
    res.status(500).json({ error: 'Failed to send reminders' });
  }
});

// Initialize and start server
async function start() {
  try {
    // Initialize database
    await connectDB();
    console.log('✅ Database initialized');

    // Set webhook
    if (WEBHOOK_URL) {
      await bot.telegram.setWebhook(`${WEBHOOK_URL}/webhook`);
      console.log(`✅ Webhook set to: ${WEBHOOK_URL}/webhook`);
    } else {
      console.log('⚠️ No WEBHOOK_URL provided. Bot will not receive updates.');
    }

    // Start Express server
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🤖 Bot is ready!`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

start();

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
