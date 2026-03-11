const { google } = require('googleapis');
require('dotenv').config();

const sheets = google.sheets('v4');
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const API_KEY = process.env.GOOGLE_API_KEY;

/**
 * Fetch data from a Google Sheet range.
 * @param {string} range - The range to fetch (e.g., 'Sheet1!A2:D').
 * @returns {Promise<Array[]>} - The data from the sheet.
 */
async function getSheetData(range) {
  if (SPREADSHEET_ID === 'YOUR_SHEET_ID_HERE' || !API_KEY || API_KEY === 'YOUR_GOOGLE_API_KEY_HERE') {
    console.warn('⚠️ Google Sheets API configuration is incomplete. Please set GOOGLE_SHEET_ID and GOOGLE_API_KEY in .env.');
    return [];
  }

  try {
    console.log(`📡 Fetching from Google Sheet: ${range}`);
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
      key: API_KEY, // Using API Key for public sheets
    });

    const values = response.data.values || [];
    console.log(`✅ Fetched ${values.length} rows from ${range}`);
    return values;
  } catch (error) {
    console.error(`❌ Error fetching data from range ${range}:`, error.message);
    return [];
  }
}

module.exports = {
  getSheetData
};
