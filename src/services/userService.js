const { User } = require('../database/models');

function generateReferralCode(telegramId) {
  return `REF${telegramId}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
}

async function createUser(telegramId, referredBy = null) {
  try {
    let user = await User.findOne({ telegram_id: telegramId });
    
    if (user) {
      // If user exists but doesn't have a referral code, generate one
      if (!user.referral_code) {
        user.referral_code = generateReferralCode(telegramId);
        await user.save();
      }
      
      // If user exists but wasn't referred before, and now comes via referral
      // We only update if they haven't been referred by anyone yet
      if (referredBy && !user.referred_by && referredBy !== user.referral_code) {
        // Verify the referrer exists to avoid fake/broken referrals
        const referrer = await User.findOne({ referral_code: referredBy });
        if (referrer && referrer.telegram_id !== telegramId) {
          user.referred_by = referredBy;
          await user.save();
        }
      }
      return user;
    }
    
    const referralCode = generateReferralCode(telegramId);
    
    // Validate referrer for new users
    let validReferredBy = null;
    if (referredBy) {
      const referrer = await User.findOne({ referral_code: referredBy });
      if (referrer && referrer.telegram_id !== telegramId) {
        validReferredBy = referredBy;
      }
    }
    
    user = new User({
      telegram_id: telegramId,
      referral_code: referralCode,
      referred_by: validReferredBy
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
