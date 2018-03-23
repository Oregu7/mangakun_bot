const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");
const escape = require("escape-html");
const {
    SubscribeMangaUpdatesAction,
    MangaPaginationAction,
    DownloadChapterAction,
} = require("config").get("constants");
const feedparser = require("../utills/feedparser");
const ChapterModel = require("../models/chapter");
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
            Markup.callbackButton("\u{1F4EE}Подписаться", `${SubscribeMangaUpdatesAction}:${manga.mangaId}`),
            Markup.urlButton("\u{1F4D6}Читать", manga.url),
        ],
        [
            Markup.callbackButton("\u{1F4BE}СКАЧАТЬ", `${DownloadChapterAction}:${manga.mangaId}`),
            Markup.callbackButton("\u{1F365}ГЛАВЫ", `${MangaPaginationAction}:1;${manga.id}`),
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