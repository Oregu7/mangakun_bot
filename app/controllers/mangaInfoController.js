const MangaModel = require("../models/manga");
const { sendManga } = require("../helpers/mangaManager");

module.exports = async(ctx) => {
    const mangaId = Number(ctx.match[1]);
    const manga = await MangaModel.getManga({ mangaId });
    if (manga) return sendManga(ctx, manga);

    return ctx.reply("Я не нашел мангу с таким идентификатором!");
};