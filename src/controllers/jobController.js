const { Markup } = require('telegraf');
const { getLatestJobs, getJobsByCategory, getJobsByState, getTotalJobs, getTotalJobsByCategory, getTotalJobsByState } = require('../services/jobService');
const { getMainMenu } = require('./startController');

function formatJob(job) {
  return `📌 **${job.title}**\n\n` +
    `🏛️ Organization: ${job.organization}\n` +
    `📅 Last Date: ${job.last_date ? new Date(job.last_date).toLocaleDateString('en-IN') : 'N/A'}\n` +
    `🎓 Qualification: ${job.qualification || 'N/A'}\n` +
    `📍 State: ${job.state || 'All India'}\n` +
    `🔗 Link: ${job.official_link || 'N/A'}`;
}

function getJobButtons(jobId, page, totalPages, context) {
  const buttons = [];
  
  // Remind Me button
  buttons.push([Markup.button.callback('🔔 Remind Me', `remind_${jobId}`)]);
  
  // Pagination buttons
  const navButtons = [];
  if (page > 0) {
    navButtons.push(Markup.button.callback('⬅️ Previous', `${context}_page_${page - 1}`));
  }
  if (page < totalPages - 1) {
    navButtons.push(Markup.button.callback('Next ➡️', `${context}_page_${page + 1}`));
  }
  if (navButtons.length > 0) {
    buttons.push(navButtons);
  }
  
  // Back to menu
  buttons.push([Markup.button.callback('🏠 Main Menu', 'main_menu')]);
  
  return Markup.inlineKeyboard(buttons);
}

async function handleLatestJobs(ctx, page = 0) {
  try {
    const jobs = await getLatestJobs(5, page * 5);
    
    if (jobs.length === 0) {
      await ctx.reply('Abhi koi job available nahi hai.', getMainMenu());
      return;
    }

    const totalPages = Math.ceil(await getTotalJobs() / 5);
    
    for (const job of jobs) {
      const message = formatJob(job);
      await ctx.reply(message, {
        parse_mode: 'Markdown',
        ...getJobButtons(job.id, page, totalPages, 'latest')
      });
    }
  } catch (error) {
    console.error('Error fetching latest jobs:', error);
    await ctx.reply('⚠️ Error loading jobs. Kripya dobara try karein.');
  }
}

async function handleSearchByExam(ctx) {
  const categories = [
    ['SSC', 'UPSC'],
    ['Railway', 'Banking'],
    ['Police', 'State PSC'],
    ['Teaching', 'Defence'],
    ['🏠 Main Menu']
  ];

  const keyboard = categories.map(row => 
    row.map(cat => 
      cat === '🏠 Main Menu' 
        ? Markup.button.callback(cat, 'main_menu')
        : Markup.button.callback(cat, `category_${cat.toLowerCase()}`)
    )
  );

  await ctx.reply(
    '📌 Apni exam category chunein:',
    Markup.inlineKeyboard(keyboard)
  );
}

async function handleCategoryJobs(ctx, category, page = 0) {
  try {
    const jobs = await getJobsByCategory(category, 5, page * 5);
    
    if (jobs.length === 0) {
      await ctx.reply(`${category} category mein abhi koi job nahi hai.`, getMainMenu());
      return;
    }

    const totalPages = Math.ceil(await getTotalJobsByCategory(category) / 5);
    
    for (const job of jobs) {
      const message = formatJob(job);
      await ctx.reply(message, {
        parse_mode: 'Markdown',
        ...getJobButtons(job.id, page, totalPages, `category_${category}`)
      });
    }
  } catch (error) {
    console.error('Error fetching category jobs:', error);
    await ctx.reply('⚠️ Error loading jobs. Kripya dobara try karein.');
  }
}

async function handleStateJobs(ctx) {
  const states = [
    ['Uttar Pradesh', 'Maharashtra'],
    ['Bihar', 'West Bengal'],
    ['Madhya Pradesh', 'Tamil Nadu'],
    ['Rajasthan', 'Karnataka'],
    ['Gujarat', 'Andhra Pradesh'],
    ['All India'],
    ['🏠 Main Menu']
  ];

  const keyboard = states.map(row => 
    row.map(state => 
      state === '🏠 Main Menu'
        ? Markup.button.callback(state, 'main_menu')
        : Markup.button.callback(state, `state_${state.replace(/ /g, '_').toLowerCase()}`)
    )
  );

  await ctx.reply(
    '📍 Apni state chunein:',
    Markup.inlineKeyboard(keyboard)
  );
}

async function handleStateJobsList(ctx, state, page = 0) {
  try {
    const jobs = await getJobsByState(state, 5, page * 5);
    
    if (jobs.length === 0) {
      await ctx.reply(`${state} mein abhi koi job nahi hai.`, getMainMenu());
      return;
    }

    const totalPages = Math.ceil(await getTotalJobsByState(state) / 5);
    
    for (const job of jobs) {
      const message = formatJob(job);
      await ctx.reply(message, {
        parse_mode: 'Markdown',
        ...getJobButtons(job.id, page, totalPages, `state_${state.replace(/ /g, '_').toLowerCase()}`)
      });
    }
  } catch (error) {
    console.error('Error fetching state jobs:', error);
    await ctx.reply('⚠️ Error loading jobs. Kripya dobara try karein.');
  }
}

module.exports = {
  handleLatestJobs,
  handleSearchByExam,
  handleCategoryJobs,
  handleStateJobs,
  handleStateJobsList,
  formatJob,
  getJobButtons
};
