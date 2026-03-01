# 🏛️ Sarkari Naukri Alert Bot 2026

A complete Telegram bot for Government Job Alerts built with Node.js, Telegraf, PostgreSQL, and Express.

## ✨ Features

- 🔒 **Force Join System** - Mandatory channel subscription
- 📌 **Latest Government Jobs** - Browse newest job postings
- 🔍 **Search by Exam Category** - SSC, UPSC, Railway, Banking, etc.
- 📍 **State-wise Jobs** - Filter jobs by state
- 🔔 **Reminder System** - Get notified before deadlines
- 🎁 **Referral System** - Track user referrals
- 🔑 **Admin Panel** - Add jobs, view stats, broadcast messages

## 🛠️ Tech Stack

- **Node.js** (LTS)
- **Telegraf** - Telegram Bot Framework
- **Express** - Web server for webhooks
- **PostgreSQL** - Database (Supabase/Neon free tier)
- **dotenv** - Environment configuration

## 🚀 Quick Start

### 1. Create Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` command
3. Follow instructions to create your bot
4. Save the **Bot Token**
5. Set bot username to `@SarkariNaukriAlertBot` (or your choice)

### 2. Create Channel

1. Create a new Telegram channel
2. Set username to `@SarkariNaukriAlertOfficial` (or your choice)
3. Add your bot as **Administrator** to the channel
4. Give bot permission to post messages

### 3. Setup Database (Supabase Free Tier)

1. Go to [supabase.com](https://supabase.com)
2. Create a free account
3. Create a new project
4. Go to **Settings** > **Database**
5. Copy the **Connection String** (URI format)
6. Run the schema from `src/database/schema.sql` in SQL Editor

**Alternative: Neon Database**
1. Go to [neon.tech](https://neon.tech)
2. Create free account and project
3. Copy connection string

### 4. Configure Environment

Create `.env` file in root directory:

```env
BOT_TOKEN=your_bot_token_from_botfather
CHANNEL_USERNAME=@SarkariNaukriAlertOfficial
DATABASE_URL=your_postgresql_connection_string
ADMIN_TELEGRAM_ID=your_telegram_user_id
WEBHOOK_URL=https://your-app.onrender.com
PORT=3000
```

**Get your Telegram ID:**
- Message [@userinfobot](https://t.me/userinfobot) on Telegram
- It will reply with your user ID

### 5. Install Dependencies

```bash
npm install
```

### 6. Deploy to Render (Free Tier)

1. Go to [render.com](https://render.com)
2. Create free account
3. Click **New** > **Web Service**
4. Connect your GitHub repository (push this code to GitHub first)
5. Configure:
   - **Name**: sarkari-naukri-bot
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add Environment Variables (from your .env file)
7. Click **Create Web Service**
8. Copy the deployment URL (e.g., `https://sarkari-naukri-bot.onrender.com`)
9. Update `WEBHOOK_URL` in environment variables with this URL

**Alternative: Railway Free Tier**
1. Go to [railway.app](https://railway.app)
2. Create account and new project
3. Deploy from GitHub
4. Add environment variables

### 7. Setup Reminder Cron Job

Use [cron-job.org](https://cron-job.org) (free):

1. Create free account
2. Create new cron job
3. Set URL: `https://your-app.onrender.com/trigger-reminders`
4. Set schedule: Daily at 9:00 AM
5. Save and enable

## 📝 Admin Commands

Only the admin (specified in `ADMIN_TELEGRAM_ID`) can use these:

- `/addjob` - Add a new job (interactive)
- `/stats` - View bot statistics

## 🧪 Testing

### Test Force Join

1. Start bot with `/start`
2. If not joined channel, you'll see join prompt
3. Join channel and click "I Have Joined"
4. Bot should now work

### Test Add Job

1. Send `/addjob` to bot
2. Follow prompts to enter job details
3. Job will be added to database

### Test Reminder

1. Browse jobs
2. Click "Remind Me" button
3. Reminder will be set for 3 days before deadline
4. Test trigger: Visit `https://your-app.onrender.com/trigger-reminders`

## 📁 Project Structure

```
sarkari-naukri-alert-bot/
├── src/
│   ├── controllers/      # Bot command handlers
│   ├── services/         # Business logic
│   ├── middlewares/      # Force join, rate limit, auth
│   ├── database/         # DB connection and schema
│   ├── bot.js            # Bot configuration
│   └── server.js         # Express server
├── .env.example
├── .gitignore
├── Dockerfile
├── package.json
└── README.md
```

## ⚠️ Important Notes

### Force Join Setup

**Critical:** Bot must be added as **Administrator** in the channel with these permissions:
- Post messages
- Delete messages (optional)

Without admin access, force join will not work!

### Free Tier Limitations

- **Render Free**: Spins down after 15 min inactivity, 750 hours/month
- **Railway Free**: $5 credit/month
- **Supabase Free**: 500MB database, 2GB bandwidth
- **Neon Free**: 3GB storage, 1 project

**Recommendation:** Good for 0-5k users. Beyond that, upgrade to paid plans.

### Webhook vs Polling

This bot uses **webhook mode** (required for free hosting). Polling mode would keep connection open and consume resources.

## 🔧 Troubleshooting

### Bot not responding
- Check if webhook is set: Visit `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo`
- Verify environment variables are set correctly
- Check Render/Railway logs for errors

### Force join not working
- Ensure bot is admin in channel
- Check channel username is correct (with @)
- Verify bot has permission to get chat member info

### Database connection failed
- Verify DATABASE_URL is correct
- Check if database is accessible from Render/Railway
- Ensure SSL is configured properly

### Reminders not sending
- Check if cron job is running
- Visit `/trigger-reminders` endpoint manually
- Check database for pending reminders

## 📚 Database Schema

See `src/database/schema.sql` for complete schema.

**Tables:**
- `users` - User information and referrals
- `jobs` - Job postings
- `reminders` - User job reminders

## 🔐 Security

- Rate limiting enabled (30 requests/minute per user)
- Admin commands protected by Telegram ID
- Environment variables for sensitive data
- SQL injection prevention with parameterized queries

## 📦 Deployment Checklist

- [ ] Bot created via BotFather
- [ ] Channel created and bot added as admin
- [ ] Database created (Supabase/Neon)
- [ ] Schema executed in database
- [ ] .env file configured
- [ ] Code pushed to GitHub
- [ ] Deployed to Render/Railway
- [ ] Environment variables set in hosting
- [ ] Webhook URL updated
- [ ] Cron job configured for reminders
- [ ] Force join tested
- [ ] First job added via /addjob

## 👥 Support

For issues or questions:
1. Check troubleshooting section
2. Review Render/Railway logs
3. Verify all environment variables

## 📝 License

ISC

## 🚀 Scaling Guide

When you reach 5-10k users:

1. **Upgrade Hosting**
   - Render: Paid plan ($7/month)
   - Railway: Add credits
   - Or migrate to VPS (DigitalOcean, AWS)

2. **Upgrade Database**
   - Supabase Pro ($25/month)
   - Or dedicated PostgreSQL server

3. **Add Redis**
   - For caching and session management
   - Reduces database load

4. **Implement Queue System**
   - Bull/BullMQ for job processing
   - Better broadcast handling

---

**Built with ❤️ for helping job seekers find government opportunities!**
