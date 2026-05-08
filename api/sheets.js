const { Telegraf } = require('telegraf');
const { google } = require('googleapis');

const bot = new Telegraf(process.env.BOT_TOKEN_SHEETS);

const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CONFIG),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

bot.start((ctx) => ctx.reply("Добрый день! Вас приветствует компания Agro Lead. Для регистрации заявки в систему, пожалуйста, напишите ваше имя и контактный телефон в удобном для вас формате."));

bot.on('text', async (ctx) => {
    const sheets = google.sheets({ version: 'v4', auth });
    const row = [new Date().toLocaleString(), ctx.message.from.id, ctx.message.from.username || 'N/A', ctx.message.text];

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.SHEET_ID,
            range: 'Sheet1!A:D',
            valueInputOption: 'RAW',
            requestBody: { values: [row] },
        });
        ctx.reply("✅ Ваша заявка зафиксирована! Менеджер свяжется с вами в течении часа.");
    } catch (e) {
        ctx.reply("❌ Ошибка записи. Попробуйте ещё раз.");
    }
});

module.exports = async (req, res) => {
    await bot.handleUpdate(req.body);
    res.status(200).send('OK');
};
