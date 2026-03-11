const { createJob, getTotalJobs, getLatestJobs } = require('../services/jobService');
const { createPaper } = require('../services/paperService');
const { getTotalUsers } = require('../services/userService');
const { scanPapers } = require('../services/scraperService');
const { formatJob } = require('./jobController');
const { Markup } = require('telegraf');

const adminSessions = new Map();

async function postJobToChannel(ctx, job) {
  const channelUsername = process.env.CHANNEL_USERNAME || '@SarkariNaukriAlertOfficial';
  const botUsername = ctx.botInfo?.username || 'SarkariNaukriAlertBot';
  
  try {
    const message = formatJob(job);
    
    // Add channel-specific footer if needed, but formatJob already has one. 
    // Let's customize it slightly for the channel as per prompt requirements.
    const channelMessage = `🚨 <b>New Government Job Alert</b>\n\n` +
      `🏢 <b>Organization:</b> ${job.organization.toUpperCase()}\n` +
      `📄 <b>Post:</b> ${job.title}\n` +
      `👥 <b>Vacancies:</b> ${job.vacancies || 'Notification Dekhein'}\n` +
      `🎓 <b>Qualification:</b> ${job.qualification || 'As per norms'}\n` +
      `📅 <b>Last Date:</b> ${job.last_date ? new Date(job.last_date).toLocaleDateString('en-IN') : 'Jald hi'}\n\n` +
      `🔗 <b>Apply Here:</b>\n${job.official_link}\n\n` +
      `📢 <b>Join our bot for alerts:</b>\nt.me/${botUsername}`;

    await ctx.telegram.sendMessage(channelUsername, channelMessage, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.url('🚀 Get Alerts in Bot', `https://t.me/${botUsername}`)]
      ])
    });
    return true;
  } catch (error) {
    console.error('Error posting to channel:', error);
    return false;
  }
}

async function handleAddJob(ctx) {
  const userId = ctx.from.id;
  adminSessions.set(userId, { type: 'job', step: 'type', data: {} });
  await ctx.reply('📝 Job ka type chunein (job / admit_card / result):');
}

async function handleAddPaper(ctx) {
  const userId = ctx.from.id;
  adminSessions.set(userId, { type: 'paper', step: 'exam', data: {} });
  await ctx.reply('📑 Exam ka naam enter karein (SSC / UPSC / Railway etc):');
}

async function handleAdminMessage(ctx) {
  const userId = ctx.from.id;
  const session = adminSessions.get(userId);
  
  if (!session) return;

  const text = ctx.message.text.toLowerCase().trim();
  
  switch (session.type) {
    case 'job':
      await handleJobSession(ctx, session, text);
      break;
    case 'paper':
      await handlePaperSession(ctx, session, text);
      break;
  }
}

async function handleJobSession(ctx, session, text) {
  const userId = ctx.from.id;
  switch (session.step) {
    case 'type':
      if (!['job', 'admit_card', 'result'].includes(text)) {
        await ctx.reply('⚠️ Invalid type! Kripya "job", "admit_card" ya "result" enter karein:');
        return;
      }
      session.data.job_type = text;
      session.step = 'title';
      await ctx.reply('📝 Job Title enter karein:');
      break;

    case 'title':
      session.data.title = text;
      session.step = 'organization';
      await ctx.reply('🏛️ Organization name enter karein:');
      break;
      
    case 'organization':
      session.data.organization = text;
      session.step = 'vacancies';
      await ctx.reply('👥 Number of vacancies enter karein:');
      break;
      
    case 'vacancies':
      session.data.vacancies = text;
      session.step = 'qualification';
      await ctx.reply('🎓 Qualification enter karein:');
      break;
      
    case 'qualification':
      session.data.qualification = text;
      session.step = 'age_limit';
      await ctx.reply('📅 Age limit enter karein:');
      break;
      
    case 'age_limit':
      session.data.age_limit = text;
      session.step = 'last_date';
      await ctx.reply('📆 Last date enter karein (YYYY-MM-DD format):');
      break;
      
    case 'last_date':
      session.data.last_date = text;
      session.step = 'category';
      await ctx.reply('📂 Category enter karein (SSC/UPSC/Railway/Banking/Police/etc):');
      break;
      
    case 'category':
      session.data.category = text;
      session.step = 'state';
      await ctx.reply('📍 State enter karein (ya All India):');
      break;
      
    case 'state':
      session.data.state = text;
      session.step = 'official_link';
      await ctx.reply('🔗 Official link enter karein:');
      break;
      
    case 'official_link':
      session.data.official_link = text;
      session.step = 'description';
      await ctx.reply('📝 Description enter karein:');
      break;
      
    case 'description':
      session.data.description = text;
      session.data.start_date = new Date().toISOString().split('T')[0];
      
      try {
        const newJob = await createJob(session.data);
        await ctx.reply('✅ Job successfully add ho gayi!');
        
        // Auto post to channel
        const posted = await postJobToChannel(ctx, newJob);
        if (posted) {
          await ctx.reply('📢 Job automatically channel pe post ho gayi!');
        } else {
          await ctx.reply('⚠️ Job saved but failed to post to channel.');
        }
        
        adminSessions.delete(userId);
      } catch (error) {
        console.error('Error creating job:', error);
        await ctx.reply('⚠️ Error! Job add nahi ho payi.');
        adminSessions.delete(userId);
      }
      break;
  }
  if (adminSessions.has(userId)) {
    adminSessions.set(userId, session);
  }
}

async function handlePaperSession(ctx, session, text) {
  const userId = ctx.from.id;
  const rawText = ctx.message.text.trim(); // Use original casing for some fields if needed, but the prompt says lowercase in handleAdminMessage context. Let's see.

  switch (session.step) {
    case 'exam':
      session.data.exam = rawText;
      session.step = 'title';
      await ctx.reply('📝 Paper ka title enter karein:');
      break;

    case 'title':
      session.data.title = rawText;
      session.step = 'year';
      await ctx.reply('📅 Exam ka saal (Year) enter karein:');
      break;

    case 'year':
      session.data.year = rawText;
      session.step = 'pdf_link';
      await ctx.reply('🔗 PDF download link enter karein:');
      break;

    case 'pdf_link':
      session.data.pdf_link = rawText;
      try {
        await createPaper(session.data);
        await ctx.reply('✅ Previous Paper successfully add ho gaya!');
        adminSessions.delete(userId);
      } catch (error) {
        console.error('Error creating paper:', error);
        await ctx.reply('⚠️ Error! Paper add nahi ho paya.');
        adminSessions.delete(userId);
      }
      break;
  }
  if (adminSessions.has(userId)) {
    adminSessions.set(userId, session);
  }
}

async function handleStats(ctx) {
  try {
    const totalUsers = await getTotalUsers();
    const totalJobs = await getTotalJobs();
    
    const message = `📊 **Bot Statistics**\n\n` +
      `👥 Total Users: ${totalUsers}\n` +
      `💼 Total Jobs: ${totalJobs}\n`;
    
    await ctx.reply(message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error fetching stats:', error);
    await ctx.reply('⚠️ Error fetching statistics.');
  }
}

async function handleScanPapers(ctx) {
  try {
    await ctx.reply('🔍 Scanning for new papers...');
    await scanPapers();
    await ctx.reply('✅ Paper scanning completed!');
  } catch (error) {
    console.error('Error scanning papers:', error);
    await ctx.reply('⚠️ Error scanning papers.');
  }
}

async function handleBroadcastJobs(ctx) {
  try {
    const jobs = await getLatestJobs(5, 0);
    if (jobs.length === 0) {
      return ctx.reply('⚠️ No latest jobs found to broadcast.');
    }

    await ctx.reply(`📡 Broadcasting ${jobs.length} latest jobs to channel...`);
    let successCount = 0;

    for (const job of jobs) {
      const success = await postJobToChannel(ctx, job);
      if (success) successCount++;
    }

    await ctx.reply(`✅ Broadcast complete! ${successCount}/${jobs.length} jobs posted successfully.`);
  } catch (error) {
    console.error('Error broadcasting jobs:', error);
    await ctx.reply('⚠️ Broadcast fail ho gaya. Console logs check karein.');
  }
}

async function handleCleanPapers(ctx) {
  try {
    await ctx.reply('🧹 Cleaning duplicate papers from the database...');
    const deletedCount = await cleanDuplicatePapers();
    await ctx.reply(`✅ Cleanup complete! Removed ${deletedCount} duplicate papers.`);
  } catch (error) {
    console.error('Error cleaning papers:', error);
    await ctx.reply('⚠️ An error occurred during cleanup.');
  }
}

const { syncJobsFromSheets } = require('../services/jobSyncService');

async function handleSyncSheets(ctx) {
  await ctx.reply('🔄 Syncing from Google Sheets...');
  try {
    // syncJobsFromSheets expects an object with telegram property
    await syncJobsFromSheets({ telegram: ctx.telegram }); 
    await ctx.reply('✅ Sheet sync completed! Check logs for details.');
  } catch (error) {
    await ctx.reply(`❌ Sync failed: ${error.message}`);
  }
}

module.exports = {
  handleAddJob,
  handleAddPaper,
  handleAdminMessage,
  handleStats,
  handleScanPapers,
  handleBroadcastJobs,
  handleCleanPapers,
  handleSyncSheets,
  adminSessions,
  postJobToChannel
};
