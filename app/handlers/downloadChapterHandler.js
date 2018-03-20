const _ = require("lodash");
const sleep = require("thread-sleep");
const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");
const Mutex = require("../utills/mutex");
const getUserId = require("../utills/getUserId");
const ChapterModel = require("../models/chapter");
const compileMessage = require("../helpers/compileMessage");
const {
    createInputMediaPhotoFromFileId,
    createInputMediaPhotoFromStream,
    getChapterImages,
} = require("../utills/scraper");
const { MangaPaginationAction } = require("config").get("constants");

const mutex = new Mutex(downloadChapter);

function filterSize(image) {
    const maxSize = 2560;
    return image.width <= maxSize && image.height <= maxSize;
}

function parseImangeIds(data = []) {
    return data.map((item) => {
        let [{ file_id: photoId }] = item.photo.slice(-1);
        return photoId;
    });
}

async function downloadChapter(ctx, done, chapter) {
    const { url, _id: chapterId, imagesID } = chapter;
    // отправляем кешированные картинки
    if (imagesID.length) return sendCachedImages(ctx, chapter, done);
    const userID = getUserId(ctx);
    // достаем url's и валидируем по длине
    const images = await getChapterImages(url);
    const sizeDifference = images.length - images.filter(filterSize);
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
        sleep(3500);
    }
    // кешируем главы
    await ChapterModel.update({ _id: chapterId }, { $set: { imagesID: imageIds } });
    // загрузка завершена
    let keyboard = Markup.inlineKeyboard([
        Markup.callbackButton("\u{21A9}Вернуться к главам", `${MangaPaginationAction}:1;${chapter.manga_id}`),
    ]);
    await ctx.telegram.sendMessage(userID, `\u{1F4BE}[ <b>${chapter.title}</b> ] - ЗАГРУЗКА ЗАВЕРШЕНА`, Extra.HTML().markup(keyboard));
    return done();
}

async function sendCachedImages(ctx, chapter, done) {
    const { imagesID: imageIds } = chapter;
    console.log("скачиваю кешированные");
    const userID = getUserId(ctx);
    // формируем количество паков
    const packs = _.chunk(imageIds, 10);
    let index = 1;
    await ctx.telegram.sendMessage(userID, `[ <b>${chapter.title}</b> ] - будет загружено <b>${imageIds.length}</b> стр.`, Extra.HTML());
    for (let pack of packs) {
        let start = (index - 1) * 10 + 1;
        let last = (index - 1) * 10 + pack.length;
        await ctx.telegram.sendMessage(userID, `\u{23EC}Скачиваю страницы с <b>${start}</b> по <b>${last}</b>`, Extra.HTML());
        await ctx.telegram.sendMediaGroup(userID,
            pack.map((fileId, indx) => createInputMediaPhotoFromFileId(fileId, `${start + indx} из ${imageIds.length}`))
        );
        index++;
    }
    // загрузка завершена
    let keyboard = Markup.inlineKeyboard([
        Markup.callbackButton("\u{21A9}Вернуться к главам", `${MangaPaginationAction}:1;${chapter.manga_id}`),
    ]);
    await ctx.telegram.sendMessage(userID, `\u{1F4BE}[ <b>${chapter.title}</b> ] - ЗАГРУЗКА ЗАВЕРШЕНА`, Extra.HTML().markup(keyboard));
    return done();
}

mutex.on("number", (ctx, number) => {
    const userID = getUserId(ctx);
    let message = `\u{26A0}Ваш <b>номер</b> в очереди : <b>${number}</b>`;
    return ctx.telegram.sendMessage(userID, message, Extra.HTML());
});

mutex.on("already_in_queue", (ctx) => {
    const userID = getUserId(ctx);
    let message = `\u{26A0}Вы уже <b>добавили</b> главу в <b>очередь</b> на скачивание !
    Пожалуйста дождитесь завершения загрузки...`;
    return ctx.telegram.sendMessage(userID, compileMessage(message), Extra.HTML());
});

module.exports = mutex.enqueue.bind(mutex);