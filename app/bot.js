const config = require("config");
const Telegraf = require("telegraf");
const controllers = require("./controllers");

const token = config.get("bot.token");
const bot = new Telegraf(token);

bot.start(controllers.startController);
bot.command("search", controllers.searchController);
bot.command("addmanga", controllers.addMangaCommandController);
bot.hears(/(http:\/\/)?(www\.)?readmanga\.me\/(\w+)\/?.*/i, controllers.addMangaController);
bot.on("inline_query", controllers.inlineQueryController);

bot.catch((err) => {
    console.error(err);
});

module.exports = bot;