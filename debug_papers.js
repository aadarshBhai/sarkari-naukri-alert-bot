const mongoose = require('mongoose');
require('dotenv').config();
const { Paper } = require('./src/database/models');

async function checkPapers() {
  try {
    const uri = 'mongodb+srv://aadarshgolucky:TestPassword123@cluster0.oss7hwd.mongodb.net/Telegram?retryWrites=true&w=majority';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const paperCountsByYear = await Paper.aggregate([
      { $group: { _id: "$year", count: { $sum: 1 } } }
    ]);
    console.log('Paper counts by year:', paperCountsByYear);

    const somePapers = await Paper.find({}).limit(5);
    console.log('Sample papers:', somePapers.map(p => ({ title: p.title, year: p.year, exam: p.exam })));

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error checking papers:', error);
  }
}

checkPapers();
