const { SubscriberModel } = require("../../models");
const { getChatId } = require("../../utils").messageManager;

module.exports = async(ctx) => {
    const mangaId = ctx.state.payload;
    const chatId = getChatId(ctx);
    // проверяем подписан или нет
    const subscribe = await SubscriberModel.checkSubscribe(chatId, mangaId);
    if (subscribe) return ctx.answerCbQuery("Вы уже подписаны на эту мангу!", true);
    // подписываемся на обновления
    const ok = await SubscriberModel.subscribeToManga(chatId, mangaId);
    return ctx.answerCbQuery("Подписка успешно оформлена !", true);
};