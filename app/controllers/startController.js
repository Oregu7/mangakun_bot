const Router = require("telegraf/router");
const Extra = require("telegraf/extra");
const compileMessage = require("../helpers/compileMessage");
const addMangaCommandController = require("./addMangaCommandController");

const startRouter = new Router((ctx) => {
    const parts = ctx.message.text.split(" ");
    return { route: parts[1] || "/" };
});

startRouter.on("/", (ctx) => {
    const message = `<b>Mangakun Bot - </b> это бот, который будет оповещать
    о выходе Вашей любимой <b>манги</b>.
    
    Используйте эти команды, чтобы управлять ботом:
    
    <b>Манга</b>
    /search - поиск манги
    /addmanga - добавить мангу в базу
    /mymanga - список Ваших подписок
    
    <b>Помощь</b>
    /help - поможем, чем сможем :)
    /feedback - связаться с нами
    
    /rate - оценить бот`;

    return ctx.reply(compileMessage(message), Extra.HTML());
});

startRouter.on("add_manga", addMangaCommandController);

startRouter.otherwise((ctx) => ctx.reply("O_o"));

module.exports = startRouter;