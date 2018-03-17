const MangaModel = require("../../models/manga");
const downloadChapterHandler = require("../../handlers/downloadChapterHandler");

module.exports = async(ctx) => {
    const manga = await MangaModel
        .findById(ctx.state.payload)
        .populate("firstChapter");
    if (!manga) return ctx.answerCbQuery("Я не нашел мангу с таким идентификатором", true);
    else if (!manga.firstChapter) return ctx.answerCbQuery("У данной манги еще нет глав ;(", true);

    ctx.answerCbQuery("Подготавливаю мангу для скачивания...", true);
    return downloadChapterHandler(ctx, manga.firstChapter);
};