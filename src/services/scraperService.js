const axios = require('axios');
const cheerio = require('cheerio');
const { Job } = require('../database/models');
const { createJob } = require('./jobService');

const SARKARI_RESULT_URL = 'https://www.sarkariresult.com/';

async function scrapeSarkariResult() {
  try {
    console.log('🔄 Starting Sarkari Result scrape...');
    const { data } = await axios.get(SARKARI_RESULT_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(data);

    const updates = {
      job: [],
      admit_card: [],
      result: []
    };

    // Scrape Results (Box1, Col1)
    $('div#box1 table td:nth-child(1) div#post ul li a').each((i, el) => {
      let link = $(el).attr('href');
      if (link && !link.startsWith('http')) link = 'https://www.sarkariresult.com' + (link.startsWith('/') ? '' : '/') + link;
      updates.result.push({
        title: $(el).text().trim(),
        link: link,
        type: 'result'
      });
    });

    // Scrape Admit Cards (Box2, Col1)
    $('div#box2 table td:nth-child(1) div#post ul li a').each((i, el) => {
      let link = $(el).attr('href');
      if (link && !link.startsWith('http')) link = 'https://www.sarkariresult.com' + (link.startsWith('/') ? '' : '/') + link;
      updates.admit_card.push({
        title: $(el).text().trim(),
        link: link,
        type: 'admit_card'
      });
    });

    // Scrape Latest Jobs (Box1, Col3)
    $('div#box1 table td:nth-child(3) div#post ul li a').each((i, el) => {
      let link = $(el).attr('href');
      if (link && !link.startsWith('http')) link = 'https://www.sarkariresult.com' + (link.startsWith('/') ? '' : '/') + link;
      updates.job.push({
        title: $(el).text().trim(),
        link: link,
        type: 'job'
      });
    });

    let newItemsCount = 0;
    const newItems = [];

    for (const type of ['job', 'admit_card', 'result']) {
      for (const item of updates[type].slice(0, 10)) { // Only check top 10 for each
        const exists = await Job.findOne({ official_link: item.link });
        
        if (!exists) {
          // Extract organization (rough guess: first word)
          const org = item.title.split(' ')[0] || 'Government';
          
          const jobData = {
            title: item.title,
            organization: org,
            job_type: item.type,
            official_link: item.link,
            description: `Automated update from Sarkari Result: ${item.title}`,
            last_date: null,
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
