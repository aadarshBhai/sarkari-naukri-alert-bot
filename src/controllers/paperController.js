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
        [Markup.button.callback("Police", "papers_police")],
        [Markup.button.callback('🏠 Main Menu', 'main_menu')]
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
      const message = `📄 *${paper.title}*\n` +
        `Exam: ${paper.exam}\n` +
        `Year: ${paper.year || 'N/A'}\n\n` +
        `🔗 [Download PDF](${paper.pdf_link})`;

      if (paper.pdf_link && paper.pdf_link.toLowerCase().endsWith('.pdf')) {
        try {
          await ctx.replyWithDocument(paper.pdf_link, { caption: `📄 ${paper.title} (${paper.year || 'N/A'})` });
        } catch (docError) {
          await ctx.reply(message, { parse_mode: 'Markdown' });
        }
      } else {
        await ctx.reply(message, { parse_mode: 'Markdown' });
      }
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
