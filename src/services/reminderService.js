const { getDB } = require('../database/db');
const { ObjectId } = require('mongodb');

async function createReminder(userId, jobId, reminderDate) {
  const db = getDB();
  const reminder = {
    user_id: userId,
    job_id: jobId,
    reminder_type: 'job_deadline',
    reminder_date: new Date(reminderDate),
    sent: false,
    created_at: new Date()
  };
  
  const result = await db.collection('reminders').insertOne(reminder);
  return { ...reminder, _id: result.insertedId };
}

async function getPendingReminders() {
  const db = getDB();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const reminders = await db.collection('reminders')
    .find({
      reminder_date: { $gte: today, $lt: tomorrow },
      sent: false
    })
    .toArray();
  
  // Populate job and user data
  const enrichedReminders = [];
  for (const reminder of reminders) {
    const job = await db.collection('jobs').findOne({ _id: new ObjectId(reminder.job_id) });
    const user = await db.collection('users').findOne({ _id: new ObjectId(reminder.user_id) });
    
    if (job && user) {
      enrichedReminders.push({
        ...reminder,
        title: job.title,
        organization: job.organization,
        last_date: job.last_date,
        official_link: job.official_link,
        telegram_id: user.telegram_id
      });
    }
  }
  
  return enrichedReminders;
}

async function markReminderSent(reminderId) {
  const db = getDB();
  await db.collection('reminders').updateOne(
    { _id: new ObjectId(reminderId) },
    { $set: { sent: true } }
  );
}

module.exports = {
  createReminder,
  getPendingReminders,
  markReminderSent
};
