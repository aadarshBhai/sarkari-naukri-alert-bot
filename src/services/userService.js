const { getDB } = require('../database/db');

function generateReferralCode(telegramId) {
  return `REF${telegramId}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
}

async function createUser(telegramId, referredBy = null) {
  try {
    const db = getDB();
    const referralCode = generateReferralCode(telegramId);
    
    const user = {
      telegram_id: telegramId,
      referral_code: referralCode,
      referred_by: referredBy,
      created_at: new Date()
    };
    
    await db.collection('users').insertOne(user);
    return user;
  } catch (error) {
    if (error.code === 11000) { // Duplicate key
      const user = await db.collection('users').findOne({ telegram_id: telegramId });
      return user;
    }
    throw error;
  }
}

async function getUser(telegramId) {
  const db = getDB();
  return await db.collection('users').findOne({ telegram_id: telegramId });
}

async function getUserReferrals(telegramId) {
  const user = await getUser(telegramId);
  if (!user) return 0;
  
  const db = getDB();
  const count = await db.collection('users').countDocuments({ referred_by: user.referral_code });
  return count;
}

async function getTotalUsers() {
  const db = getDB();
  return await db.collection('users').countDocuments();
}

module.exports = {
  createUser,
  getUser,
  getUserReferrals,
  getTotalUsers,
  generateReferralCode
};
