const Router = require("telegraf/router");
const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");
const MangaModel = require("../models/manga");
const compileMessage = require("../helpers/compileMessage");
const mangaManager = require("../helpers/mangaManager");
const { createInputMediaPhoto, getChapterImages } = require("../utills/scraper");

const callback = new Router(({ callbackQuery }) => {
    if (!callbackQuery.data) { return; }
    const parts = callbackQuery.data.split(":");
    const result = {
        route: parts[0],
        state: { payload: parts[1] },
    };
    return result;
});

function filterSize(image) {
    const maxSize = 2560;
    return image.width <= maxSize && image.height <= maxSize;
}

callback.on("gl_chapter", async(ctx) => {
    const manga = await MangaModel.findById(ctx.state.payload);
    const { url } = manga.chapters[0];
    const userID = ctx.update.callback_query.from.id;
    ctx.answerCbQuery("Подготавливаю мангу для скачивания...", true);
    const images = await getChapterImages(url);
    const validImages = images.filter(filterSize);
    const sizeDifference = images.length - validImages.length;
    if (sizeDifference) {
        let message = `ЛУЧШЕ ЧИТАТЬ ЭТУ МАНГУ НА САЙТЕ !
        [${sizeDifference} из ${images.length}] изображений больше максимального размера 2560 x 2560 )`;
        return ctx.telegram.sendMessage(userID, compileMessage(message), Markup.inlineKeyboard([
            Markup.urlButton("Читать", url),
        ]).extra());
    }
    const pages = Math.ceil(validImages.length / 10);
    ctx.telegram.sendMessage(userID, `Будет загружено ${validImages.length} страниц`);
    for (let i = 1; i <= pages; i++) {
        ctx.telegram.sendMessage(userID, `Скачиваю страницы с ${(i - 1) * 10 + 1} по ${i * 10}`);
        let page = validImages.slice((i - 1) * 10, i * 10);
        let ok = await ctx.telegram.sendMediaGroup(userID, page.map((image) => createInputMediaPhoto(url, image.src)));
        console.log(ok);
    }
});

callback.on("chapters", async(ctx) => {
    const manga = await MangaModel.findByIdAndPopulateChapters(ctx.state.payload);
    const message = manga.chapters.map((chapter, indx) =>
        `${indx + 1}) <a href = "${chapter.url}">${chapter.title}</a>`
    ).join("\n");
    const keyboard = Markup.inlineKeyboard([Markup.callbackButton("\u{1F519}НАЗАД", `back:${manga.id}`)]);
    ctx.editMessageText(message, Extra.HTML().webPreview(false).markup(keyboard));
});

callback.on("back", async(ctx) => {
    const manga = await MangaModel.getManga({ _id: ctx.state.payload });
    return ctx.editMessageText(mangaManager.getMessage(manga), Extra.HTML()
        .markup(mangaManager.getKeyboard(manga)));
});

module.exports = callback;