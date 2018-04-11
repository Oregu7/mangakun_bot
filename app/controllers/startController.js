const Extra = require("telegraf/extra");
const compileMessage = require("../helpers/compileMessage");
const { sendManga } = require("../helpers/mangaManager");
const addMangaCommandController = require("./addMangaCommandController");
const UserModel = require("../models/user");
const MangaModel = require("../models/manga");

async function startCommand(ctx) {
    const message = `<b>Mangakun Bot - </b> это бот, который будет оповещать
    о выходе Вашей любимой <b>манги</b>.
    
    Используйте эти команды, чтобы управлять ботом:
    
    <b>Манга</b>
    /search - поиск манги
    /add - добавить мангу в базу
    /manga - список Ваших подписок
    /genres - список жанров

    <b>Помощь</b>
    /help - справка
    /feedback - связаться с нами
    
    /rate - оценить бот`;

    return ctx.reply(compileMessage(message), Extra.HTML());
}

async function otherwise(ctx, data) {
    let manga = await MangaModel.getManga({ mangaId: Number(data) });
    if (manga) return sendManga(ctx, manga);

    return ctx.reply("O_o");
}

module.exports = async(ctx) => {
    const parts = ctx.message.text.split(" ");
    const route = parts[1] || "/";

    if (!ctx.session.hasOwnProperty("authToken")) {
        let user = await UserModel.createByContext(ctx);
        console.log(`[ new client ] => ${user.username}:${user.userId}`);
        ctx.session.authToken = user._id;
    }

    switch (route) {
        case "/":
            startCommand(ctx);
            break;
        case "add_manga":
            addMangaCommandController(ctx);
            break;
        default:
            otherwise(ctx, route);
    }
};