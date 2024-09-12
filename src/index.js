require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const env = process.env;
const isProduction = env?.NODE_ENV === "production";
const token = env?.BOT_TOKEN;
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(token, { polling: true });

app.use(express.json());
app.use(cors());

bot.on("message", (ctx) => {
  const chatId = ctx.chat.id;
  const text = ctx.text;
  const user = ctx.from;
  if (text === "/start") {
    bot.sendMessage(chatId, "hello");
  }
  bot.getChatAdministrators(chatId).then((admins) => {
    const isAdmin = admins.some((u) => u.user.id == user.id);
    if (!isAdmin) {
      if (ctx?.entities) {
        for (const entity of ctx?.entities) {
          if (entity.type === "url") {
            const messageId = ctx.message_id;
            const username = ctx.from.username;
            // const response = username
            //   ? `Please do not share links in this group!`
            //   : `<a href="tg://user?id=${user.id}">${user.first_name}</a> Please do not share links in this group!`;
            const response = `<a href="tg://user?id=${user.id}">${user.first_name}</a> Please do not share links in this group!`;
            bot.sendChatAction(chatId, "typing");
            bot.deleteMessage(chatId, messageId);
            bot.sendMessage(chatId, response, {
              entities: [
                { type: "text_mention", offset: 0, length: response.length, user },
              ],
              parse_mode: "HTML",
            });
          }
        }
      }
    }
  });
});

app.listen(env?.PORT, () => console.log(`${env?.PORT}th port's online...`));
