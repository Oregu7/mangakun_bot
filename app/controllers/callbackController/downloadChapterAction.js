const MangaModel = require("../../models/manga");
const { getData } = require("../../utills/localSessionManager");
const downloadChapterHandler = require("../../handlers/downloadChapterHandler");

module.exports = async(ctx) => {
    // проверяем начал ли user диалог с ботом (/start)
    const mangaId = Number(ctx.state.payload);
    const userId = ctx.session.authToken || getData(ctx, "authToken");
    if (!userId) {
        return ctx.answerCbQuery("Чтобы скачать первую главу, начните сначала диалог с ботом", true, {
            url: `t.me/mangakun_bot?start=${mangaId}`,
        });
    }
    const manga = await MangaModel
        .findOne({ mangaId })
        .populate("firstChapter");
    if (!manga) return ctx.answerCbQuery("Я не нашел мангу с таким идентификатором", true);
    else if (!manga.firstChapter) return ctx.answerCbQuery("У данной манги еще нет глав ;(", true);

    ctx.answerCbQuery("Подготавливаю мангу для скачивания...", true);
    return downloadChapterHandler(ctx, manga.firstChapter);
};