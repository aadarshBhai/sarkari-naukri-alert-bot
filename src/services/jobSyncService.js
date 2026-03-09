const { getSheetData } = require('./googleSheetsService');
const { createJob } = require('./jobService');
const { Job } = require('../database/models');
const { postJobToChannel } = require('../controllers/adminController'); // We might need to refactor this if it depends on ctx too much, but let's check it first.

/**
 * Sync jobs from Google Sheets to DB and Channel.
 * Sheet format: title | organization | job_type | vacancies | qualification | age_limit | last_date | category | state | official_link
 */
async function syncJobsFromSheets(bot) {
  console.log('🔄 Checking Google Sheets for new jobs...');
  const rows = await getSheetData('Sheet2!A2:J');
  if (!rows || rows.length === 0) return;

  let newJobsCount = 0;

  for (const row of rows) {
    const [title, organization, job_type, vacancies, qualification, age_limit, last_date, category, state, official_link] = row;

    if (!title || !official_link) continue;

    try {
      const exists = await Job.findOne({ official_link });
      if (!exists) {
        console.log(`✨ New job found in sheet: ${title}`);
        const jobData = {
          title,
          organization,
          job_type: job_type || 'job',
          vacancies,
          qualification,
          age_limit,
          last_date: last_date ? new Date(last_date) : null,
          category: category || 'Other',
          state: state || 'All India',
          official_link,
          description: `Sheet update: ${title}`
        };

        const newJob = await createJob(jobData);
        
        // Post to channel (we need a mock ctx or just the bot instance)
        try {
          // Refactored posting logic that doesn't strictly need ctx if we use bot.telegram directly
          await postToChannelDirectly(bot, newJob);
          newJobsCount++;
        } catch (postError) {
          console.error(`⚠️ Failed to post job ${title} to channel:`, postError.message);
        }
      }
    } catch (error) {
      console.error(`❌ Error syncing job ${title}:`, error.message);
    }
  }

  if (newJobsCount > 0) {
    console.log(`✅ Job sync complete. Added ${newJobsCount} new jobs.`);
  }
}

/**
 * Helper to post to channel using bot instance instead of ctx
 */
async function postToChannelDirectly(bot, job) {
  const channelUsername = process.env.CHANNEL_USERNAME || '@SarkariNaukriAlertOfficial';
  const botUsername = (await bot.telegram.getMe()).username;

  const channelMessage = `🚨 <b>New Government Job Alert</b>\n\n` +
    `🏢 <b>Organization:</b> ${job.organization.toUpperCase()}\n` +
    `📄 <b>Post:</b> ${job.title}\n` +
    `👥 <b>Vacancies:</b> ${job.vacancies || 'Notification Dekhein'}\n` +
    `🎓 <b>Qualification:</b> ${job.qualification || 'As per norms'}\n` +
    `📅 <b>Last Date:</b> ${job.last_date ? new Date(job.last_date).toLocaleDateString('en-IN') : 'Jald hi'}\n\n` +
    `🔗 <b>Apply Here:</b>\n${job.official_link}\n\n` +
    `📢 <b>Join our bot for alerts:</b>\nt.me/${botUsername}`;

  await bot.telegram.sendMessage(channelUsername, channelMessage, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🚀 Get Alerts in Bot', url: `https://t.me/${botUsername}` }]
      ]
    }
  });
}

module.exports = {
  syncJobsFromSheets
};
