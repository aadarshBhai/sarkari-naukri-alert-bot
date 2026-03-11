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
 * Sheet format (Sheet1): Title | Organization | Job Type | Vacancies | Qualification | Age Limit | Last Date | Category | State | Year | Exam Type | PDF Link
 * @returns {Promise<Array>} - List of normalized paper objects.
 */
async function fetchPapersFromSheets() {
  // Mapping based on inspection: index 12 is 'Question PDF'
  const rows = await getSheetData('Sheet1!A2:M'); 
  if (!rows || rows.length === 0) return [];

  return rows
    .filter(row => {
      // index 2 is job_type, index 10 is exam_type, index 12 is pdf_link
      const [, , job_type, , , , , , , , exam_type, , pdf_link] = row;
      return pdf_link && (exam_type || (job_type && job_type.toLowerCase().includes('paper')));
    })
    .map(row => {
      const [title, , , , , , , , , year, exam_type, , pdf_link] = row;
      return {
        exam: exam_type || 'Other',
        title: title,
        year: year || '2026',
        pdf_link: pdf_link,
        source: 'Google Sheet'
      };
    });
}

async function getAllPapers() {
  try {
    const dbPapers = await Paper.find().sort({ year: -1, created_at: -1 });
    const sheetPapers = await fetchPapersFromSheets();
    
    // Combine and deduplicate by normalized link
    const allPapers = [...sheetPapers, ...dbPapers];
    const uniquePapers = [];
    const seenLinks = new Set();

    for (const paper of allPapers) {
      const normalized = normalizeLink(paper.pdf_link);
      if (!seenLinks.has(normalized)) {
        seenLinks.add(normalized);
        uniquePapers.push(paper);
      }
    }

    return uniquePapers;
  } catch (error) {
    console.error('Error in getAllPapers:', error);
    throw error;
  }
}

async function getPapersByExam(exam) {
  try {
    const dbPapers = await Paper.find({ exam: new RegExp(`^${exam}$`, 'i') }).sort({ year: -1, created_at: -1 });
    const sheetPapers = (await fetchPapersFromSheets()).filter(p => p.exam.toLowerCase() === exam.toLowerCase());
    
    const allPapers = [...sheetPapers, ...dbPapers];
    const uniquePapers = [];
    const seenLinks = new Set();

    for (const paper of allPapers) {
      const normalized = normalizeLink(paper.pdf_link);
      if (!seenLinks.has(normalized)) {
        seenLinks.add(normalized);
        uniquePapers.push(paper);
      }
    }

    return uniquePapers;
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
    
    const allPapers = [...sheetPapers, ...dbPapers];
    const uniquePapers = [];
    const seenLinks = new Set();

    for (const paper of allPapers) {
      const normalized = normalizeLink(paper.pdf_link);
      if (!seenLinks.has(normalized)) {
        seenLinks.add(normalized);
        uniquePapers.push(paper);
      }
    }

    return uniquePapers;
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
