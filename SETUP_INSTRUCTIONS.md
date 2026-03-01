# 🚀 Quick Setup Instructions - Sarkari Naukri Alert Bot

## ✅ What's Ready

All code is complete and configured for MongoDB! The bot is ready to deploy.

---

## 💾 Step 1: Configure Environment Variables

Create a `.env` file in the project root with the following:

```env
BOT_TOKEN=your_bot_token_from_botfather
CHANNEL_USERNAME=@SarkariNaukriAlertOfficial
MONGODB_URI=mongodb+srv://aadarshgolucky:YOUR_PASSWORD@cluster0.oss7hwd.mongodb.net/sarkari_naukri_bot?retryWrites=true&w=majority
ADMIN_TELEGRAM_ID=your_telegram_user_id
WEBHOOK_URL=https://your-app.onrender.com
PORT=10000
NODE_ENV=production
```

### Important:
- Replace `YOUR_PASSWORD` with your MongoDB password for user `aadarshgolucky`
- Replace `your_bot_token_from_botfather` with your actual Telegram bot token
- Replace `your_telegram_user_id` with your Telegram user ID (get from @userinfobot)
- Replace `https://your-app.onrender.com` with your actual deployment URL

---

## 🤖 Step 2: Create Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Name: `Sarkari Naukri Alert 2026 Bot`
4. Username: `SarkariNaukriAlertBot` (or similar if taken)
5. **Copy the BOT_TOKEN** and save it

---

## 📢 Step 3: Create Telegram Channel

1. Create a new public channel in Telegram
2. Name: `Sarkari Naukri Alert Official`
3. Username: `SarkariNaukriAlertOfficial` (or similar)
4. Go to channel settings → Administrators
5. **Add your bot as administrator** with permissions:
   - Post messages
   - Delete messages
   - Invite users via link

---

## 📊 Step 4: Get Your Telegram User ID

1. Open Telegram
2. Search for **@userinfobot**
3. Send `/start`
4. Copy your **ID** number
5. This is your `ADMIN_TELEGRAM_ID`

---

## 📦 Step 5: Install Dependencies

```bash
cd C:\Users\aadar\sarkari-naukri-alert-bot
npm install
```

This will install:
- telegraf (Telegram bot framework)
- express (Web server)
- mongodb (Database driver)
- dotenv (Environment variables)

---

## 🚀 Step 6: Deploy to Render (Free Tier)

### 6.1 Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Sarkari Naukri Bot"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sarkari-naukri-alert-bot.git
git push -u origin main
```

### 6.2 Deploy on Render

1. Go to https://render.com
2. Sign up with GitHub
3. Click **New** → **Web Service**
4. Connect your repository
5. Configure:
   - **Name**: `sarkari-naukri-bot`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
6. Add Environment Variables (from your .env file):
   ```
   BOT_TOKEN=...
   CHANNEL_USERNAME=@SarkariNaukriAlertOfficial
   MONGODB_URI=mongodb+srv://aadarshgolucky:YOUR_PASSWORD@cluster0.oss7hwd.mongodb.net/sarkari_naukri_bot?retryWrites=true&w=majority
   ADMIN_TELEGRAM_ID=...
   WEBHOOK_URL=https://sarkari-naukri-bot.onrender.com
   PORT=10000
   NODE_ENV=production
   ```
7. Click **Create Web Service**
8. Wait 5-10 minutes for deployment

---

## ⏰ Step 7: Setup Reminder Cron Job

1. Go to https://cron-job.org (free)
2. Sign up
3. Create new cron job:
   - **Title**: `Sarkari Naukri Reminders`
   - **URL**: `https://your-render-url.onrender.com/trigger-reminders`
   - **Schedule**: Every day at 9:00 AM IST
   - **Method**: GET
4. Save and enable

---

## ✅ Step 8: Test Your Bot

1. Open Telegram
2. Search for your bot
3. Send `/start`
4. **Expected**: Bot asks you to join channel
5. Join the channel
6. Click "I Have Joined"
7. **Expected**: Main menu appears
8. Test admin command: `/addjob`
9. Add a test job
10. Test browsing: Click "Latest Govt Jobs"

---

## 📝 MongoDB Database Info

**Your MongoDB is already set up!**

- **Cluster**: cluster0.oss7hwd.mongodb.net
- **Username**: aadarshgolucky
- **Database**: sarkari_naukri_bot

The bot will automatically create collections (users, jobs, reminders) when it first runs.

---

## 🔧 Troubleshooting

### Bot not responding?
- Check Render logs for errors
- Verify BOT_TOKEN is correct
- Ensure webhook is set (check logs)

### Force join not working?
- Verify bot is admin in channel
- Check CHANNEL_USERNAME format: `@ChannelUsername`

### Database errors?
- Verify MONGODB_URI password is correct
- Check MongoDB Atlas dashboard for connection issues

### Admin commands not working?
- Verify ADMIN_TELEGRAM_ID matches your user ID

---

## 🎉 You're All Set!

Once deployed:
1. Add real job listings via `/addjob`
2. Promote your channel
3. Monitor growth via `/stats`
4. Scale when needed (5k+ users)

Good luck with your bot! 🚀
