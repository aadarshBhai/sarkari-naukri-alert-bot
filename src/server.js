require('dotenv').config({ override: true });
const express = require('express');
const bot = require('./bot');
const { connectDB } = require('./database/db');
const { getPendingReminders, markReminderSent } = require('./services/reminderService');
const { scrapeSarkariResult, scrapeNewPapers } = require('./services/scraperService');
const { getAllUsers } = require('./services/userService');
const { formatJob } = require('./controllers/jobController');
const axios = require('axios');

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

    // Run scraper on start
    const newItems = await scrapeSarkariResult();
    const newPapersCount = await scrapeNewPapers();
    if (newItems.length > 0) {
      console.log(`📣 Found ${newItems.length} new items on startup!`);
    }
    if (newPapersCount > 0) {
      console.log(`📣 Found ${newPapersCount} new papers on startup!`);
    }

    // Set webhook (Production) or Polling (Local)
    if (process.env.NODE_ENV === 'production' && WEBHOOK_URL) {
      await bot.telegram.setWebhook(`${WEBHOOK_URL}/webhook`);
      console.log(`✅ Webhook set to: ${WEBHOOK_URL}/webhook`);
      
      // Render Keep-Alive Pinger
      setInterval(() => {
        axios.get(WEBHOOK_URL).catch(() => {});
        console.log('📡 Sent keep-alive ping');
      }, 10 * 60 * 1000); // Every 10 minutes
    } else {
      console.log('🤖 Starting in Polling mode (Local)...');
      await bot.telegram.deleteWebhook();
      bot.launch(); // Start polling
    }

    // Real-time Scraper Interval
    setInterval(async () => {
      console.log('🔄 Running periodic scrape...');
      const newItems = await scrapeSarkariResult();
      const newPapersCount = await scrapeNewPapers();
      if (newItems.length > 0) {
        console.log(`📣 Found ${newItems.length} new items. Notifying users...`);
        const users = await getAllUsers();
        for (const item of newItems) {
          const message = `🌟 **Nayi Update Ayi Hai!**\n\n${formatJob(item)}`;
          for (const user of users) {
            try {
              await bot.telegram.sendMessage(user.telegram_id, message, { parse_mode: 'Markdown' });
            } catch (err) {
              // Ignore blocked bots or deactivated users
              if (!err.message.includes('forbidden') && !err.message.includes('blocked')) {
                console.error(`Failed to notify user ${user.telegram_id}:`, err.message);
              }
            }
          }
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

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
