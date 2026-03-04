const { Telegraf } = require("telegraf");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const bot = new Telegraf(process.env.BOT_TOKEN);
const verificationCodes = {}; // Xotirada kodlarni saqlash

// 1. Botga /start bosilganda
bot.start((ctx) => {
  // XATO TUZATILDI: "ct x" joyidagi bo'shliq olib tashlandi
  const userId = (ctx.startPayload || ctx.from.id).toString();
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Kodni saqlash
  verificationCodes[userId] = code;

  console.log(`✅ Kod yaratildi: ID = ${userId}, CODE = ${code}`);

  ctx.reply(
    `Salom ${ctx.from.first_name}! 👋\nSizning tasdiqlash kodingiz:\n\n👉 ${code} 👈\n\nUshbu kodni saytga kiriting.`
  );
});

// 2. React-dan keladigan POST so'rovi
app.post("/verify-code", (req, res) => {
  const user_id = String(req.body.user_id);
  const code = String(req.body.code);

  console.log(`🔍 Tekshiruv: ID = ${user_id}, Kod = ${code}`);

  if (verificationCodes[user_id] && verificationCodes[user_id] === code) {
    // Muvaffaqiyatli: Kodni xotiradan o'chiramiz
    delete verificationCodes[user_id];
    console.log(`✅ Tasdiqlandi: ${user_id}`);
    return res.json({ valid: true });
  }

  // Xatolik
  console.log(`❌ Xatolik! Bazadagi kod: ${verificationCodes[user_id]}`);
  return res.status(400).json({
    valid: false,
    message: "Kod noto'g'ri yoki sessiya muddati o'tgan!",
  });
});

app.get("/", (req, res) => {
  res.send("Workify Bot Server is Running... 🚀");
});

// Botni ishga tushirish
bot
  .launch()
  .then(() => console.log("🤖 Bot ishga tushdi..."))
  .catch((err) => console.error("❌ Botni ishga tushirishda xatolik:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT}-portda ishlamoqda...`);
});

// Serverni to'g'ri to'xtatish (xotira xatolarini oldini olish uchun)
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
