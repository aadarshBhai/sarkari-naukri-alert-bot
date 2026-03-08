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
    
    console.log('--- Structure Analysis ---');
    
    const boxes = $('div[id^="box"]');
    console.log(`Found ${boxes.length} divs starting with "box"`);
    
    boxes.each((i, box) => {
        const boxId = $(box).attr('id');
        const headings = $(box).find('div').filter((_, el) => {
            const text = $(el).text().toLowerCase();
            return text.includes('result') || text.includes('admit card') || text.includes('job');
        });
        
        console.log(`\nBox ID: ${boxId}`);
        headings.each((j, h) => {
            console.log(`  Heading found: "${$(h).text().trim()}"`);
            const links = $(h).nextAll('div#post').first().find('ul li a');
            console.log(`    Links found via nextAll div#post: ${links.length}`);
            
            if (links.length === 0) {
               const siblingLinks = $(h).siblings('div#post').find('ul li a');
               console.log(`    Links found via siblings div#post: ${siblingLinks.length}`);
            }
        });
    });

  } catch (e) {
    console.error('Error:', e.message);
  }
}

testSelectors();
