const { Telegraf } = require('telegraf');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const bot = new Telegraf(process.env.BOT_TOKEN);
const verificationCodes = {}; // Xotirada kodlarni saqlash

// 1. Botga /start bosilganda (Deep Linking orqali)
bot.start((ctx) => {
  // URL'dan kelgan start parametridagi ID (uuid) ni olamiz
  // Agar parametr bo'lmasa, foydalanuvchining Telegram ID-sini olamiz
  const userId = (ctx.startPayload || ctx.from.id).toString(); 
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Kodni saqlashda ID ni string ko'rinishida saqlaymiz
  verificationCodes[userId] = code;

  console.log(`✅ Kod yaratildi: ID = ${userId}, CODE = ${code}`);

  ctx.reply(`Salom ${ctx.from.first_name}! 👋\nSizning tasdiqlash kodingiz:\n\n👉 ${code} 👈\n\nUshbu kodni saytga kiriting.`);
});

// 2. React-dan keladigan POST so'rovi
app.post('/verify-code', (req, res) => {
  // Kelgan user_id ni string ko'rinishiga o'tkazamiz
  const user_id = String(req.body.user_id);
  const code = String(req.body.code);

  console.log(`🔍 Tekshiruv: ID = ${user_id}, Kod = ${code}`);

  if (verificationCodes[user_id] && verificationCodes[user_id] === code) {
    // Muvaffaqiyatli: Kodni xotiradan o'chiramiz
    delete verificationCodes[user_id];
    console.log(`✅ Tasdiqlandi: ${user_id}`);
    return res.json({ valid: true });
  }

  // Xatolik: Logda bazadagi kodni ko'rsatamiz (debug uchun)
  console.log(`❌ Xatolik! Bazadagi kod: ${verificationCodes[user_id]}`);
  return res.status(400).json({ 
    valid: false, 
    message: "Kod noto'g'ri yoki sessiya muddati o'tgan!" 
  });
});

app.get('/', (req, res) => {
  res.send('Workify Bot Server is Running... 🚀');
});

bot.launch();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT}-portda ishlamoqda...`);
});