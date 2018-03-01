const config = require("config");
const Telegraf = require("telegraf");
const controllers = require("./controllers");

const token = config.get("bot.token");
const bot = new Telegraf(token);

bot.start(controllers.startController);
bot.command("search", controllers.searchController);
bot.command("addmanga", controllers.addMangaCommandController);
bot.command("test", controllers.getChaptersController);

bot.hears(/(http:\/\/)?(www\.)?readmanga\.me\/(\w+)\/?.*/i, controllers.addMangaController);

bot.on("inline_query", controllers.inlineQueryController);
bot.on("callback_query", controllers.callbackController);
bot.on("text", (ctx) => {
    const { entities: isInline = false } = ctx.message;
    if (!isInline) return ctx.reply("Hai !"); // controllers.startController(ctx);
    // console.log(ctx.message);
});
bot.catch((err) => {
    console.error(err);
});

module.exports = bot;