const Markup = require("telegraf/markup");
const MangaModel = require("../models/manga");
const compileMessage = require("../helpers/compileMessage");
const Pagination = require("../helpers/pagination");

const pagination = new Pagination("mymanga_page");

module.exports = async(ctx) => {
    const userId = ctx.session.authToken;
    const mangaList = await MangaModel.getUserSubscribes(userId);
    const keyboard = pagination.createPagesInlineKeyboard(userId, mangaList.page, mangaList.pages);
    const message = mangaList.docs.map((manga) => {
        return `<b>${manga.name}</b>
        <i>${manga.title}</i>
        Подробнее: /manga${manga.publicId}
        Отписаться: /unsub${manga.publicId}`;
    }).join("\n\n");
    ctx.replyWithHTML(compileMessage(message), Markup.inlineKeyboard([keyboard]));
};