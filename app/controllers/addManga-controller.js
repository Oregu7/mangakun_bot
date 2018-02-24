const Extra = require("telegraf/extra");
const MangaModel = require("../models/manga");
const { getManga } = require("../utills/scraper");
const mangaTemplate = require("../helpers/mangaTemplate");

const baseUrl = "http://readmanga.me";

function sendManga(ctx, manga) {
    const message = mangaTemplate.getMessage(manga);
    const keyboard = mangaTemplate.getKeyboard(manga);

    return ctx.reply(message, Extra.HTML().markup(keyboard));
}

module.exports = async(ctx) => {
    const [mangaName] = ctx.match.slice(3, 4);
    if (!mangaName) return ctx.reply("Что-то пошло не так :(");
    // ищем мангу с данным url-ом в базе
    const mangaExist = await MangaModel.findOne({ url: `${baseUrl}/${mangaName}` });
    if (mangaExist) return sendManga(ctx, mangaExist);
    // парсим данные с сайта
    ctx.reply("Подготавливаем мангу для скачивания, нужно немного подождать (◕‿◕)");
    try {
        const mangaData = await getManga(`${baseUrl}/${mangaName}`);
        const manga = await MangaModel.create(mangaData);
        return sendManga(ctx, manga);
    } catch (err) {
        ctx.reply(`Похоже манги - [${mangaName}], не существует (╥_╥)`);
        console.error(err.name);
    }
};