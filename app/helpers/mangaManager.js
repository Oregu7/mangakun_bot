const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");
const escape = require("escape-html");
const compileMessage = require("./compileMessage");

const getMessage = (manga) => {
    const {
        name,
        title,
        genres,
        image,
        description,
    } = manga;
    const message = `<b>${escape(name)}</b>
    <i>${escape(title)}</i>
    <code>${escape(genres.join(","))}</code>
    <a href="${image}">\u{2063}</a>
    ${description.length > 600 ? escape(description.slice(0, 600)) + "..." : escape(description)}`;

    return compileMessage(message);
};

const getKeyboard = (manga) => {
    const keyboard = Markup.inlineKeyboard([
        [
            Markup.callbackButton("\u{1F4EE}Подписаться", `sub:${manga.id}`),
            Markup.urlButton("\u{1F4D6}Читать", manga.url),
        ],
        [Markup.callbackButton("К СПИСКУ ГЛАВ\u{27A1}", `chapters:${manga.id}`)],
        [Markup.switchToCurrentChatButton("\u{1F50D}Продолжить поиск...", "")],
    ]);
    return keyboard;
};

const sendManga = (ctx, manga) => {
    const message = getMessage(manga);
    const keyboard = getKeyboard(manga);

    return ctx.reply(message, Extra.HTML().markup(keyboard));
};

module.exports = {
    getMessage,
    getKeyboard,
    sendManga,
};