const { Markup } = require('telegraf');
const { getLatestJobs, getJobsByCategory, getJobsByState, getTotalJobs, getTotalJobsByCategory, getTotalJobsByState, getJobsByType, getTotalJobsByType, searchJobsByEligibility } = require('../services/jobService');
const { getMainMenu } = require('./startController');

function formatJob(job) {
  const typeEmoji = job.job_type === 'admit_card' ? '📄' : (job.job_type === 'result' ? '📊' : '🔥');
  const typeLabel = job.job_type === 'admit_card' ? 'ADMIT CARD' : (job.job_type === 'result' ? 'RESULT' : 'NEW JOB');

  // Simple escaping for HTML
  const escape = (str) => String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[m]));

  const title = escape(job.title.toUpperCase());
  const org = escape(job.organization);
  const vac = escape(job.vacancies || 'Notification Dekhein');
  const qual = escape(job.qualification || 'As per norms');
  const loc = escape(job.state || 'All India');
  const link = escape(job.official_link);
  
  const lastDate = job.last_date 
    ? new Date(job.last_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) 
    : 'Jald hi';

  return `<b>${typeEmoji} ${typeLabel}: ${title}</b>\n\n` +
    `🏛️ <b>Organization:</b> ${org}\n` +
    `👥 <b>Vacancies:</b> ${vac}\n` +
    `🎓 <b>Qualification:</b> ${qual}\n` +
    `📅 <b>Last Date:</b> ${lastDate}\n` +
    `📍 <b>Location:</b> ${loc}\n\n` +
    `🔗 <b>Official Link:</b> <a href="${link}">Click Here</a>\n\n` +
    `📢 <b>Join @sarkariresul for more alerts!</b>`;
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
        parse_mode: 'HTML',
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
        parse_mode: 'HTML',
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
        parse_mode: 'HTML',
        ...getJobButtons(job.id, page, totalPages, `state_${state.replace(/ /g, '_').toLowerCase()}`)
      });
    }
  } catch (error) {
    console.error('Error fetching state jobs:', error);
    await ctx.reply('⚠️ Error loading jobs. Kripya dobara try karein.');
  }
}

async function handleAdmitCards(ctx, page = 0) {
  try {
    const jobs = await getJobsByType('admit_card', 5, page * 5);
    if (jobs.length === 0) {
      await ctx.reply('Abhi koi Admit Card updates nahi hai.', getMainMenu());
      return;
    }
    const totalPages = Math.ceil(await getTotalJobsByType('admit_card') / 5);
    for (const job of jobs) {
      await ctx.reply(formatJob(job), {
        parse_mode: 'HTML',
        ...getJobButtons(job.id, page, totalPages, 'admit_card')
      });
    }
  } catch (error) {
    console.error('Error loading admit cards:', error);
    await ctx.reply('⚠️ Error loading admit cards.');
  }
}

async function handleResults(ctx, page = 0) {
  try {
    const jobs = await getJobsByType('result', 5, page * 5);
    if (jobs.length === 0) {
      await ctx.reply('Abhi koi Result updates nahi hai.', getMainMenu());
      return;
    }
    const totalPages = Math.ceil(await getTotalJobsByType('result') / 5);
    for (const job of jobs) {
      await ctx.reply(formatJob(job), {
        parse_mode: 'HTML',
        ...getJobButtons(job.id, page, totalPages, 'result')
      });
    }
  } catch (error) {
    console.error('Error loading results:', error);
    await ctx.reply('⚠️ Error loading results.');
  }
}

async function handleEligibilityChecker(ctx) {
  const options = [['10th Pass', '12th Pass'], ['Graduate', 'Post Graduate'], ['🏠 Main Menu']];
  const keyboard = options.map(row => row.map(opt => Markup.button.callback(opt, opt === '🏠 Main Menu' ? 'main_menu' : `eligibility_${opt.toLowerCase().replace(' ', '_')}`)));
  await ctx.reply('🔍 Apni highest qualification chunein:', Markup.inlineKeyboard(keyboard));
}

async function handleEligibilityResults(ctx, qualification) {
  try {
    const jobs = await searchJobsByEligibility(null, qualification, null);
    if (jobs.length === 0) {
      await ctx.reply(`Aapki qualification (${qualification}) ke liye abhi koi job available nahi hai.`, getMainMenu());
      return;
    }
    await ctx.reply(`🔍 Results for ${qualification}:`);
    for (const job of jobs) {
      await ctx.reply(formatJob(job), {
        parse_mode: 'HTML',
        ...getJobButtons(job.id, 0, 1, 'latest')
      });
    }
  } catch (error) {
    console.error('Error checking eligibility:', error);
  }
}

module.exports = {
  handleLatestJobs,
  handleSearchByExam,
  handleCategoryJobs,
  handleStateJobs,
  handleStateJobsList,
  handleAdmitCards,
  handleResults,
  handleEligibilityChecker,
  handleEligibilityResults,
  formatJob,
  getJobButtons
};
