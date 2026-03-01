# 💻 Local Testing Guide

## Quick Start - Test Before Deployment

Before deploying to Render, test the bot locally to ensure everything works.

---

## Prerequisites

- Node.js installed (v18 or higher)
- PostgreSQL database (Supabase/Neon free tier)
- Telegram bot token from BotFather
- Telegram channel created with bot as admin

---

## Step 1: Install Dependencies

```bash
cd C:\Users\aadar\sarkari-naukri-alert-bot
npm install
```

---

## Step 2: Create .env File

Create a `.env` file in the root directory:

```env
BOT_TOKEN=your_bot_token_here
CHANNEL_USERNAME=@YourChannelUsername
DATABASE_URL=postgresql://user:password@host:5432/database
ADMIN_TELEGRAM_ID=your_telegram_user_id
WEBHOOK_URL=https://your-ngrok-url.ngrok.io
PORT=3000
NODE_ENV=development
```

---

## Step 3: Setup Database

1. Go to your Supabase/Neon dashboard
2. Open SQL Editor
3. Run the contents of `src/database/schema.sql`
4. Verify tables are created

---

## Step 4: Setup Ngrok (for webhook testing)

### Install Ngrok

1. Download from https://ngrok.com/download
2. Extract and add to PATH
3. Sign up for free account
4. Get auth token from dashboard
5. Run: `ngrok authtoken YOUR_AUTH_TOKEN`

### Start Ngrok

```bash
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`) and update `WEBHOOK_URL` in `.env`

---

## Step 5: Start the Bot

```bash
npm start
```

You should see:
```
Server running on port 3000
Webhook set successfully
```

---

## Step 6: Test Features

### Test 1: Force Join
1. Open Telegram
2. Search for your bot
3. Send `/start`
4. **Expected**: Bot asks you to join channel
5. Join channel
6. Click "I Have Joined"
7. **Expected**: Main menu appears

### Test 2: Add Job (Admin)
1. Send `/addjob`
2. Follow prompts:
   - Title: `SSC CGL 2026`
   - Organization: `Staff Selection Commission`
   - Vacancies: `10000`
   - Qualification: `Graduation`
   - Age Limit: `18-30`
   - Start Date: `2026-03-01`
   - Last Date: `2026-03-31`
   - Category: `SSC`
   - State: `All India`
   - Official Link: `https://ssc.nic.in`
   - Description: `SSC Combined Graduate Level Exam 2026`
3. **Expected**: Job added successfully

### Test 3: Browse Jobs
1. Click "Latest Govt Jobs"
2. **Expected**: See the job you added
3. Test pagination if multiple jobs

### Test 4: Search by Exam
1. Click "Search by Exam"
2. Select "SSC"
3. **Expected**: See SSC jobs

### Test 5: Referral System
1. Click "Refer & Earn"
2. **Expected**: See referral link and count
3. Open link in another Telegram account
4. **Expected**: Referral tracked

### Test 6: Stats (Admin)
1. Send `/stats`
2. **Expected**: See user count, job count, referral count

### Test 7: Reminder System
1. Browse a job
2. Click "🔔 Remind Me"
3. **Expected**: Reminder set confirmation
4. Test trigger: `curl http://localhost:3000/trigger-reminders`
5. **Expected**: Reminder sent if within 3 days of deadline

---

## Common Issues

### "Webhook failed"
- Ensure ngrok is running
- Check WEBHOOK_URL in .env matches ngrok URL
- Restart bot after changing .env

### "Database connection failed"
- Verify DATABASE_URL is correct
- Check if database is accessible
- Ensure tables are created

### "Not authorized" for admin commands
- Verify ADMIN_TELEGRAM_ID matches your user ID
- Get your ID from @userinfobot

### Force join not working
- Ensure bot is admin in channel
- Check CHANNEL_USERNAME format: `@ChannelName`
- Verify channel is public

---

## Development Tips

### View Logs
All console.log and console.error output will show in terminal

### Database Queries
Use Supabase/Neon dashboard to view data directly

### Test Webhooks
Use ngrok's web interface: http://localhost:4040

### Hot Reload
For development, use nodemon:
```bash
npm install -g nodemon
nodemon src/server.js
```

---

## Ready for Production?

Once local testing is complete:
1. Stop the bot (Ctrl+C)
2. Stop ngrok
3. Follow DEPLOYMENT_GUIDE.md for production deployment

---

## Testing Checklist

- [ ] Dependencies installed
- [ ] .env file created
- [ ] Database tables created
- [ ] Ngrok running
- [ ] Bot started successfully
- [ ] Force join works
- [ ] Can add job via /addjob
- [ ] Jobs display correctly
- [ ] Search by exam works
- [ ] Referral system works
- [ ] /stats shows correct data
- [ ] Reminder can be set
- [ ] No errors in console

---

Happy testing! 🚀
