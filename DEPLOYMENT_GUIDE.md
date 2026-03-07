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

### Step 3: Create Free MongoDB Database (10 minutes)

#### Option A: MongoDB Atlas (Recommended)

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Start Free" and sign up
3. Create a new Project named `sarkari-naukri-bot`
4. Click "Build a Cluster" -> "Free" (Shared)
5. Choose a provider (e.g., AWS) and region
6. Create a **Database User** (Username and Password) - **Save these!**
7. In "Network Access", add `0.0.0.0/0` (Allow access from anywhere)
8. Go to "Database" -> "Connect" -> "Drivers"
9. Copy the **Connection String** (URI)
10. Replace `<password>` with your actual password
11. **Save this MONGODB_URI** (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/Telegram?retryWrites=true&w=majority`)

### Step 4: Database is Automatic! (1 minute)

Unlike PostgreSQL, MongoDB Atlas automatically creates the database and collections when the bot starts. No need to run any SQL!

Just ensure your `MONGODB_URI` is correctly set in Render.

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
- Verify MONGODB_URI is correct
- Ensure your IP address is whitelisted in Atlas (0.0.0.0/0 recommended for Render)
- Check if clusters are active

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
- **MongoDB Atlas**: 512MB to 5GB storage on free tier
- **Cloud Cron**: Free tier for trigger-reminders

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
- [ ] Created MongoDB Atlas database
- [ ] Whitelisted 0.0.0.0/0 in MongoDB Atlas Settings
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
