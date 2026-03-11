const { google } = require('googleapis');
require('dotenv').config();

const sheets = google.sheets('v4');
const SPREADSHEET_ID = '1Em8KrPlecgAmAf6BYbOfp7f0yjQnTaDdCT_e-JetY60';
const API_KEY = 'AIzaSyBiJBDDfMiDXFFTWwSAcnXCcObAmatcjPk';

async function inspectSheet() {
  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      key: API_KEY
    });

    console.log('Sheets found:', spreadsheet.data.sheets.map(s => s.properties.title));

    for (const sheet of spreadsheet.data.sheets) {
      const title = sheet.properties.title;
      console.log(`\n--- Inspecting ${title} ---`);
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${title}!A1:M2`, // Fetch first 2 rows and 13 columns
        key: API_KEY
      });

      const rows = response.data.values || [];
      if (rows.length > 0) {
        console.log('Headers (Row 1):', rows[0]);
        if (rows.length > 1) {
          console.log('Data Example (Row 2):', rows[1]);
        }
      } else {
        console.log('Sheet is empty.');
      }
    }
  } catch (error) {
    console.error('Error inspecting sheet:', error.message);
  }
}

inspectSheet();
