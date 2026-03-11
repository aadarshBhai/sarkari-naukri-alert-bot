const { Telegraf } = require('telegraf');
require('dotenv').config();

const { checkMembership } = require('./middlewares/forceJoin');
const { rateLimit } = require('./middlewares/rateLimit');
const { isAdmin } = require('./middlewares/adminAuth');

const { handleStart, handleVerifyJoin, getMainMenu } = require('./controllers/startController');
const { handleLatestJobs, handleSearchByExam, handleCategoryJobs, handleStateJobs, handleStateJobsList, handleEligibilityChecker, handleAdmitCards, handleResults, handleEligibilityResults } = require('./controllers/jobController');
const { handleReferEarn } = require('./controllers/referralController');
const { handleRemindMe } = require('./controllers/reminderController');
const { handlePreviousPapers, handlePapersByExam, handlePapersByYear } = require('./controllers/paperController');
const { handleAddJob, handleAddPaper, handleAdminMessage, handleStats, adminSessions, handleScanPapers, handleBroadcastJobs, handleCleanPapers, handleSyncSheets } = require('./controllers/adminController');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Apply rate limiting to all updates
bot.use(rateLimit);

// Start command - with force join check
bot.start(checkMembership, handleStart);

// Verify join callback
bot.action('verify_join', handleVerifyJoin);

// Main menu callback
bot.action('main_menu', async (ctx) => {
  await ctx.editMessageText(
    '🏠 Main Menu\n\n👇 Apna option chunein:',
    getMainMenu()
  );
});

// Latest jobs
bot.action('latest_jobs', checkMembership, async (ctx) => {
  await ctx.answerCbQuery();
  await handleLatestJobs(ctx, 0);
});

bot.action(/^latest_page_(\d+)$/, checkMembership, async (ctx) => {
  const page = parseInt(ctx.match[1]);
  await ctx.answerCbQuery();
  await handleLatestJobs(ctx, page);
});

// Search by exam
bot.action('search_exam', checkMembership, async (ctx) => {
  await ctx.answerCbQuery();
  await handleSearchByExam(ctx);
});

bot.action(/^category_([a-z0-9_]+)$/, checkMembership, async (ctx) => {
  const category = ctx.match[1];
  await ctx.answerCbQuery();
  await handleCategoryJobs(ctx, category, 0);
});

bot.action(/^category_([a-z0-9_]+)_page_(\d+)$/, checkMembership, async (ctx) => {
  const category = ctx.match[1];
  const page = parseInt(ctx.match[2]);
  await ctx.answerCbQuery();
  await handleCategoryJobs(ctx, category, page);
});

// State wise jobs
bot.action('state_jobs', checkMembership, async (ctx) => {
  await ctx.answerCbQuery();
  await handleStateJobs(ctx);
});

bot.action(/^state_([a-z_]+)$/, checkMembership, async (ctx) => {
  const state = ctx.match[1].replace(/_/g, ' ');
  await ctx.answerCbQuery();
  await handleStateJobsList(ctx, state, 0);
});

bot.action(/^state_([a-z_]+)_page_(\d+)$/, checkMembership, async (ctx) => {
  const state = ctx.match[1].replace(/_/g, ' ');
  const page = parseInt(ctx.match[2]);
  await ctx.answerCbQuery();
  await handleStateJobsList(ctx, state, page);
});

// Eligibility checker
bot.action('eligibility_checker', checkMembership, async (ctx) => {
  await ctx.answerCbQuery();
  await handleEligibilityChecker(ctx);
});

bot.action(/^eligibility_(.+)$/, checkMembership, async (ctx) => {
  const qualification = ctx.match[1].replace(/_/g, ' ');
  await ctx.answerCbQuery();
  await handleEligibilityResults(ctx, qualification);
});

// Admit cards
bot.action('admit_cards', checkMembership, async (ctx) => {
  await ctx.answerCbQuery();
  await handleAdmitCards(ctx, 0);
});

bot.action(/^admit_card_page_(\d+)$/, checkMembership, async (ctx) => {
  const page = parseInt(ctx.match[1]);
  await ctx.answerCbQuery();
  await handleAdmitCards(ctx, page);
});

// Results
bot.action('results', checkMembership, async (ctx) => {
  await ctx.answerCbQuery();
  await handleResults(ctx, 0);
});

bot.action(/^result_page_(\d+)$/, checkMembership, async (ctx) => {
  const page = parseInt(ctx.match[1]);
  await ctx.answerCbQuery();
  await handleResults(ctx, page);
});

// Refer & Earn
bot.action('refer_earn', checkMembership, async (ctx) => {
  await ctx.answerCbQuery();
  await handleReferEarn(ctx);
});

// Previous year papers
bot.action('previous_papers', checkMembership, async (ctx) => {
  await ctx.answerCbQuery();
  await handlePreviousPapers(ctx);
});

bot.action(/^papers_([a-z0-9_]+)$/, checkMembership, async (ctx) => {
  const match = ctx.match[1];
  const parts = match.split('_');
  
  if (parts.length >= 2) {
    // It's papers_exam_year (e.g., papers_ssc_2024)
    const exam = parts[0].toUpperCase();
    const year = parts[1];
    await ctx.answerCbQuery();
    await handlePapersByYear(ctx, exam, year);
  } else {
    // It's just papers_exam (e.g., papers_ssc)
    const exam = match.toUpperCase();
    await ctx.answerCbQuery();
    await handlePapersByExam(ctx, exam);
  }
});

// Remind me
bot.action(/remind_(.+)/, checkMembership, async (ctx) => {
  const jobId = ctx.match[1];
  await handleRemindMe(ctx, jobId);
});

// Admin commands
bot.command('addjob', isAdmin, handleAddJob);
bot.command('addpaper', isAdmin, handleAddPaper);
bot.command('stats', isAdmin, handleStats);
bot.command('scanpapers', isAdmin, handleScanPapers);
bot.command('broadcastjobs', isAdmin, handleBroadcastJobs);
bot.command('cleanpapers', isAdmin, handleCleanPapers);
bot.command('syncsheets', isAdmin, handleSyncSheets);

// Handle admin messages for job creation
bot.on('text', async (ctx, next) => {
  const userId = ctx.from.id;
  if (adminSessions.has(userId)) {
    await handleAdminMessage(ctx);
  } else {
    return next();
  }
});

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('⚠️ Kuch galat ho gaya. Kripya /start karein.');
});

module.exports = bot;
