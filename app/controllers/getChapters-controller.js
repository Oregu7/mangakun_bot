const Markup = require("telegraf/markup");
const compileMessage = require("../helpers/compileMessage");
const { createInputMediaPhoto, getChapterImages } = require("../utills/scraper");

function filterSize(image) {
    const maxSize = 2560;
    return image.width <= maxSize && image.height <= maxSize;
}

module.exports = async(ctx) => {
    const url = "http://readmanga.me/tower_of_god/vol2/289";
    ctx.reply("Подготавливаю мангу для скачивания...");
    const images = await getChapterImages(url);
    const validImages = images.filter(filterSize);
    const sizeDifference = images.length - validImages.length;
    if (sizeDifference) {
        let message = `ЛУЧШЕ ЧИТАТЬ ЭТУ МАНГУ НА САЙТЕ !
        [${sizeDifference} из ${images.length}] изображений больше максимального размера 2560 x 2560 )`;
        return ctx.reply(compileMessage(message), Markup.inlineKeyboard([
            Markup.urlButton("Читать", url),
        ]).extra());
    }
    const pages = Math.ceil(validImages.length / 10);
    ctx.reply(`Будет загружено ${validImages.length} страниц`);
    for (let i = 1; i <= pages; i++) {
        ctx.reply(`Скачиваю страницы с ${(i - 1) * 10 + 1} по ${i * 10}`);
        let page = validImages.slice((i - 1) * 10, i * 10);
        let ok = await ctx.replyWithMediaGroup(page.map((image) => createInputMediaPhoto(url, image.src)));
        console.log(ok);
    }
};