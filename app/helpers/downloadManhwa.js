const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");
const sharp = require("sharp");
const smartcrop = require("smartcrop-sharp");
const _ = require("lodash");
const { ChapterModel } = require("../models");
const {
    downloadImage,
} = require("./scraper");
const {
    MangaPaginationAction,
    DownloadNextChapterAction,
} = require("config").get("constants");

const { getChatId } = require("../utils").messageManager;
const maxSize = 2560;
const topPat = 1000;

function getSheetsCount(images) {
    return images.reduce((count, image) => {
        let { height } = image;
        let val = (height > maxSize) ? Math.ceil(height / topPat) : 1;
        return count + val;
    }, 1);
}

function createInputMediaPhotoFromBuffer(buffer, caption = "") {
    return {
        type: "photo",
        caption,
        media: { source: buffer },
    };
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

async function applySmartCrop(image, width, height, top = 0) {
    const result = await smartcrop.crop(image, { width: width, height: height });
    const crop = result.topCrop;
    const chunck = await sharp(image)
        .extract({ width: crop.width, height: crop.height, left: 0, top })
        .resize(width, height)
        .toBuffer();

    return chunck;
}

module.exports = async(ctx, done, chapter, images) => {
    const { url, _id: chapterId } = chapter;
    const count = getSheetsCount(images);
    const userID = getChatId(ctx);
    const imageIds = [];
    let index = 1;

    await ctx.telegram.sendMessage(userID, `[ <b>${chapter.title}</b> ] - будет загружено <b>${count}</b> стр.`, Extra.HTML());
    for (let image of images) {
        let { src, width, height } = image;
        let imageData = await downloadImage(url, src);
        if (image.height <= maxSize) {
            let data = await ctx.telegram.sendPhoto(userID, { source: imageData }, { caption: `${index} из ${count}` });
            index++;
            imageIds.push(...parseImangeIds([data]));
            continue;
        }

        let imageChuncks = [];
        for (let top = 0; top < height; top += topPat) {
            let size = height - top < topPat ? height - top : topPat;
            imageChuncks.push(applySmartCrop(imageData, width, size, top));
        }
        // формируем количество паков
        let packs = _.chunk(await Promise.all(imageChuncks), 10);
        for (let pack of packs) {
            let last = index + pack.length;
            await ctx.telegram.sendMessage(userID, `\u{23EC}Скачиваю страницы с <b>${index}</b> по <b>${last}</b>`, Extra.HTML());
            let pages = pack.map((buffer) => {
                index++;
                return createInputMediaPhotoFromBuffer(buffer, `${index} из ${count}`);
            });
            let data = await ctx.telegram.sendMediaGroup(userID, pages);
            imageIds.push(...parseImangeIds(data));
        }
    }

    // кешируем главы
    await ChapterModel.update({ _id: chapterId }, { $set: { cache: imageIds } });
    // загрузка завершена
    let keyboard = createKeyboardByChapter(chapter);
    await ctx.telegram.sendMessage(userID, `\u{1F4BE}[ <b>${chapter.title}</b> ] - ЗАГРУЗКА ЗАВЕРШЕНА`, Extra.HTML().markup(keyboard));
    return done();
};