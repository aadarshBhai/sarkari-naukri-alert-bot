const { Paper } = require('../database/models');

async function getAllPapers() {
  try {
    return await Paper.find().sort({ year: -1, created_at: -1 });
  } catch (error) {
    console.error('Error in getAllPapers:', error);
    throw error;
  }
}

async function getPapersByExam(exam) {
  try {
    return await Paper.find({ exam: new RegExp(`^${exam}$`, 'i') }).sort({ year: -1, created_at: -1 });
  } catch (error) {
    console.error('Error in getPapersByExam:', error);
    throw error;
  }
}

async function createPaper(paperData) {
  try {
    const paper = new Paper(paperData);
    await paper.save();
    return paper;
  } catch (error) {
    console.error('Error in createPaper:', error);
    throw error;
  }
}

module.exports = {
  createPaper,
  getPapersByExam
};
