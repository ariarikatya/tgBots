const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

// В реальности здесь был бы запрос к БД (например, Supabase)
// Находим тех, кому пора отправить уведомление
const mockUsersToRemind = [12345678]; // ID вашего чата для теста

module.exports = async (req, res) => {
    // Проверка секретного ключа Vercel, чтобы кто попало не дергал наш Cron
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).end();
    }

    try {
        for (const chatId of mockUsersToRemind) {
            await bot.telegram.sendMessage(chatId, "🔔 Напоминание: пора проверить новые объекты на маркетплейсе!");
        }
        res.status(200).json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
