const express = require("express");
const bot = require("./app/bot");
//start bot

const port = 8080;
// Set telegram webhook
//bot.telegram.setWebhook("https://e80670db.ngrok.io/bot-mangakun");

const app = express();
app.get("/", (req, res) => res.send("Hello World!"));
app.use(bot.webhookCallback("/bot-mangakun"));
app.listen(port, () => {
    console.log("Example app listening on port 3000!");
});