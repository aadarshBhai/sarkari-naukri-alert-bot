const { createReminder } = require('../services/reminderService');
const { getUser } = require('../services/userService');
const { getJobById } = require('../services/jobService');

async function handleRemindMe(ctx, jobId) {
  try {
    const telegramId = ctx.from.id;
    const user = await getUser(telegramId);
    
    if (!user) {
      await ctx.answerCbQuery('⚠️ Error! Kripya /start karein.');
      return;
    }

    const job = await getJobById(jobId);
    if (!job) {
      await ctx.answerCbQuery('⚠️ Job nahi mili!');
      return;
    }

    const lastDate = new Date(job.last_date);
    const reminderDate = new Date(lastDate);
    reminderDate.setDate(reminderDate.getDate() - 3);

    await createReminder(user.id, jobId, reminderDate.toISOString().split('T')[0]);
    
    await ctx.answerCbQuery('✅ Reminder set ho gaya!');
    await ctx.reply(`🔔 Reminder set!\n\nAapko ${reminderDate.toLocaleDateString('en-IN')} ko reminder milega.`);
  } catch (error) {
    console.error('Error setting reminder:', error);
    await ctx.answerCbQuery('⚠️ Error! Dobara try karein.');
  }
}

module.exports = { handleRemindMe };
