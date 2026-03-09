const { User, Job, Reminder, Paper } = require('./models');

async function initDatabase() {
  try {
    // Check if papers exist, if not add seed data
    const paperCount = await Paper.countDocuments();
    if (paperCount === 0) {
      const seedPapers = [
        { exam: 'SSC', title: 'SSC CGL Previous Paper', year: '2023', pdf_link: 'https://example.com/ssc-cgl-2023.pdf' },
        { exam: 'Railway', title: 'RRB NTPC Previous Paper', year: '2022', pdf_link: 'https://example.com/rrb-ntpc-2022.pdf' },
        { exam: 'Banking', title: 'IBPS PO Previous Paper', year: '2021', pdf_link: 'https://example.com/ibps-po-2021.pdf' }
      ];
      await Paper.insertMany(seedPapers);
      console.log('✅ Seed papers added successfully');
    }

    console.log('✅ Database models initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

module.exports = { initDatabase };
