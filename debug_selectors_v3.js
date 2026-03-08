const axios = require('axios');
const cheerio = require('cheerio');

async function testSelectors() {
  try {
    const { data } = await axios.get('https://www.sarkariresult.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(data);
    
    console.log('--- Ultimate Scraper Debug ---');
    
    // Find all #post buckets and their context
    $('#post').each((i, el) => {
        const links = $(el).find('ul li a');
        let headingText = "Unknown";
        
        // Try to find a header div before it
        const header = $(el).prev('div');
        if (header.length) headingText = header.text().trim();
        
        console.log(`Bucket ${i}: [${headingText}] - Links: ${links.length}`);
        if (links.length > 0) {
            console.log(`  Example link: ${$(links.first()).text().trim()}`);
        }
    });

  } catch (e) {
    console.error('Error:', e.message);
  }
}

testSelectors();
