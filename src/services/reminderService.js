const { Reminder } = require('../database/models');

async function createReminder(userId, jobId, reminderDate) {
  try {
    const reminder = new Reminder({
      user_id: userId,
      job_id: jobId,
      reminder_type: 'job_deadline',
      reminder_date: reminderDate,
      sent: false
    });
    
    await reminder.save();
    return reminder;
  } catch (error) {
    console.error('Error creating reminder:', error);
    throw error;
  }
}

async function getPendingReminders() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return await Reminder.find({
      reminder_date: { $gte: today, $lt: tomorrow },
      sent: false
    }).populate('user_id').populate('job_id');
  } catch (error) {
    console.error('Error getting pending reminders:', error);
    return [];
  }
}

async function markReminderSent(reminderId) {
  try {
    await Reminder.findByIdAndUpdate(reminderId, { sent: true });
  } catch (error) {
    console.error('Error marking reminder sent:', error);
    throw error;
  }
}

module.exports = {
  createReminder,
  getPendingReminders,
  markReminderSent
};
