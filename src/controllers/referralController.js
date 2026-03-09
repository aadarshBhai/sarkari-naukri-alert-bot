const { getUser, getUserReferrals } = require('../services/userService');
const { Markup } = require('telegraf');

async function handleReferEarn(ctx) {
  try {
    const telegramId = ctx.from.id;
    const user = await getUser(telegramId);
    
    if (!user) {
      await ctx.reply('⚠️ Error! Kripya /start karein.');
      return;
    }

    const referralCount = await getUserReferrals(telegramId);
    let botUsername;
    if (ctx.botInfo && ctx.botInfo.username) {
      botUsername = ctx.botInfo.username;
    } else {
      const me = await ctx.telegram.getMe();
      botUsername = me.username;
    }
    
    const referralLink = `https://t.me/${botUsername}?start=ref_${user.referral_code}`;

    const message = `🎁 **Refer & Earn**\n\n` +
      `👥 Total Referrals: ${referralCount}\n\n` +
      `🔗 Apna Referral Link:\n${referralLink}\n\n` +
      `📢 Is link ko apne dosto ke saath share karein!\n` +
      `Jab wo is link se bot join karenge, aapki referral count badhegi.`;

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.url('📤 Share Link', `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Sarkari Naukri Alert Bot - Latest Government Jobs!')}`)],
        [Markup.button.callback('🏠 Main Menu', 'main_menu')]
      ])
    });
  } catch (error) {
    console.error('Error in refer & earn:', error);
    await ctx.reply('⚠️ Error! Kripya dobara try karein.');
  }
}

module.exports = { handleReferEarn };
