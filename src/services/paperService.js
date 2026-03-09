const { Paper } = require('../database/models');
const { getSheetData } = require('./googleSheetsService');

/**
 * Normalize a PDF link to ensure exact matching.
 * Handles: trailing slashes, http/https, query params, and case sensitivity.
 */
function normalizeLink(link) {
  if (!link) return '';
  try {
    let url = new URL(link.trim());
    // Normalize protocol, hostname, and pathname
    return `${url.protocol}//${url.hostname.toLowerCase().replace(/^www\./, '')}${url.pathname.replace(/\/$/, '')}`.toLowerCase();
  } catch (e) {
    // If it's not a valid URL, just trim and lowercase
    return link.trim().toLowerCase().replace(/\/$/, '');
  }
}

/**
 * Fetch papers from Google Sheets and return them as Paper objects.
 * Sheet format: exam | title | year | pdf_link
 * @returns {Promise<Array>} - List of normalized paper objects.
 */
async function fetchPapersFromSheets() {
  const rows = await getSheetData('Sheet1!A2:D'); // Assuming sheet name is 'Sheet1'
  if (!rows || rows.length === 0) return [];

  return rows.map(row => ({
    exam: row[0],
    title: row[1],
    year: row[2],
    pdf_link: row[3],
    source: 'Google Sheet'
  }));
}

async function getAllPapers() {
  try {
    const dbPapers = await Paper.find().sort({ year: -1, created_at: -1 });
    const sheetPapers = await fetchPapersFromSheets();
    
    // Combine both sources, but prefer Google Sheets if there's overlap? 
    // For now, just merge them.
    return [...sheetPapers, ...dbPapers];
  } catch (error) {
    console.error('Error in getAllPapers:', error);
    throw error;
  }
}

async function getPapersByExam(exam) {
  try {
    const dbPapers = await Paper.find({ exam: new RegExp(`^${exam}$`, 'i') }).sort({ year: -1, created_at: -1 });
    const sheetPapers = (await fetchPapersFromSheets()).filter(p => p.exam.toLowerCase() === exam.toLowerCase());
    
    return [...sheetPapers, ...dbPapers];
  } catch (error) {
    console.error('Error in getPapersByExam:', error);
    throw error;
  }
}

async function getPapersByExamAndYear(exam, year) {
  try {
    const dbPapers = await Paper.find({ 
      exam: new RegExp(`^${exam}$`, 'i'),
      year: year 
    }).sort({ created_at: -1 });
    
    const sheetPapers = (await fetchPapersFromSheets()).filter(p => 
      p.exam.toLowerCase() === exam.toLowerCase() && p.year === year
    );
    
    return [...sheetPapers, ...dbPapers];
  } catch (error) {
    console.error('Error in getPapersByExamAndYear:', error);
    throw error;
  }
}

async function createPaper(paperData) {
  try {
    if (paperData.pdf_link) {
      paperData.pdf_link = paperData.pdf_link.trim();
      // We don't necessarily want to change the stored link (might break access),
      // but we should check for existing ones with normalization.
      const normalizedNew = normalizeLink(paperData.pdf_link);
      
      const papers = await Paper.find({ exam: paperData.exam });
      const exists = papers.some(p => normalizeLink(p.pdf_link) === normalizedNew);
      
      if (exists) {
        return null; // Skip if normalized link exists
      }
    }

    const paper = new Paper(paperData);
    await paper.save();
    return paper;
  } catch (error) {
    if (error.code === 11000) return null; // Handle unique constraint
    console.error('Error in createPaper:', error);
    throw error;
  }
}

async function cleanDuplicatePapers() {
  try {
    const allPapers = await Paper.find({});
    const seen = new Set();
    let deletedCount = 0;

    for (const paper of allPapers) {
      const normalized = normalizeLink(paper.pdf_link);
      // Unique key based on exam, year and normalized link
      const key = `${paper.exam}_${paper.year}_${normalized}`;
      
      if (seen.has(key)) {
        await Paper.deleteOne({ _id: paper._id });
        deletedCount++;
      } else {
        seen.add(key);
      }
    }

    console.log(`Removed ${deletedCount} duplicate papers.`);
    return deletedCount;
  } catch (error) {
    console.error('Error cleaning duplicate papers:', error);
    throw error;
  }
}

module.exports = {
  createPaper,
  getPapersByExam,
  getPapersByExamAndYear,
  cleanDuplicatePapers,
  normalizeLink
};
