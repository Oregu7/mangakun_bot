const { myMangaHandler } = require("../../handlers");

module.exports = async(ctx) => {
    // получаем главы манги
    const [page, userId] = ctx.state.payload.split(";");
    const { message, options, empty } = await myMangaHandler(ctx, page);
    if (empty) return ctx.answerCbQuery("Упс, на этой страничке манга отсутствует :)");
    return ctx.editMessageText(message, options);
};