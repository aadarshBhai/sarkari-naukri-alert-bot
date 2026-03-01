function isAdmin(ctx, next) {
  const adminId = parseInt(process.env.ADMIN_TELEGRAM_ID);
  const userId = ctx.from?.id;

  if (userId === adminId) {
    return next();
  } else {
    return ctx.reply('⚠️ Ye command sirf admin ke liye hai.');
  }
}

module.exports = { isAdmin };
