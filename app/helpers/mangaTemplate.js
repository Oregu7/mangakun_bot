const Markup = require("telegraf/markup");
const escape = require("escape-html");
const compileMessage = require("./compileMessage");


exports.getMessage = (manga) => {
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

exports.getKeyboard = (manga) => {
    const keyboard = Markup.inlineKeyboard([
        [
            Markup.callbackButton("\u{1F4EE}Подписаться", `sub:${manga.id}`),
            Markup.urlButton("\u{1F4D6}Читать", manga.url),
        ],
        [Markup.switchToCurrentChatButton("\u{1F50D}Продолжить поиск...", "")],
    ]);
    return keyboard;
};