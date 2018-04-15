const escape = require("escape-html");
const { MangaModel } = require("../../models");
const { getChatId } = require("../../utils").messageManager;
const { getKeyboard } = require("../../helpers").mangaManager;

module.exports = async(ctx) => {
    const mangaId = ctx.state.payload;
    const chatId = getChatId(ctx);
    // проверяем подписан или нет
    const result = await MangaModel.checkSubscribe(chatId, mangaId);
    if (result) return ctx.answerCbQuery(`Вы уже подписаны на мангу - [${escape(result.name)}] !`, true);
    // подписываемся на обновления
    const manga = await MangaModel.subscribeToManga(chatId, mangaId);
    const keyboard = getKeyboard(manga, true);
    ctx.answerCbQuery(`Вы подписались на мангу - [${escape(manga.name)}]!`, true);
    return ctx.editMessageReplyMarkup(keyboard);
};