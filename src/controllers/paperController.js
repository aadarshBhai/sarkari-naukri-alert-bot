const { getPapersByExam, getPapersByExamAndYear, normalizeLink } = require('../services/paperService');
const { Markup } = require('telegraf');

async function handlePreviousPapers(ctx) {
  try {
    const text = "📚 Select the exam to view previous year papers:";
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback("SSC", "papers_ssc")],
      [Markup.button.callback("UPSC", "papers_upsc")],
      [Markup.button.callback("Railway", "papers_railway")],
      [Markup.button.callback("Banking", "papers_banking")],
      [Markup.button.callback("Police", "papers_police")]
    ]);

    if (ctx.callbackQuery) {
      await ctx.editMessageText(text, keyboard);
    } else {
      await ctx.reply(text, keyboard);
    }
  } catch (error) {
    console.error('Error in handlePreviousPapers:', error);
    await ctx.reply('⚠️ Error loading previous year papers.');
  }
}

async function handlePapersByExam(ctx, exam) {
  try {
    // Instead of showing all papers, show year options
    const text = `📅 Select the year for **${exam.toUpperCase()}** papers:`;
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback("2024", `papers_${exam.toLowerCase()}_2024`),
        Markup.button.callback("2025", `papers_${exam.toLowerCase()}_2025`)
      ],
      [
        Markup.button.callback("2026", `papers_${exam.toLowerCase()}_2026`),
        Markup.button.callback("All Years", `papers_${exam.toLowerCase()}_all`)
      ],
      [Markup.button.callback("⬅️ Back to Exams", "previous_papers")]
    ]);

    if (ctx.callbackQuery) {
      await ctx.editMessageText(text, { parse_mode: 'Markdown', ...keyboard });
    } else {
      await ctx.reply(text, { parse_mode: 'Markdown', ...keyboard });
    }
  } catch (error) {
    console.error(`Error in handlePapersByExam for ${exam}:`, error);
    await ctx.reply('⚠️ Error fetching years.');
  }
}

async function handlePapersByYear(ctx, exam, year) {
  try {
    const papers = (year === 'all') 
      ? await getPapersByExam(exam) 
      : await getPapersByExamAndYear(exam, year);

    if (!papers || papers.length === 0) {
      const msg = (year === 'all') 
        ? `❌ No ${exam.toUpperCase()} papers available yet.` 
        : `❌ No ${exam.toUpperCase()} papers available for ${year} yet.`;
      
      return ctx.reply(msg, 
        Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back', `papers_${exam.toLowerCase()}`)]])
      );
    }

    const yearLabel = (year === 'all') ? '' : ` ${year}`;
    await ctx.reply(`📄 **${exam.toUpperCase()}${yearLabel} Previous Year Papers**`, { parse_mode: 'Markdown' });

    const sentLinks = new Set();

    for (const paper of papers) {
      // Normalize link for strict comparison
      const normalizedLink = normalizeLink(paper.pdf_link);
      
      if (sentLinks.has(normalizedLink)) {
        continue; // Skip if this normalized PDF link has already been sent
      }

      // Check if it's a direct PDF
      const isDirectPdf = paper.pdf_link && paper.pdf_link.toLowerCase().endsWith('.pdf');

      if (isDirectPdf) {
        try {
          await ctx.replyWithDocument(paper.pdf_link, { 
            caption: `📄 ${paper.title}\nYear: ${paper.year || 'N/A'}` 
          });
          sentLinks.add(normalizedLink); // Mark normalized link as sent
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
      sentLinks.add(normalizedLink); // Mark normalized link as sent
    }
  } catch (error) {
    console.error(`Error in handlePapersByYear for ${exam} ${year}:`, error);
    await ctx.reply('⚠️ Error fetching papers.');
  }
}

module.exports = {
  handlePreviousPapers,
  handlePapersByExam,
  handlePapersByYear
};
