const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");
const MangaModel = require("../models/manga");
const compileMessage = require("../helpers/compileMessage");
const Pagination = require("../helpers/pagination");

const pagination = new Pagination("mymanga_page");

module.exports = async(ctx, page = 1, limit = 7) => {
    const userId = ctx.session.authToken;
    const mangaList = await MangaModel.getUserSubscribes(userId, page, limit);
    if (!mangaList.docs.length) return { empty: true };
    const factor = (mangaList.page - 1) * mangaList.limit;
    const keyboard = pagination.createPagesInlineKeyboard(userId, mangaList.page, mangaList.pages);
    const message = mangaList.docs.map((manga, indx) => {
        let number = indx + 1 + factor;
        return `${number}) <b>${manga.name}</b> (<i>${manga.title}</i>)
        Подробнее: /manga${manga.mangaId}
        \u{1F507}Отписаться: /unsub${manga.mangaId}`;
    }).join("\n\n");
    return {
        message: compileMessage(message),
        options: Extra.HTML().markup(Markup.inlineKeyboard(keyboard)),
    };
};