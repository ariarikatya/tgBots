const { google } = require('googleapis');
const { Telegraf, Scenes, session } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Настройка Google Sheets
const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CONFIG), // Весь JSON ключа в одну строку в ENV
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

bot.command('start', (ctx) => ctx.reply('Оставьте заявку на подбор квартиры. Как вас зовут?'));

bot.on('text', async (ctx) => {
    const sheets = google.sheets({ version: 'v4', auth });
    const data = [[ctx.message.from.id, ctx.message.from.username, ctx.message.text, new Date().toISOString()]];
    
    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.SHEET_ID,
            range: 'Sheet1!A:D',
            valueInputOption: 'RAW',
            requestBody: { values: data },
        });
        ctx.reply('Данные сохранены в таблицу!');
    } catch (e) {
        ctx.reply('Ошибка сохранения');
    }
});

module.exports = async (req, res) => {
    await bot.handleUpdate(req.body);
    res.status(200).send('OK');
};
