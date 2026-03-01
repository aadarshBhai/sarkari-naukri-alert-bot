const { Markup } = require('telegraf');
const { createUser, getUser } = require('../services/userService');

function getMainMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📌 Latest Govt Jobs', 'latest_jobs')],
    [Markup.button.callback('📌 Search by Exam', 'search_exam')],
    [Markup.button.callback('📌 Eligibility Checker', 'eligibility_checker')],
    [Markup.button.callback('📌 State Wise Jobs', 'state_jobs')],
    [Markup.button.callback('📌 Admit Card Updates', 'admit_cards')],
    [Markup.button.callback('📌 Results Updates', 'results')],
    [Markup.button.callback('📌 Refer & Earn', 'refer_earn')]
  ]);
}

async function handleStart(ctx) {
  const telegramId = ctx.from.id;
  const startPayload = ctx.startPayload;
  let referredBy = null;

  // Check if user came via referral link
  if (startPayload && startPayload.startsWith('ref_')) {
    referredBy = startPayload.replace('ref_', '');
  }

  try {
    // Create or get user
    await createUser(telegramId, referredBy);

    const welcomeMessage = `🙏 Namaste!

🏛️ **Sarkari Naukri Alert 2026 Bot** mein aapka swagat hai!

📌 Yahan aapko milegi:
• Latest Government Jobs ki jaankari
• State-wise job alerts
• Eligibility checker
• Admit card & result updates
• Aur bahut kuch!

👇 Niche se apna option chunein:`;

    await ctx.reply(welcomeMessage, getMainMenu());
  } catch (error) {
    console.error('Error in start handler:', error);
    await ctx.reply('⚠️ Kuch galat ho gaya. Kripya /start dobara try karein.');
  }
}

async function handleVerifyJoin(ctx) {
  const channelUsername = process.env.CHANNEL_USERNAME;
  const userId = ctx.from.id;

  try {
    const member = await ctx.telegram.getChatMember(channelUsername, userId);
    const validStatuses = ['member', 'administrator', 'creator'];

    if (validStatuses.includes(member.status)) {
      await ctx.answerCbQuery('✅ Verified! Ab aap bot use kar sakte hain.');
      await ctx.editMessageText(
        '✅ Shukriya! Aapne channel join kar liya hai.\n\n👇 Niche se apna option chunein:',
        getMainMenu()
      );
    } else {
      await ctx.answerCbQuery('⚠️ Pehle channel join karein!');
    }
  } catch (error) {
    console.error('Error verifying join:', error);
    await ctx.answerCbQuery('⚠️ Error! Kripya dobara try karein.');
  }
}

module.exports = {
  handleStart,
  handleVerifyJoin,
  getMainMenu
};
