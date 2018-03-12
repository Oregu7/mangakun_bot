const config = require("config");
const Telegraf = require("telegraf");
const { fork } = require("child_process");
const controllers = require("./controllers");

const token = config.get("bot.token");
const localSession = config.get("localSession");
const bot = new Telegraf(token);

// middlewares
bot.use(localSession.middleware());
// commands
bot.start(controllers.startController);
bot.command("search", controllers.searchController);
bot.command("addmanga", controllers.addMangaCommandController);
bot.command("mymanga", controllers.mymangaController);
bot.command("test", controllers.getChaptersController);
// patterns
bot.hears(/(http:\/\/)?(www\.)?readmanga\.me\/(\w+)\/?.*/i, controllers.addMangaController);
// events
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

const childProcess = fork(`${__dirname}/utills/mangaUpdatesListener.js`);
childProcess.on("message", (data) => {
    for (let item of data) {
        let { message, users } = item;
        bot.telegram.sendMessage(users[0], message, Telegraf.Extra.HTML().webPreview(false));
    }
});

module.exports = bot;