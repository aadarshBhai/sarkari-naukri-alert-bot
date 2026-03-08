const { Job } = require('../database/models');

async function createJob(jobData) {
  try {
    const {
      title, organization, vacancies, qualification, age_limit,
      start_date, last_date, category, state, official_link, description
    } = jobData;

    const job = new Job({
      title,
      organization,
      job_type: jobData.job_type || 'job',
      vacancies,
      qualification,
      age_limit,
      start_date,
      last_date,
      category,
      state,
      official_link,
      description
    });

    await job.save();
    return job;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
}

async function getLatestJobs(limit = 5, offset = 0) {
  try {
    return await Job.find({ job_type: 'job' }).sort({ created_at: -1 }).limit(limit).skip(offset);
  } catch (error) {
    console.error('Error getting latest jobs:', error);
    return [];
  }
}

async function getJobsByType(type, limit = 5, offset = 0) {
  try {
    return await Job.find({ job_type: type }).sort({ created_at: -1 }).limit(limit).skip(offset);
  } catch (error) {
    console.error('Error getting jobs by type:', error);
    return [];
  }
}

async function getJobsByCategory(category, limit = 5, offset = 0) {
  try {
    return await Job.find({ category }).sort({ created_at: -1 }).limit(limit).skip(offset);
  } catch (error) {
    console.error('Error getting jobs by category:', error);
    return [];
  }
}

async function getJobsByState(state, limit = 5, offset = 0) {
  try {
    return await Job.find({ state }).sort({ created_at: -1 }).limit(limit).skip(offset);
  } catch (error) {
    console.error('Error getting jobs by state:', error);
    return [];
  }
}

async function searchJobsByEligibility(age, qualification, state) {
  try {
    const filter = {};
    
    if (qualification) {
      filter.qualification = { $regex: qualification, $options: 'i' };
    }
    
    if (state) {
      filter.state = state;
    }
    
    return await Job.find(filter).sort({ created_at: -1 }).limit(10);
  } catch (error) {
    console.error('Error searching jobs by eligibility:', error);
    return [];
  }
}

async function getJobById(jobId) {
  try {
    return await Job.findById(jobId);
  } catch (error) {
    console.error('Error getting job by id:', error);
    return null;
  }
}

async function deleteJob(jobId) {
  try {
    await Job.findByIdAndDelete(jobId);
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
}

async function getTotalJobs() {
  try {
    return await Job.countDocuments({ job_type: 'job' });
  } catch (error) {
    console.error('Error getting total jobs:', error);
    return 0;
  }
}

async function getTotalJobsByType(type) {
  try {
    return await Job.countDocuments({ job_type: type });
  } catch (error) {
    console.error('Error getting total jobs by type:', error);
    return 0;
  }
}

async function getTotalJobsByCategory(category) {
  try {
    return await Job.countDocuments({ category });
  } catch (error) {
    console.error('Error getting total jobs by category:', error);
    return 0;
  }
}

async function getTotalJobsByState(state) {
  try {
    return await Job.countDocuments({ state });
  } catch (error) {
    console.error('Error getting total jobs by state:', error);
    return 0;
  }
}

module.exports = {
  createJob,
  getLatestJobs,
  getJobsByCategory,
  getJobsByState,
  searchJobsByEligibility,
  getJobById,
  deleteJob,
  getTotalJobs,
  getTotalJobsByCategory,
  getTotalJobsByState,
  getJobsByType,
  getTotalJobsByType
};
