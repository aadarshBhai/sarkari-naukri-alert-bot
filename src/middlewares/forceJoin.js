const { Markup } = require('telegraf');

async function checkMembership(ctx, next) {
  const channelUsername = process.env.CHANNEL_USERNAME;
  const userId = ctx.from.id;

  try {
    const member = await ctx.telegram.getChatMember(channelUsername, userId);
    const validStatuses = ['member', 'administrator', 'creator'];

    if (validStatuses.includes(member.status)) {
      return next();
    } else {
      await ctx.reply(
        '⚠️ Bot use karne ke liye pehle official channel join karein.\n\n👇 Niche diye gaye button se channel join karein:',
        Markup.inlineKeyboard([
          [Markup.button.url('🔔 Join Channel', `https://t.me/${channelUsername.replace('@', '')}`)],
          [Markup.button.callback('✅ I Have Joined', 'verify_join')]
        ])
      );
    }
  } catch (error) {
    console.error('Error checking membership:', error);
    
    if (error.response && error.response.error_code === 400) {
      await ctx.reply(
        '⚠️ Bot ko channel mein admin banana zaroori hai.\n\nKripya admin se sampark karein.'
      );
    } else {
      await ctx.reply(
        '⚠️ Kuch galat ho gaya. Kripya thodi der baad try karein.'
      );
    }
  }
}

module.exports = { checkMembership };
