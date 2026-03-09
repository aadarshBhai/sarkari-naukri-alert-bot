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
  job_type: {
    type: String,
    enum: ['job', 'admit_card', 'result'],
    default: 'job',
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

// Paper Schema
const paperSchema = new mongoose.Schema({
  exam: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  year: String,
  pdf_link: {
    type: String,
    required: true,
    unique: true, // Prevent duplicate links
  },
  source: {
    type: String, // To store the origin URL
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);
const Job = mongoose.model('Job', jobSchema);
const Reminder = mongoose.model('Reminder', reminderSchema);
const Paper = mongoose.model('Paper', paperSchema);

module.exports = { User, Job, Reminder, Paper };
