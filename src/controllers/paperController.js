const { getAllPapers } = require('../services/paperService');

async function handlePreviousPapers(ctx) {
  try {
    const papers = await getAllPapers();

    if (!papers || papers.length === 0) {
      return ctx.reply('❌ No previous year papers available yet.');
    }

    await ctx.reply('📄 **Previous Year Question Papers**\n\n👇 Niche diye gaye papers download karein:', { parse_mode: 'Markdown' });

    for (const paper of papers) {
      const message = `📄 *${paper.title}*\n` +
        `Exam: ${paper.exam}\n` +
        `Year: ${paper.year || 'N/A'}\n\n` +
        `🔗 [Download PDF](${paper.pdf_link})`;

      // Optional: If it's a direct PDF link, we could try sendDocument, 
      // but usually external links might fail or be slow. 
      // The requirement says: If direct link, send it as a document.
      // We'll check if the link ends with .pdf
      if (paper.pdf_link && paper.pdf_link.toLowerCase().endsWith('.pdf')) {
        try {
          await ctx.replyWithDocument(paper.pdf_link, { caption: `📄 ${paper.title} (${paper.year})` });
        } catch (docError) {
          // If sending as document fails (e.g. file too large or invalid URL for Telegram), fallback to text link
          await ctx.reply(message, { parse_mode: 'Markdown' });
        }
      } else {
        await ctx.reply(message, { parse_mode: 'Markdown' });
      }
    }
  } catch (error) {
    console.error('Error in handlePreviousPapers:', error);
    ctx.reply('⚠️ Error loading previous year papers.');
  }
}

module.exports = {
  handlePreviousPapers
};
