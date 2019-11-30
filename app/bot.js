const config = require("config");
const Telegraf = require("telegraf");
const { fork } = require("child_process");
const controllers = require("./controllers");
const middlewares = require("./middlewares");
const { localSession } = require("./utils");

const token = config.get("bot.token");
const bot = new Telegraf(token);
const sendUpdates = require("./scripts/sendUpdates")(bot);
// middlewares
bot.use(localSession.middleware());
bot.hears(/^[A-z0-9]{33}$/, controllers.tokenController.authorizeByToken);
// bot.use(middlewares.allowedUsersMiddleware());
// commands
bot.start(controllers.startController);
bot.command("search", controllers.searchController);
bot.command("add", controllers.addMangaCommandController);
bot.command("manga", controllers.mymangaController);
bot.command("feedback", controllers.feedbackController);
bot.command("rate", controllers.rateController);
bot.command("help", controllers.helpController);
bot.command("genres", controllers.genresController);
bot.command("token", controllers.tokenController.generateToken);
// patterns
bot.hears(/(http:\/\/)?(www\.)?(readmanga\.me|mintmanga\.com|selfmanga\.ru)\/(\w+)\/?.*/i, controllers.addMangaController);
bot.hears(/\/manga(\d+)/i, controllers.mangaInfoController);
bot.hears(/\/unsub(\d+)/i, controllers.unsubMangaController);
bot.hears(/^\/download(\d+)_(\d+)$/i, controllers.downloadChapterController);
// events
bot.on("inline_query", controllers.inlineQueryController);
bot.on("callback_query", controllers.callbackController);
bot.on("text", (ctx) => {
    const { entities: isInline = false } = ctx.message;
    if (!isInline) return ctx.reply("Hai !");
});
bot.catch((err) => {
    console.error(err);
});

const childProcess = fork(`${__dirname}/scripts/mangaUpdatesListener.js`);
childProcess.on("message", sendUpdates);

module.exports = bot;