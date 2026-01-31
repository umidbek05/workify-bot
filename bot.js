require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { Pool } = require("pg");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Railway uchun eng muhim qator shu!
  },
});

// Xatoliklarni ushlab qolish uchun
pool.on("error", (err) => {
  console.error("Baza bilan kutilmagan xatolik:", err);
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text || "";

  // Foydalanuvchi /start 12345 yoki shunchaki /start deb yozganini tekshiramiz
  if (text.startsWith("/start")) {
    try {
      // 1. Foydalanuvchini bazaga yozish
      await pool.query(
        "INSERT INTO telegram_users (user_id, chat_id) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET chat_id = $2",
        [userId, chatId]
      );

      // 2. Kod yaratish
      const code = Math.floor(100000 + Math.random() * 900000);
      const expiresAt = new Date(Date.now() + 10 * 60000);

      await pool.query(
        "INSERT INTO codes (user_id, code, expires_at) VALUES ($1, $2, $3)",
        [userId, code, expiresAt]
      );

      // 3. Telegramga xabar yuborish
      await bot.sendMessage(
        chatId,
        `Sizning tasdiqlash kodingiz: ${code}\nBu kod 10 daqiqa davomida amal qiladi. ✅`
      );
      console.log(`Kod yuborildi: ${userId} -> ${code}`);
    } catch (err) {
      console.error("Baza bilan xatolik:", err);
      bot.sendMessage(chatId, "Baza bilan bog'lanishda xatolik yuz berdi. ❌");
    }
  }
});

console.log("Bot muvaffaqiyatli ishga tushdi...");
