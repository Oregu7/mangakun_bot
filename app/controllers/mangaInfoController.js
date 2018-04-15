const { MangaModel } = require("../models");
const { sendManga } = require("../helpers").mangaManager;
const { getChatId } = require("../utils").messageManager;

module.exports = async(ctx) => {
    const mangaId = Number(ctx.match[1]);
    const chatId = getChatId(ctx);
    const manga = await MangaModel.getManga({ mangaId }, chatId);
    if (manga) return sendManga(ctx, manga);

    return ctx.reply("Я не нашел мангу с таким идентификатором!");
};