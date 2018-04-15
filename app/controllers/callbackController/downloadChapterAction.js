const { MangaModel } = require("../../models");
const { downloadChapterHandler } = require("../../handlers");

module.exports = async(ctx) => {
    const mangaId = ctx.state.payload;
    const manga = await MangaModel
        .findById(mangaId)
        .populate("firstChapter");
    if (!manga) return ctx.answerCbQuery("Я не нашел мангу с таким идентификатором", true);
    else if (!manga.firstChapter) return ctx.answerCbQuery("У данной манги еще нет глав ;(", true);

    ctx.answerCbQuery("Подготавливаю мангу для скачивания...", true);
    return downloadChapterHandler(ctx, manga.firstChapter);
};