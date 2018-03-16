const MangaModel = require("../models/manga");
const { sendManga } = require("../helpers/mangaManager");

module.exports = async(ctx) => {
    const publicId = ctx.match[1];
    const manga = await MangaModel.getManga({ publicId });
    if (manga) return sendManga(ctx, manga);

    return ctx.reply("Я не нашел мангу с таким идентификатором!");
};