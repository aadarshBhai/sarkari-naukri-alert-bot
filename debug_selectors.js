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
    
    console.log('--- Selector Test ---');
    console.log('Results (Box1 Col1):', $('div#box1 table td:nth-child(1) div#post ul li a').length);
    console.log('Admit Cards (Box2 Col1):', $('div#box2 table td:nth-child(1) div#post ul li a').length);
    console.log('Latest Jobs (Box1 Col3):', $('div#box1 table td:nth-child(3) div#post ul li a').length);
    
    console.log('\n--- Alternative Check ---');
    console.log('All links inside #post:', $('#post a').length);
    console.log('All links inside ul > li:', $('ul li a').length);
    
    if ($('div#box1 table td:nth-child(1) div#post ul li a').length === 0) {
        console.log('\n--- Debugging Structure ---');
        console.log('Checking for any div with id post:', $('div#post').length);
        $('div#post').slice(0, 3).each((i, el) => {
            console.log(`Post div ${i} parent text (first 50 chars):`, $(el).parent().text().trim().substring(0, 50));
        });
    }

  } catch (e) {
    console.error('Error:', e.message);
  }
}

testSelectors();
