const _ = require("lodash");
const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");
const { Mutex, compileMessage } = require("../utils");
const { getChatId } = require("../utils").messageManager;
const { ChapterModel } = require("../models");

const {
    createInputMediaPhotoFromFileId,
    createInputMediaPhotoFromStream,
    getChapterImages,
} = require("../helpers").scraper;
const { downloadManhwa } = require("../helpers");
const {
    MangaPaginationAction,
    DownloadNextChapterAction,
} = require("config").get("constants");

/* === initialize mutex === */
const mutex = new Mutex(downloadChapter);
mutex.on("already_in_queue", (ctx) => {
    const userID = getChatId(ctx);
    let message = `\u{26A0}Вы уже <b>добавили</b> главу в <b>очередь</b> на скачивание !
    Пожалуйста дождитесь завершения загрузки...`;
    return ctx.telegram.sendMessage(userID, compileMessage(message), Extra.HTML());
});
mutex.on("number", (ctx, number) => {
    const userID = getChatId(ctx);
    let message = `\u{26A0}Ваш <b>номер</b> в очереди : <b>${number}</b>`;
    return ctx.telegram.sendMessage(userID, message, Extra.HTML());
});

/* === helpers === */
// фильтруем изображения по макс. высоте/ширине
function filterSize(image) {
    const maxSize = 2560;
    return (image.width <= maxSize) && (image.height <= maxSize);
}
// достаем photoId максимального качества
function parseImangeIds(data = []) {
    return data.map((item) => {
        let [{ file_id: photoId }] = item.photo.slice(-1);
        return photoId;
    });
}
// создаем inline-клавиатуру
function createKeyboardByChapter(chapter) {
    const { manga_id, number } = chapter;
    return Markup.inlineKeyboard([
        Markup.callbackButton("\u{21A9} Вернуться к главам", `${MangaPaginationAction}:1;${manga_id}`),
        Markup.callbackButton("Скачать следующую \u{23EC}", `${DownloadNextChapterAction}:${number};${manga_id}`),
    ], { columns: 2 });
}

/* === dowload chapter handler === */
async function downloadChapter(ctx, done, chapter) {
    const { url, _id: chapterId } = chapter;
    const userID = getChatId(ctx);
    // достаем url's и валидируем по длине
    const images = await getChapterImages(url);
    const sizeDifference = images.length - images.filter(filterSize).length;
    // если есть невалидные изображения
    if (sizeDifference) {
        let message = `ЛУЧШЕ ЧИТАТЬ ЭТУ МАНГУ НА САЙТЕ !
        [${sizeDifference} из ${images.length}] изображений больше максимального размера 2560 x 2560 )`;
        ctx.telegram.sendMessage(userID, compileMessage(message), Markup.inlineKeyboard([
            Markup.urlButton("Читать", url),
        ]).extra());
        return done();
    }
    // формируем количество паков
    const packs = _.chunk(images, 10);
    let index = 1;
    let imageIds = [];
    await ctx.telegram.sendMessage(userID, `[ <b>${chapter.title}</b> ] - будет загружено <b>${images.length}</b> стр.`, Extra.HTML());
    for (let pack of packs) {
        let start = (index - 1) * 10 + 1;
        let last = (index - 1) * 10 + pack.length;
        await ctx.telegram.sendMessage(userID, `\u{23EC}Скачиваю страницы с <b>${start}</b> по <b>${last}</b>`, Extra.HTML());
        let pages = await Promise.all(
            pack.map((image, indx) =>
                createInputMediaPhotoFromStream(url, image.src, `${start + indx} из ${images.length}`)));
        let data = await ctx.telegram.sendMediaGroup(userID, pages);
        index++;
        imageIds.push(...parseImangeIds(data));
    }
    // кешируем главы
    await ChapterModel.update({ _id: chapterId }, { $set: { cache: imageIds } });
    // загрузка завершена
    let keyboard = createKeyboardByChapter(chapter);
    await ctx.telegram.sendMessage(userID, `\u{1F4BE}[ <b>${chapter.title}</b> ] - ЗАГРУЗКА ЗАВЕРШЕНА`, Extra.HTML().markup(keyboard));
    return done();
}
// скачиваем кэшированные
async function sendCachedImages(ctx, chapter) {
    const { cache } = chapter;
    const userID = getChatId(ctx);
    // формируем количество паков
    const packs = _.chunk(cache, 10);
    let index = 1;
    await ctx.telegram.sendMessage(userID, `[ <b>${chapter.title}</b> ] - будет загружено <b>${cache.length}</b> стр.`, Extra.HTML());
    for (let pack of packs) {
        let start = (index - 1) * 10 + 1;
        let last = (index - 1) * 10 + pack.length;
        await ctx.telegram.sendMessage(userID, `\u{23EC}Скачиваю страницы с <b>${start}</b> по <b>${last}</b>`, Extra.HTML());
        await ctx.telegram.sendMediaGroup(userID,
            pack.map((fileId, indx) => createInputMediaPhotoFromFileId(fileId, `${start + indx} из ${cache.length}`))
        );
        index++;
    }
    // загрузка завершена
    let keyboard = createKeyboardByChapter(chapter);
    return ctx.telegram.sendMessage(userID, `\u{1F4BE}[ <b>${chapter.title}</b> ] - ЗАГРУЗКА ЗАВЕРШЕНА`, Extra.HTML().markup(keyboard));
}

// download || send cache
module.exports = (ctx, chapter) => {
    const { cache = [] } = chapter;
    // отправляем кешированные картинки
    if (cache.length) return sendCachedImages(ctx, chapter);
    // встаем в очередь и качаем мангу с сайта
    return mutex.enqueue(ctx, chapter);
};