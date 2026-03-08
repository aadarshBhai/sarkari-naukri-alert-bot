const axios = require('axios');
const cheerio = require('cheerio');
const { Job } = require('../database/models');
const { createJob } = require('./jobService');

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

          const jobData = {
            title: item.title,
            organization: org,
            job_type: item.type,
            official_link: item.link,
            description: `Automated update from Sarkari Result: ${item.title}`,
            last_date: details.last_date,
            vacancies: details.vacancies,
            qualification: qual,
            category: 'Other',
            state: 'All India'
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

module.exports = { scrapeSarkariResult };
