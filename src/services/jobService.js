const { getDB } = require('../database/db');
const { ObjectId } = require('mongodb');

async function createJob(jobData) {
  const db = getDB();
  const {
    title, organization, vacancies, qualification, age_limit,
    start_date, last_date, category, state, official_link, description
  } = jobData;

  const job = {
    title,
    organization,
    vacancies,
    qualification,
    age_limit,
    start_date: new Date(start_date),
    last_date: new Date(last_date),
    category,
    state,
    official_link,
    description,
    created_at: new Date()
  };

  const result = await db.collection('jobs').insertOne(job);
  return { ...job, _id: result.insertedId };
}

async function getLatestJobs(limit = 5, offset = 0) {
  const db = getDB();
  return await db.collection('jobs')
    .find({})
    .sort({ created_at: -1 })
    .skip(offset)
    .limit(limit)
    .toArray();
}

async function getJobsByCategory(category, limit = 5, offset = 0) {
  const db = getDB();
  return await db.collection('jobs')
    .find({ category })
    .sort({ created_at: -1 })
    .skip(offset)
    .limit(limit)
    .toArray();
}

async function getJobsByState(state, limit = 5, offset = 0) {
  const db = getDB();
  return await db.collection('jobs')
    .find({ state })
    .sort({ created_at: -1 })
    .skip(offset)
    .limit(limit)
    .toArray();
}

async function searchJobsByEligibility(age, qualification, state) {
  const db = getDB();
  const filter = {};

  if (qualification) {
    filter.qualification = { $regex: qualification, $options: 'i' };
  }

  if (state) {
    filter.state = state;
  }

  return await db.collection('jobs')
    .find(filter)
    .sort({ created_at: -1 })
    .limit(10)
    .toArray();
}

async function getJobById(jobId) {
  const db = getDB();
  return await db.collection('jobs').findOne({ _id: new ObjectId(jobId) });
}

async function deleteJob(jobId) {
  const db = getDB();
  await db.collection('jobs').deleteOne({ _id: new ObjectId(jobId) });
}

async function getTotalJobs() {
  const db = getDB();
  return await db.collection('jobs').countDocuments();
}

module.exports = {
  createJob,
  getLatestJobs,
  getJobsByCategory,
  getJobsByState,
  searchJobsByEligibility,
  getJobById,
  deleteJob,
  getTotalJobs
};
