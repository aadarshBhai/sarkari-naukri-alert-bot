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
    try {
      if (ctx.botInfo && ctx.botInfo.username) {
        botUsername = ctx.botInfo.username;
      } else {
        const me = await ctx.telegram.getMe();
        botUsername = me.username;
      }
    } catch (botError) {
      console.error('Error getting bot info:', botError);
      botUsername = 'SarkariAlertBot'; // Fallback if API fails
    }
    
    const referralLink = `https://t.me/${botUsername}?start=ref_${user.referral_code}`;

    const message = `🎁 **Refer & Earn Program**\n\n` +
      `👥 **Aapke Total Referrals:** ${referralCount}\n\n` +
      `🔗 **Aapka Personal Referral Link:**\n\`${referralLink}\` (Tap to copy)\n\n` +
      `📢 **Kaise Kaam Karta Hai?**\n` +
      `1. Is link ko apne dosto ke saath share karein.\n` +
      `2. Jab wo is link se bot join karenge, aapki referral count badhegi.\n` +
      `3. Har valid referral par aapko points/updates milenge!`;

    const shareText = `🏛️ *Sarkari Naukri Alert Bot*\n\n🔥 Latest Govt Jobs, Admit Cards aur Results ki updates sabse pehle paane ke liye join karein!\n\n👇 Join now using my link:\n${referralLink}`;

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.url('📤 Share with Friends', `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`)],
        [Markup.button.callback('🏠 Main Menu', 'main_menu')]
      ])
    });
  } catch (error) {
    console.error('Error in refer & earn:', error);
    await ctx.reply('⚠️ Error! Kripya dobara try karein.');
  }
}

module.exports = { handleReferEarn };
