const { MangaModel } = require("../../models");
const { getChatId } = require("../../utils").messageManager;
const { getKeyboard } = require("../../helpers").mangaManager;

module.exports = async(ctx) => {
    const mangaId = ctx.state.payload;
    const chatId = getChatId(ctx);
    // отписываемся от обновлений
    const manga = await MangaModel.unsubscribeToManga(chatId, mangaId);
    if (!manga) return ctx.answerCbQuery("Я не нашел мангу с таким идентификатором!");
    // оповещаем юзера
    const keyboard = getKeyboard(manga);
    ctx.answerCbQuery(`Вы отписались от - [${manga.name}]`, true);
    return ctx.editMessageReplyMarkup(keyboard);
};