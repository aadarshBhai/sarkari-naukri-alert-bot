const { createJob, getTotalJobs } = require('../services/jobService');
const { getTotalUsers } = require('../services/userService');

const adminSessions = new Map();

async function handleAddJob(ctx) {
  const userId = ctx.from.id;
  adminSessions.set(userId, { step: 'type', data: {} });
  await ctx.reply('📝 Job ka type chunein (job / admit_card / result):');
}

async function handleAdminMessage(ctx) {
  const userId = ctx.from.id;
  const session = adminSessions.get(userId);
  
  if (!session) return;

  const text = ctx.message.text.toLowerCase().trim();
  
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
        await createJob(session.data);
        await ctx.reply('✅ Job successfully add ho gayi!');
        adminSessions.delete(userId);
      } catch (error) {
        console.error('Error creating job:', error);
        await ctx.reply('⚠️ Error! Job add nahi ho payi.');
        adminSessions.delete(userId);
      }
      break;
  }
  
  adminSessions.set(userId, session);
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

module.exports = {
  handleAddJob,
  handleAdminMessage,
  handleStats,
  adminSessions
};
