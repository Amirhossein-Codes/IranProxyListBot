const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const fileUrl = "https://raw.githubusercontent.com/SoliSpirit/mtproto/master/all_proxies.txt";

async function sendProxies(chatId) {
    try {
        const response = await fetch(fileUrl);

        if (!response.ok) {
            throw new Error("Failed to fetch file");
        }

        const proxies = await response.text();
        const maxLength = 4000;

        for (let i = 0; i < proxies.length; i += maxLength) {
            const chunk = proxies.slice(i, i + maxLength);
            await bot.sendMessage(chatId, chunk);
        }

    } catch (error) {
        await bot.sendMessage(chatId, "خطا در دریافت پروکسی‌ها ❌");
        console.error(error.message);
    }
}

/* -----------------------------
   ارسال خودکار هر 30 دقیقه
------------------------------ */

function startAutoSend(chatId) {
    async function loop() {
        await sendProxies(chatId);
        setTimeout(loop, 30 * 60 * 1000); // نیم ساعت
    }
    loop();
}

/* -----------------------------
   وقتی /start میاد
------------------------------ */

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;

    await bot.sendMessage(chatId, "ربات پروکسی فعال شد ✅", {
        reply_markup: {
            keyboard: [
                [{ text: "📡 پروکسی" }]
            ],
            resize_keyboard: true
        }
    });

    // شروع ارسال خودکار
    startAutoSend(chatId);

    // همون اول هم بفرسته
    sendProxies(chatId);
});

/* -----------------------------
   وقتی دکمه زده میشه
------------------------------ */

bot.on("message", (msg) => {
    if (msg.text === "📡 پروکسی") {
        sendProxies(msg.chat.id);
    }
});
