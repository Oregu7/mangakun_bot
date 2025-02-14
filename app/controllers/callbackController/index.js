const Router = require("telegraf/router");
const backToMangaAction = require("./backToMangaAction");
const downloadChapterAction = require("./downloadChapterAction");
const mangaPaginationAction = require("./mangaPaginationAction");
const subscribeAction = require("./subscribeAction");
const unsubscribeAction = require("./unsubscribeAction");
const myMangaPageAction = require("./myMangaPageAction");
const downloadNextChapterAction = require("./downloadNextChapterAction");

const {
    BackToMangaAction,
    MangaPaginationAction,
    DownloadChapterAction,
    SubscribeMangaUpdatesAction,
    UnsubscribeMangaUpdatesAction,
    DownloadNextChapterAction,
    MyMangaPageAction,
} = require("config").get("constants");

const callback = new Router(({ callbackQuery }) => {
    if (!callbackQuery.data) { return; }
    const parts = callbackQuery.data.split(":");
    const result = {
        route: parts[0],
        state: { payload: parts[1] },
    };
    return result;
});

callback.on(DownloadChapterAction, downloadChapterAction);
callback.on(MangaPaginationAction, mangaPaginationAction);
callback.on(BackToMangaAction, backToMangaAction);
callback.on(SubscribeMangaUpdatesAction, subscribeAction);
callback.on(UnsubscribeMangaUpdatesAction, unsubscribeAction);
callback.on(MyMangaPageAction, myMangaPageAction);
callback.on(DownloadNextChapterAction, downloadNextChapterAction);


module.exports = callback;