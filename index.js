const express = require("express");
const app = express();
const axios = require("axios");
const path = require("path");
const port = process.env.PORT || 3000;
app.use(express.static("static"));
app.use(express.json());
require("dotenv").config();

const { Telegraf } = require("telegraf");
const { Configuration, OpenAIApi } = require("openai");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

//OPEN AI init
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function runCompletion(content) {
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content }],
  });
  return completion.data.choices[0].message.content;
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});

bot.command("start", (ctx) => {
  bot.telegram.sendMessage(ctx.chat.id, `Hello ${ctx.chat.first_name}, How can I assist you today?`, {});
});

bot.on("text", async (ctx) => {
  await ctx.sendChatAction("typing");
  ctx.reply(await runCompletion(ctx.message?.text));
});

bot.launch();
