const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  telegram_id: {
    type: Number,
    required: true,
    unique: true,
  },
  referral_code: {
    type: String,
    unique: true,
    sparse: true,
  },
  referred_by: String,
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Job Schema
const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  organization: {
    type: String,
    required: true,
  },
  vacancies: String,
  qualification: String,
  age_limit: String,
  start_date: Date,
  last_date: Date,
  category: String,
  state: String,
  official_link: String,
  description: String,
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Reminder Schema
const reminderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  reminder_type: String,
  reminder_date: Date,
  sent: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model('User', userSchema);
const Job = mongoose.model('Job', jobSchema);
const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = { User, Job, Reminder };
