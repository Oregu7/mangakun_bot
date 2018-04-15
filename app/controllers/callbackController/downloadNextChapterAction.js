const { ChapterModel } = require("../../models");
const { downloadChapterHandler } = require("../../handlers");

module.exports = async(ctx) => {
    const [number, mangaId] = ctx.state.payload.split(";");
    const nextNumber = Number(number) + 1;
    const chapter = await ChapterModel.findOne({ manga_id: mangaId, number: nextNumber });
    if (!chapter) return ctx.answerCbQuery("Я не нашел следующую главу !", true);

    ctx.editMessageReplyMarkup();
    return downloadChapterHandler(ctx, chapter);
};