const axios = require('axios');
const cheerio = require('cheerio');
const { Job, Paper } = require('../database/models');
const { createJob } = require('./jobService');
const { createPaper } = require('./paperService');

const SARKARI_RESULT_URL = 'https://www.sarkariresult.com/';

async function fetchJobDetails(url) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    const $ = cheerio.load(data);
    
    let qualification = 'Notification dekhein';
    let lastDate = null;
    let vacancies = 'Notification dekhein';

    const rows = $('table tr').toArray();
    for (let i = 0; i < rows.length; i++) {
        const tr = rows[i];
        const rowText = $(tr).text().toLowerCase();
        const cells = $(tr).find('td, th'); // Match th too
        
        if (rowText.includes('eligibility') || rowText.includes('qualification')) {
            let value = '';
            // If it's a header row (cells contain label but not much data)
            if (cells.length >= 2) {
                const lastCellText = cells.last().text().trim();
                // If last cell is just "Eligibility" or similar, the data is in next row
                if (lastCellText.toLowerCase().includes('eligibility') && i + 1 < rows.length) {
                    value = $(rows[i + 1]).find('td').last().text().trim();
                } else {
                    value = lastCellText;
                }
            } else if (i + 1 < rows.length) {
                // Info might be in the next row
                value = $(rows[i + 1]).text().trim();
            }
            
            if (value && value.length > 5 && value.length < 500 && 
                !value.toLowerCase().includes('eligibility') && 
                !value.toLowerCase().includes('adsbygoogle') &&
                !value.toLowerCase().includes('<script') &&
                !value.toLowerCase().includes('{')) {
                qualification = value;
            }
        }
        
        if (rowText.includes('total post') || (rowText.includes('vacancy') && cells.length > 1)) {
            let vText = cells.last().text().trim();
            const vMatch = vText.match(/(\d+)/);
            if (vMatch) vacancies = vMatch[1];
        }
    }

    // Extract Last Date from "Important Dates" list or table
    const datesText = $('body').text().toLowerCase();
    const lastDateMatch = datesText.match(/last date for apply online\s*:\s*(\d{2}\/\d{2}\/\d{4})/i);
    if (lastDateMatch) {
      const [d, m, y] = lastDateMatch[1].split('/');
      lastDate = `${y}-${m}-${d}`;
    } else {
        // Backup: look for any date near "Last Date"
        $('li, td, p').each((i, el) => {
            const text = $(el).text().toLowerCase();
            if (text.includes('last date') && text.includes('apply')) {
                const match = text.match(/(\d{2}\/\d{2}\/\d{4})/);
                if (match) {
                    const [d, m, y] = match[1].split('/');
                    lastDate = `${y}-${m}-${d}`;
                }
            }
        });
    }

    // Normalize qualification for search
    let normalizedQual = qualification;
    if (qualification.toLowerCase().includes('10')) normalizedQual += ' 10th Pass';
    if (qualification.toLowerCase().includes('12')) normalizedQual += ' 12th Pass';
    if (qualification.toLowerCase().includes('graduate') || qualification.toLowerCase().includes('degree') || qualification.toLowerCase().includes('b.a') || qualification.toLowerCase().includes('b.sc') || qualification.toLowerCase().includes('b.com')) normalizedQual += ' Graduate';
    if (qualification.toLowerCase().includes('post graduate') || qualification.toLowerCase().includes('master') || qualification.toLowerCase().includes('m.a') || qualification.toLowerCase().includes('m.sc')) normalizedQual += ' Post Graduate';

    return { qualification: normalizedQual, last_date: lastDate, vacancies };
  } catch (error) {
    console.error(`❌ Error fetching details for ${url}:`, error.message);
    return { qualification: 'Notification dekhein', last_date: null, vacancies: 'Notification dekhein' };
  }
}

async function scrapeSarkariResult() {
  try {
    console.log('🔄 Starting Sarkari Result scrape...');
    const { data } = await axios.get(SARKARI_RESULT_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(data);

    const updates = { job: [], admit_card: [], result: [] };

    // Use a more robust approach: find the "post" divs by their preceding text labels
    $('#post').each((i, el) => {
      const heading = $(el).prev('div').text().toLowerCase();
      const type = heading.includes('result') ? 'result' : 
                   heading.includes('admit card') ? 'admit_card' : 
                   heading.includes('latest jobs') ? 'job' : null;

      if (type) {
        $(el).find('ul li a').each((j, linkEl) => {
          let link = $(linkEl).attr('href');
          if (link && !link.startsWith('http')) {
            link = 'https://www.sarkariresult.com' + (link.startsWith('/') ? '' : '/') + link;
          }
          updates[type].push({ title: $(linkEl).text().trim(), link: link, type: type });
        });
      }
    });

    let newItemsCount = 0;
    const newItems = [];

    for (const type of ['job', 'admit_card', 'result']) {
      for (const item of updates[type].slice(0, 5)) { // Check top 5 to keep it fast
        const exists = await Job.findOne({ official_link: item.link });
        
        if (!exists) {
          console.log(`✨ New ${type} found: ${item.title}`);
          const details = (type === 'job') ? await fetchJobDetails(item.link) : { qualification: 'N/A', last_date: null, vacancies: 'N/A' };
          
          const org = item.title.split(' ')[0] || 'Government';
          
          let qual = details.qualification;
          // Fallback: Guess from title if detail extraction failed or returned "Notification dekhein"
          if (qual === 'Notification dekhein') {
            if (item.title.toLowerCase().includes('10')) qual = '10th Pass';
            else if (item.title.toLowerCase().includes('12')) qual = '12th Pass';
            else if (item.title.toLowerCase().includes('graduate') || item.title.toLowerCase().includes('degree')) qual = 'Graduate';
          }

          // Guess Category from title
          let category = 'Other';
          const titleLower = item.title.toLowerCase();
          if (titleLower.includes('ssc')) category = 'SSC';
          else if (titleLower.includes('upsc') || titleLower.includes('ias') || titleLower.includes('ips')) category = 'UPSC';
          else if (titleLower.includes('railway') || titleLower.includes('rrb') || titleLower.includes('rrc')) category = 'Railway';
          else if (titleLower.includes('bank') || titleLower.includes('ibps') || titleLower.includes('sbi') || titleLower.includes('rbi')) category = 'Banking';
          else if (titleLower.includes('police') || titleLower.includes('constable') || titleLower.includes('si ')) category = 'Police';
          else if (titleLower.includes('psc') || titleLower.includes('civil service')) category = 'State PSC';
          else if (titleLower.includes('teacher') || titleLower.includes('tet') || titleLower.includes('tgt') || titleLower.includes('pgt')) category = 'Teaching';
          else if (titleLower.includes('army') || titleLower.includes('navy') || titleLower.includes('airforce') || titleLower.includes('defence') || titleLower.includes('nda') || titleLower.includes('cds')) category = 'Defence';

          // Guess State from title
          let state = 'All India';
          if (titleLower.includes('up ') || titleLower.includes('uttar pradesh')) state = 'Uttar Pradesh';
          else if (titleLower.includes('bihar')) state = 'Bihar';
          else if (titleLower.includes('mp ') || titleLower.includes('madhya pradesh')) state = 'Madhya Pradesh';
          else if (titleLower.includes('rajasthan')) state = 'Rajasthan';
          else if (titleLower.includes('haryana')) state = 'Haryana';
          else if (titleLower.includes('delhi')) state = 'Delhi';
          else if (titleLower.includes('punjab')) state = 'Punjab';
          else if (titleLower.includes('jharkhand')) state = 'Jharkhand';
          else if (titleLower.includes('uk ') || titleLower.includes('uttarakhand')) state = 'Uttarakhand';
          else if (titleLower.includes('bihar')) state = 'Bihar';
          else if (titleLower.includes('chhattisgarh')) state = 'Chhattisgarh';
          else if (titleLower.includes('gujarat')) state = 'Gujarat';
          else if (titleLower.includes('maharashtra')) state = 'Maharashtra';
          else if (titleLower.includes('karnataka')) state = 'Karnataka';
          else if (titleLower.includes('kerala')) state = 'Kerala';
          else if (titleLower.includes('tamil nadu')) state = 'Tamil Nadu';
          else if (titleLower.includes('andhra pradesh')) state = 'Andhra Pradesh';
          else if (titleLower.includes('telangana')) state = 'Telangana';
          else if (titleLower.includes('odisha')) state = 'Odisha';
          else if (titleLower.includes('west bengal')) state = 'West Bengal';
          else if (titleLower.includes('assam')) state = 'Assam';

          const jobData = {
            title: item.title,
            organization: org,
            job_type: item.type,
            official_link: item.link,
            description: `Automated update from Sarkari Result: ${item.title}`,
            last_date: details.last_date,
            vacancies: details.vacancies,
            qualification: qual,
            category: category,
            state: state
          };

          const newJob = await createJob(jobData);
          newItems.push(newJob);
          newItemsCount++;
        }
      }
    }

    console.log(`✅ Scrape complete. Found ${newItemsCount} new items.`);
    return newItems;
  } catch (error) {
    console.error('❌ Error during scraping:', error.message);
    return [];
  }
}

async function fetchPaperPdfLink(url) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    const $ = cheerio.load(data);
    let pdfLink = null;
    
    // Improved PDF link detection
    $('a').each((i, el) => {
      const text = $(el).text().toLowerCase();
      const link = $(el).attr('href');
      if (!link) return;

      const isDownloadLink = text.includes('download') || text.includes('click here') || text.includes('link');
      const isPaperRelated = text.includes('paper') || text.includes('answer key') || text.includes('question') || text.includes('solution');
      
      if (isDownloadLink && isPaperRelated) {
        // If it's a direct PDF, take it
        if (link.toLowerCase().endsWith('.pdf')) {
          pdfLink = link;
          return false; // break each
        }
        // If it's a Google Drive link or similar common hosting
        if (link.includes('drive.google.com') || link.includes('mediafire.com') || link.includes('dropbox.com')) {
          pdfLink = link;
          return false;
        }
        // Save first match as fallback
        if (!pdfLink) pdfLink = link;
      }
    });
    
    // Final check for direct .pdf links in the page if not found yet
    if (!pdfLink) {
      $('a').each((i, el) => {
        const link = $(el).attr('href');
        if (link && link.toLowerCase().endsWith('.pdf')) {
          pdfLink = link;
          return false;
        }
      });
    }

    return pdfLink;
  } catch (error) {
    console.error(`❌ Error fetching paper PDF for ${url}:`, error.message);
    return null;
  }
}

async function scrapeNewPapers() {
  try {
    console.log('🔄 Starting Previous Papers scrape...');
    
    // Sites to scrape for papers
    const sources = [
      { url: 'https://www.sarkariresult.com/answerkey.php', section: 'Answer Key' },
      { url: 'https://www.sarkariresult.com/syllabus.php', section: 'Syllabus' }
    ];

    let totalNewPapers = 0;

    for (const source of sources) {
      const { data } = await axios.get(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const $ = cheerio.load(data);
      
      const paperLinks = [];

      // Sarkari Result lists are often inside #post or within a table
      $('#post ul li a, table tr td a').each((j, linkEl) => {
        let link = $(linkEl).attr('href');
        let title = $(linkEl).text().trim();
        
        if (!link || !title) return;

        // More inclusive title matching
        const isRelevant = title.toLowerCase().includes('paper') || 
                           title.toLowerCase().includes('answer key') || 
                           title.toLowerCase().includes('question paper') ||
                           title.toLowerCase().includes('syllabus');

        if (isRelevant) {
          if (!link.startsWith('http')) {
            link = 'https://www.sarkariresult.com' + (link.startsWith('/') ? '' : '/') + link;
          }
          paperLinks.push({ title, link });
        }
      });

      for (const item of paperLinks.slice(0, 10)) { // Check top 10 from each source
        const exists = await Paper.findOne({ 
          $or: [{ title: item.title }, { pdf_link: item.link }] 
        });
        
        if (!exists) {
          console.log(`✨ New Paper/Key found: ${item.title}`);
          const pdfLink = await fetchPaperPdfLink(item.link);
          
          let exam = 'Other';
          const t = item.title.toLowerCase();
          
          // Enhanced categorization
          if (t.includes('ssc')) exam = 'SSC';
          else if (t.includes('upsc') || t.includes('civil service') || t.includes('ias') || t.includes('ips')) exam = 'UPSC';
          else if (t.includes('railway') || t.includes('rrb') || t.includes('rrc') || t.includes('ntpc') || t.includes('alp')) exam = 'Railway';
          else if (t.includes('bank') || t.includes('ibps') || t.includes('sbi') || t.includes('rbi') || t.includes('po ') || t.includes('clerk')) exam = 'Banking';
          else if (t.includes('police') || t.includes('constable') || t.includes('si ') || t.includes('daroga')) exam = 'Police';
          else if (t.includes('psc')) exam = 'State PSC';
          else if (t.includes('teacher') || t.includes('tet') || t.includes('tgt') || t.includes('pgt') || t.includes('bed')) exam = 'Teaching';
          else if (t.includes('army') || t.includes('navy') || t.includes('airforce') || t.includes('defence') || t.includes('nda') || t.includes('cds')) exam = 'Defence';

          // Extract year from title if possible, otherwise use current year
          const yearMatch = item.title.match(/20\d{2}/);
          const year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();

          const paperData = {
            exam: exam,
            title: item.title,
            year: year,
            pdf_link: pdfLink || item.link // Fallback to page link if direct pdf not found
          };

          await createPaper(paperData);
          totalNewPapers++;
        }
      }
    }

    if (totalNewPapers > 0) {
      console.log(`✅ Paper scrape complete. Found ${totalNewPapers} new items across all sources.`);
    }
    return totalNewPapers;
  } catch (error) {
    console.error('❌ Error during papers scraping:', error.message);
    return 0;
  }
}

module.exports = { scrapeSarkariResult, scrapeNewPapers };
