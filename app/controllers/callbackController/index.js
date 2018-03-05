const Router = require("telegraf/router");
const backToMangaAction = require("./backToMangaAction");
const downloadChapterAction = require("./downloadChapterAction");
const mangaPaginationAction = require("./mangaPaginationAction");
const { BackToMangaAction, MangaPaginationAction, DownloadChapterAction } = require("config").get("constants");

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

module.exports = callback;