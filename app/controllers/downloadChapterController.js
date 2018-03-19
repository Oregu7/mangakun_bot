const MangaModel = require("../models/manga");
const ChapterModel = require("../models/chapter");
const downloadChapterHandler = require("../handlers/downloadChapterHandler");

module.exports = async(ctx) => {
    const [, mangaId, chapterNumber] = ctx.match;
    const manga = await MangaModel.getManga({ mangaId: Number(mangaId) });
    if (!manga) return ctx.reply("Я не нашел мангу с данным идентификатором !");

    const chapter = await ChapterModel.findOne({ manga_id: manga.id, number: Number(chapterNumber) });
    if (!chapter) return ctx.reply("Я не нашел главу с данным номером !");

    return downloadChapterHandler(ctx, chapter);
};