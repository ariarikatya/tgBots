const { Telegraf } = require('telegraf');
const OpenAI = require('openai');

const bot = new Telegraf(process.env.BOT_TOKEN);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

bot.on('text', async (ctx) => {
    const userText = ctx.message.text;
    
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "Ты помощник риелтора. Сделай из хаотичного описания структурированное объявление для маркетплейса с заголовком, списком плюсов и ценой." },
                { role: "user", content: userText }
            ],
        });
        
        ctx.reply(response.choices[0].message.content);
    } catch (e) {
        ctx.reply("Ошибка ИИ: " + e.message);
    }
});

module.exports = async (req, res) => {
    await bot.handleUpdate(req.body);
    res.status(200).send('OK');
};
