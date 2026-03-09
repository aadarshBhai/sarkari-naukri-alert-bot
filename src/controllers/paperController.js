const { getPapersByExam } = require('../services/paperService');
const { Markup } = require('telegraf');

async function handlePreviousPapers(ctx) {
  try {
    await ctx.reply(
      "📚 Select the exam to view previous year papers:",
      Markup.inlineKeyboard([
        [Markup.button.callback("SSC", "papers_ssc")],
        [Markup.button.callback("UPSC", "papers_upsc")],
        [Markup.button.callback("Railway", "papers_railway")],
        [Markup.button.callback("Banking", "papers_banking")],
        [Markup.button.callback("Police", "papers_police")]
      ])
    );
  } catch (error) {
    console.error('Error in handlePreviousPapers:', error);
    await ctx.reply('⚠️ Error loading previous year papers.');
  }
}

async function handlePapersByExam(ctx, exam) {
  try {
    const papers = await getPapersByExam(exam);

    if (!papers || papers.length === 0) {
      return ctx.reply(`❌ No ${exam.toUpperCase()} previous papers available yet.`, 
        Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back', 'previous_papers')]])
      );
    }

    await ctx.reply(`📄 **${exam.toUpperCase()} Previous Year Papers**`, { parse_mode: 'Markdown' });

    for (const paper of papers) {
      // Check if it's a direct PDF
      const isDirectPdf = paper.pdf_link && paper.pdf_link.toLowerCase().endsWith('.pdf');

      if (isDirectPdf) {
        try {
          await ctx.replyWithDocument(paper.pdf_link, { 
            caption: `📄 ${paper.title}\nYear: ${paper.year || 'N/A'}` 
          });
          continue; // Move to next paper
        } catch (docError) {
          console.error('Error sending document:', docError);
          // Fallback to text if document send fails
        }
      }

      // Format requested in the prompt
      const message = `📄 ${paper.title}\n` +
        `Year: ${paper.year || 'N/A'}\n\n` +
        `Download PDF:\n${paper.pdf_link}`;

      await ctx.reply(message);
    }
  } catch (error) {
    console.error(`Error in handlePapersByExam for ${exam}:`, error);
    await ctx.reply('⚠️ Error fetching papers.');
  }
}

module.exports = {
  handlePreviousPapers,
  handlePapersByExam
};
