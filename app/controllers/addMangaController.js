const MangaModel = require("../models/manga");
const { getManga } = require("../utills/scraper");
const { sendManga, createChapters } = require("../helpers/mangaManager");

const baseUrl = "http://readmanga.me";

module.exports = async(ctx) => {
    const [mangaName] = ctx.match.slice(3, 4);
    if (!mangaName) return ctx.reply("Что-то пошло не так :(");
    // ищем мангу с данным url-ом в базе
    const mangaExist = await MangaModel.getManga({ url: `${baseUrl}/${mangaName}` });
    if (mangaExist) return sendManga(ctx, mangaExist);
    // парсим данные с сайта
    ctx.reply("Подготавливаю мангу для скачивания, нужно немного подождать (◕‿◕)");
    try {
        const mangaData = await getManga(`${baseUrl}/${mangaName}`);
        const manga = await MangaModel.create(mangaData);
        await createChapters(manga.rss, manga._id);
        return sendManga(ctx, manga);
    } catch (err) {
        ctx.reply(`Похоже манги - [${mangaName}], не существует (╥_╥)`);
        console.error(err.name);
    }
};