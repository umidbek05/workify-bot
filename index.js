const { Telegraf } = require('telegraf');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Bot tokenini bu yerga qo'ying yoki .env faylga
const bot = new Telegraf(process.env.BOT_TOKEN);

// Vaqtinchalik kodlarni saqlash uchun (Xotirada)
const verificationCodes = {};

// 1. Botga /start bosilganda
bot.start((ctx) => {
  const userId = ctx.from.id; // Telegram User ID
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 xonali kod

  verificationCodes[userId] = code; // Kodni saqlaymiz

  ctx.reply(`Salom ${ctx.from.first_name}! 👋`);
  ctx.reply(`Sizning tasdiqlash kodingiz:`);
  ctx.reply(`👉 ${code} 👈`);
  ctx.reply(`Ushbu kodni saytga kiriting.`);
});

// 2. React-dan kodni tekshirish uchun API
app.post('/verify-code', (req, res) => {
  const { user_id, code } = req.body;

  if (verificationCodes[user_id] && verificationCodes[user_id] === code) {
    // Kod to'g'ri bo'lsa, uni o'chirib yuboramiz (bir martalik)
    delete verificationCodes[user_id];
    return res.json({ valid: true });
  }

  return res.json({ valid: false, message: "Kod noto'g'ri yoki eskirgan" });
});

// Botni ishga tushirish
bot.launch();

// Serverni Railway uchun portga sozlash
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server port ${PORT} da ishlamoqda...`);
});