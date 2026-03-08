const { User } = require('../database/models');

function generateReferralCode(telegramId) {
  return `REF${telegramId}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
}

async function createUser(telegramId, referredBy = null) {
  try {
    let user = await User.findOne({ telegram_id: telegramId });
    if (user) {
      return user;
    }
    
    const referralCode = generateReferralCode(telegramId);
    
    user = new User({
      telegram_id: telegramId,
      referral_code: referralCode,
      referred_by: referredBy ? referredBy.toString() : null
    });
    
    await user.save();
    return user;
  } catch (error) {
    if (error.code === 11000) {
      return await User.findOne({ telegram_id: telegramId });
    }
    console.error('Error creating user:', error);
    throw error;
  }
}

async function getUser(telegramId) {
  try {
    return await User.findOne({ telegram_id: telegramId });
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

async function getUserReferrals(telegramId) {
  try {
    const user = await getUser(telegramId);
    if (!user) return 0;
    
    const count = await User.countDocuments({ referred_by: user.referral_code });
    return count;
  } catch (error) {
    console.error('Error getting user referrals:', error);
    return 0;
  }
}

async function getTotalUsers() {
  try {
    return await User.countDocuments();
  } catch (error) {
    console.error('Error getting total users:', error);
    return 0;
  }
}

async function getAllUsers() {
  try {
    return await User.find({}, 'telegram_id');
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
}

module.exports = {
  createUser,
  getUser,
  getUserReferrals,
  getTotalUsers,
  getAllUsers,
  generateReferralCode
};
