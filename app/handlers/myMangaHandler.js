const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");
const { MyMangaPageAction } = require("config").get("constants");
const { MangaModel } = require("../models");
const { compileMessage, messageManager } = require("../utils");
const Pagination = require("../helpers").pagination;

const pagination = new Pagination(MyMangaPageAction);

module.exports = async(ctx, page = 1, limit = 7) => {
    const userId = messageManager.getChatId(ctx);
    const mangaList = await MangaModel.getUserSubscribes(userId, page, limit);
    if (!mangaList.docs.length) return { empty: true };
    const factor = (mangaList.page - 1) * mangaList.limit;
    const keyboard = pagination.createPagesInlineKeyboard(userId, mangaList.page, mangaList.pages);
    const mangasTemplate = mangaList.docs.map((manga, indx) => {
        let number = indx + 1 + factor;
        return `${number}) <b>${manga.name}</b> (<i>${manga.title}</i>)
        Подробнее: /manga${manga.mangaId} \u{1F4D8}
        Отписаться: /unsub${manga.mangaId} \u{1F515}`;
    }).join("\n\n");
    const pageSize = (limit * page) - (limit - mangaList.docs.length);
    const message = `\u{1F234}Ваши подписки [${pageSize} из ${mangaList.total}]\n
    ${mangasTemplate}`;
    return {
        message: compileMessage(message),
        options: Extra.HTML().markup(Markup.inlineKeyboard(keyboard)),
    };
};