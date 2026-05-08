const https = require('https'); // Добавь это в самый верх файла
const { Telegraf } = require('telegraf');
const axios = require('axios');
const qs = require('qs');

const bot = new Telegraf(process.env.BOT_TOKEN_GIGA);

async function getGigaToken() {
    const data = qs.stringify({ 'scope': 'GIGACHAT_API_PERS' });
    const config = {
        method: 'post',
        url: 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Authorization': `Basic ${process.env.GIGACHAT_CREDENTIALS}`,
            'RqUID': '6f0b1294-703d-4a14-831e-1516b03901fb'
        },
        data: data,
        // Добавляем игнорирование сертификатов (важно для работы со Сбером из-за рубежа)
        httpsAgent: new https.Agent({ rejectUnauthorized: false }) 
    };
    const res = await axios(config);
    return res.data.access_token;
}

bot.start((ctx) => ctx.reply("Привет! Пришли мне название товара или объекта и пару характеристик, а я сделаю описание для Маркетплейса или сайта."));

bot.on('text', async (ctx) => {
    const msg = await ctx.reply("🔄 GigaChat генерирует описание...");
    try {
        const token = await getGigaToken();
        const response = await axios.post('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', {
    model: 'GigaChat',
            messages: [{ 
                role: 'system', 
                content: 'Ты эксперт по маркетплейсам. Напиши структурированный, продающий текст для товара или недвижимости. Используй буллиты и призыв к действию.' 
            }, { 
                role: 'user', 
                content: ctx.message.text 
            }]
        }, { headers: { 'Authorization': `Bearer ${token}` },
    httpsAgent: new https.Agent({ rejectUnauthorized: false }) // И здесь тоже
});
        await ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, null, response.data.choices[0].message.content);
    } catch (e) {
        await ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, null, "Ошибка генерации. Попробуйте повторить запрос с другими данными.");
    }
});

module.exports = async (req, res) => {
    await bot.handleUpdate(req.body);
    res.status(200).send('OK');
};
