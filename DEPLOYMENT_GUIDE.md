# 🚀 Complete Deployment Guide - Sarkari Naukri Alert Bot

## ✅ What's Already Done

The complete bot codebase is ready with:
- ✅ All source code files
- ✅ Database schemas
- ✅ Force join system
- ✅ Admin panel
- ✅ Referral system
- ✅ Reminder system
- ✅ Dockerfile
- ✅ README.md

---

## 📋 Step-by-Step Deployment Instructions

### Step 1: Create Telegram Bot (5 minutes)

1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Enter bot name: `Sarkari Naukri Alert 2026 Bot`
4. Enter username: `SarkariNaukriAlertBot` (or similar if taken)
5. **Save the BOT_TOKEN** - you'll need this!
6. Send `/setdescription` to BotFather and set:
   ```
   सरकारी नौकरी की ताज़ा जानकारी पाएं। SSC, UPSC, Railway, Banking और अन्य सभी सरकारी नौकरियों की अपडेट।
   ```
7. Send `/setabouttext` and set:
   ```
   Latest Government Job Alerts for SSC, UPSC, Railway, Banking, Police, and more.
   ```

### Step 2: Create Telegram Channel (3 minutes)

1. In Telegram, create a new channel
2. Name it: `Sarkari Naukri Alert Official`
3. Username: `SarkariNaukriAlertOfficial` (or similar)
4. Make it **Public**
5. Go to channel settings → Administrators
6. **Add your bot as administrator** with these permissions:
   - ✅ Post messages
   - ✅ Delete messages
   - ✅ Invite users via link
7. **Save the channel username** (e.g., @SarkariNaukriAlertOfficial)

### Step 3: Create Free PostgreSQL Database (10 minutes)

#### Option A: Supabase (Recommended)

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub/Google
4. Create new project:
   - Name: `sarkari-naukri-bot`
   - Database Password: (create a strong password)
   - Region: Choose closest to you
5. Wait 2-3 minutes for setup
6. Go to **Settings** → **Database**
7. Scroll to **Connection String** → **URI**
8. Copy the connection string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@...`)
9. Replace `[YOUR-PASSWORD]` with your actual password
10. **Save this DATABASE_URL**

#### Option B: Neon (Alternative)

1. Go to https://neon.tech
2. Sign up with GitHub/Google
3. Create new project: `sarkari-naukri-bot`
4. Copy the connection string
5. **Save this DATABASE_URL**

### Step 4: Initialize Database (5 minutes)

1. Open your database dashboard (Supabase/Neon)
2. Go to **SQL Editor** or **Query**
3. Copy the contents of `src/database/schema.sql` from your project
4. Paste and **Run** the SQL
5. Verify tables created: `users`, `jobs`, `reminders`

### Step 5: Deploy to Render (15 minutes)

#### 5.1 Prepare GitHub Repository

1. Go to https://github.com
2. Create new repository: `sarkari-naukri-alert-bot`
3. Make it **Private** (recommended)
4. Open terminal in your project folder:
   ```bash
   cd C:\Users\aadar\sarkari-naukri-alert-bot
   git init
   git add .
   git commit -m "Initial commit - Sarkari Naukri Bot"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/sarkari-naukri-alert-bot.git
   git push -u origin main
   ```

#### 5.2 Deploy on Render

1. Go to https://render.com
2. Sign up with GitHub
3. Click **New** → **Web Service**
4. Connect your GitHub repository
5. Configure:
   - **Name**: `sarkari-naukri-bot`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
6. Click **Advanced** → **Add Environment Variables**:
   ```
   BOT_TOKEN=your_bot_token_from_botfather
   CHANNEL_USERNAME=@SarkariNaukriAlertOfficial
   DATABASE_URL=your_database_connection_string
   ADMIN_TELEGRAM_ID=your_telegram_user_id
   WEBHOOK_URL=https://sarkari-naukri-bot.onrender.com
   PORT=10000
   NODE_ENV=production
   ```
7. Click **Create Web Service**
8. Wait 5-10 minutes for deployment
9. Once deployed, copy your service URL (e.g., `https://sarkari-naukri-bot.onrender.com`)
10. Update `WEBHOOK_URL` environment variable with this URL

### Step 6: Get Your Telegram User ID (2 minutes)

1. Open Telegram
2. Search for **@userinfobot**
3. Send `/start`
4. Copy your **ID** number
5. Update `ADMIN_TELEGRAM_ID` in Render environment variables

### Step 7: Setup Reminder Cron Job (5 minutes)

1. Go to https://cron-job.org
2. Sign up (free)
3. Create new cron job:
   - **Title**: `Sarkari Naukri Reminders`
   - **URL**: `https://your-render-url.onrender.com/trigger-reminders`
   - **Schedule**: Every day at 9:00 AM IST
   - **Execution**: `GET` request
4. Save and enable

### Step 8: Test Your Bot (10 minutes)

1. Open Telegram
2. Search for your bot: `@SarkariNaukriAlertBot`
3. Send `/start`
4. **Expected behavior**:
   - Bot asks you to join channel
   - After joining, shows main menu
5. Test admin commands:
   - Send `/addjob`
   - Follow prompts to add a test job
6. Send `/stats` to verify
7. Test referral:
   - Click "Refer & Earn"
   - Share link with another account
8. Test job browsing:
   - Click "Latest Govt Jobs"
   - Navigate through pages

---

## 🔧 Troubleshooting

### Bot not responding?
- Check Render logs for errors
- Verify BOT_TOKEN is correct
- Ensure webhook is set (check logs for "Webhook set successfully")

### Force join not working?
- Verify bot is admin in channel
- Check CHANNEL_USERNAME format: `@ChannelUsername`
- Ensure channel is public

### Database errors?
- Verify DATABASE_URL is correct
- Check if tables are created
- Run schema.sql again if needed

### Admin commands not working?
- Verify ADMIN_TELEGRAM_ID matches your user ID
- Check logs for authentication errors

---

## 📊 Monitoring & Maintenance

### Daily Tasks
- Check Render logs for errors
- Monitor user growth via `/stats`
- Add new jobs via `/addjob`

### Weekly Tasks
- Review reminder delivery
- Check database size (free tier limits)
- Update job listings

### Monthly Tasks
- Backup database
- Review and optimize queries
- Plan for scaling if needed

---

## 🚀 Scaling Considerations

Free tier limits:
- **Render**: 750 hours/month, sleeps after 15 min inactivity
- **Supabase**: 500MB database, 2GB bandwidth
- **Neon**: 3GB storage, 100 hours compute

When to upgrade:
- 5,000+ active users
- Database > 400MB
- Frequent timeout errors

---

## 📞 Support

If you encounter issues:
1. Check Render logs first
2. Verify all environment variables
3. Test database connection
4. Review README.md for additional help

---

## ✅ Deployment Checklist

- [ ] Created Telegram bot via BotFather
- [ ] Created Telegram channel
- [ ] Added bot as channel admin
- [ ] Created Supabase/Neon database
- [ ] Ran schema.sql to create tables
- [ ] Created GitHub repository
- [ ] Pushed code to GitHub
- [ ] Deployed to Render
- [ ] Set all environment variables
- [ ] Got Telegram user ID
- [ ] Setup cron job for reminders
- [ ] Tested /start command
- [ ] Tested force join
- [ ] Tested /addjob
- [ ] Tested job browsing
- [ ] Tested referral system

---

## 🎉 You're Done!

Your bot is now live and ready to serve users!

Next steps:
- Add real job listings
- Promote your channel
- Monitor user feedback
- Scale when needed

Good luck! 🚀
