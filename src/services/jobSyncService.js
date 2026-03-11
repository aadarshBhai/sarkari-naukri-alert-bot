const { getSheetData } = require('./googleSheetsService');
const { createJob } = require('./jobService');
const { Job } = require('../database/models');
const { postJobToChannel } = require('../controllers/adminController'); // We might need to refactor this if it depends on ctx too much, but let's check it first.

/**
 * Sync jobs from Google Sheets to DB and Channel.
 * Sheet format (Sheet1): Title | Organization | Job Type | Vacancies | Qualification | Age Limit | Last Date | Category | State | Year | Exam Type | Official Link
 */
async function syncJobsFromSheets(bot) {
  console.log('🔄 Checking Google Sheets for new jobs...');
  // Fetching up to 13 columns to include 'Question PDF' as the link
  const rows = await getSheetData('Sheet1!A2:M'); 
  if (!rows || rows.length === 0) return;

  let newJobsCount = 0;

  for (const row of rows) {
    // Mapping based on the latest sheet inspection:
    // 0:Title, 1:Org, 2:Type, 3:Vacancies, 4:Qual, 5:Age, 6:LastDate, 7:Category, 8:State, 9:Year, 10:ExamType, 11:Year2, 12:Link
    const [title, organization, job_type, vacancies, qualification, age_limit, last_date, category, state, year, exam_type, year2, official_link] = row;

    // We use the 'Question PDF' column (index 12) as the official_link for jobs too if it's the only link available.
    if (!title || !official_link) continue;

    try {
      const exists = await Job.findOne({ official_link });
      if (!exists) {
        console.log(`✨ New job found in sheet: ${title}`);
        const jobData = {
          title,
          organization: organization || 'Government of India',
          job_type: (job_type || 'job').toLowerCase(),
          vacancies: vacancies || 'Check Notification',
          qualification: qualification || 'Check Notification',
          age_limit: age_limit || 'As per rules',
          last_date: last_date ? new Date(last_date) : null,
          category: category || 'General',
          state: state || 'All India',
          official_link,
          description: `Sheet update: ${title} (${year || '2026'})`
        };

        const newJob = await createJob(jobData);
        
        // Post to channel
        try {
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
