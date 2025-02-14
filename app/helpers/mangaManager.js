const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");
const escape = require("escape-html");
const {
    SubscribeMangaUpdatesAction,
    UnsubscribeMangaUpdatesAction,
    MangaPaginationAction,
    DownloadChapterAction,
} = require("config").get("constants");
const feedparser = require("./feedparser");
const { ChapterModel } = require("../models");
const { compileMessage } = require("../utils");

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

function getSubOrUnsubButton(manga, unsubscribeButton = false) {
    const { subscriber = false } = manga;
    if (unsubscribeButton || subscriber)
        return Markup.callbackButton("\u{1F515}Отписаться", `${UnsubscribeMangaUpdatesAction}:${manga._id}`);
    else
        return Markup.callbackButton("\u{1F514}Подписаться", `${SubscribeMangaUpdatesAction}:${manga._id}`);
}

const getKeyboard = (manga, unsubscribeButton = false) => {
    const keyboard = Markup.inlineKeyboard([
        [
            getSubOrUnsubButton(manga, unsubscribeButton),
            Markup.urlButton("\u{1F310}Сайт", manga.url),
        ],
        [
            Markup.callbackButton("\u{23EC}СКАЧАТЬ (1)", `${DownloadChapterAction}:${manga._id}`),
            Markup.callbackButton("\u{1F4DA}ГЛАВЫ", `${MangaPaginationAction}:1;${manga._id}`),
        ],
        [Markup.switchToCurrentChatButton("\u{1F50D}Продолжить поиск...", "")],
    ]);
    return keyboard;
};

const sendManga = (ctx, manga) => {
    const message = getMessage(manga);
    const keyboard = getKeyboard(manga);

    return ctx.reply(message, Extra.HTML().markup(keyboard));
};

async function createChapters(rss, mangaId) {
    const chapters = (await feedparser(rss, { date: true })).reverse().map((chapter, indx) => {
        chapter.number = indx + 1;
        chapter.manga_id = mangaId;
        return chapter;
    });
    if (!chapters || chapters.length == 0) return [];
    return ChapterModel.create(chapters);
}

module.exports = {
    getMessage,
    getKeyboard,
    sendManga,
    createChapters,
};