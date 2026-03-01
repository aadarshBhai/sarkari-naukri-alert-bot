const userRequests = new Map();

const RATE_LIMIT = 30; // requests per minute
const WINDOW = 60000; // 1 minute in milliseconds

function rateLimit(ctx, next) {
  const userId = ctx.from?.id;
  if (!userId) return next();

  const now = Date.now();
  const userRecord = userRequests.get(userId) || { count: 0, resetTime: now + WINDOW };

  if (now > userRecord.resetTime) {
    userRecord.count = 0;
    userRecord.resetTime = now + WINDOW;
  }

  userRecord.count++;
  userRequests.set(userId, userRecord);

  if (userRecord.count > RATE_LIMIT) {
    return ctx.reply('⚠️ Bahut zyada requests. Kripya 1 minute baad try karein.');
  }

  return next();
}

module.exports = { rateLimit };
