const { MangaModel } = require("../models");
const { getChatId } = require("../utils").messageManager;

module.exports = async(ctx) => {
    const mangaId = Number(ctx.match[1]);
    const chatId = getChatId(ctx);
    // достаем мангу, подписчиков фильтруем по id-пользователя
    const manga = await MangaModel.getManga({ mangaId });
    if (!manga) return ctx.reply("Я не нашел мангу с таким идентификатором!");
    // отписываемся от обновлений
    const ok = await MangaModel.unsubscribeToManga(chatId, manga._id);
    return ctx.reply(`Вы отписались от - [${ok.name}]`);
};