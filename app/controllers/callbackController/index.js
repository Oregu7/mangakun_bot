const Router = require("telegraf/router");
const backToMangaAction = require("./backToMangaAction");
const downloadChapterAction = require("./downloadChapterAction");
const mangaPaginationAction = require("./mangaPaginationAction");

const callback = new Router(({ callbackQuery }) => {
    if (!callbackQuery.data) { return; }
    const parts = callbackQuery.data.split(":");
    const result = {
        route: parts[0],
        state: { payload: parts[1] },
    };
    return result;
});

callback.on("gl_chapter", downloadChapterAction);
callback.on("ch_page", mangaPaginationAction);
callback.on("back", backToMangaAction);

module.exports = callback;