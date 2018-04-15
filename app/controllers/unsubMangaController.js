const { MangaModel, SubscriberModel } = require("../models");
const { messageManager: { getChatId }} = require("../utils");

module.exports = async(ctx) => {
    const mangaId = Number(ctx.match[1]);
    const chatId = getChatId(ctx);
    // достаем мангу, подписчиков фильтруем по id-пользователя
    const manga = await MangaModel.getManga({ mangaId });
    if (!manga) return ctx.reply("Я не нашел мангу с таким идентификатором!");
    // отписываемся от обновлений
    await SubscriberModel.unsubscribeToManga(chatId, manga._id);

    return ctx.reply(`Вы отписались от - [${manga.name}]`);
};