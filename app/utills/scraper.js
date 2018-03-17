const request = require("request");
const rp = require("request-promise");
const cheerio = require("cheerio");
const feedparser = require("./feedparser");
const ChapterModel = require("../models/chapter");

function scrap(url) {
    return rp.get({
        uri: url,
        transform: (body) => cheerio.load(body),
    });
}

async function getMangaList(url, site = "http://readmanga.me") {
    const $ = await scrap(url);
    return $(".tile.col-sm-6 ")
        .find(".desc > h3 > a")
        .map((i, el) => site + $(el).attr("href"))
        .get();
}

function getThumbnail(image = "") {
    const regx = /\.jpg$/i;
    const thumbPrefix = "_p";
    const result = image.match(regx);
    if (!result) return null;

    return image.slice(0, result.index) + thumbPrefix + image.slice(result.index);
}

// получаем мангу
async function getManga(link, site = "http://readmanga.me") {
    // получаем объект cheerio
    const $ = await scrap(link);
    const manga = $("#mangaBox .leftContent");
    // проверяем существование манги
    if (!manga) throw new Error(`manga is not exist by url - [${link}]`);
    // парсим данные
    const name = manga.find("meta[itemprop='name']").attr("content");
    const title = manga.find("meta[itemprop='alternativeHeadline']").attr("content");
    const url = manga.find("meta[itemprop='url']").attr("content");
    const description = manga.find("meta[itemprop='description']").attr("content");
    const image = manga.find("div.picture-fotorama").children("img").first().attr("src");
    const genres = manga.find("span.elem_genre").children("a").map((i, el) => $(el).text()).get();
    const popularity = Number(manga.find("span[itemprop='interactionCount']").text() || 0);
    const thumb = getThumbnail(image);
    const rss = manga.find(".manga-actions").children("a").eq(1).attr("href");
    // проверяем существование rss ленты и достаем главы
    if (!rss) throw new Error(`rss feed is not exist by url [${link}]`);
    return {
        title,
        name,
        url,
        description,
        image,
        genres,
        rss: site + rss,
        popularity,
        thumb,
    };
}

async function createAndGetChaptersID(rss) {
    const chapters = (await feedparser(rss, { date: true })).reverse().map((chapter, indx) => {
        chapter.number = indx + 1;
        return chapter;
    });
    if (!chapters || chapters.length == 0) return [];
    const chaptersID = (await ChapterModel.create(chapters)).map((chapter) => chapter._id);
    return chaptersID;
}

async function getChapterImages(url) {
    const images = [];
    const regexp = /(rm_h\.init\( \[\[)(.*)\]\]/i;
    const $ = await rp.get(`${url}?mature=1`);
    const data = $.match(regexp)[2].replace(/[\'\"]+/g, "");
    data.split("],").forEach((val) => {
        let el = val.split(",");
        images.push({
            src: el[1] + el[2],
            width: Number(el[3]),
            height: Number(el[4]),
        });
    });

    return images;
}

function downloadImage(chapterURL, src) {
    const req = request.get({
        uri: src,
        headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
            "Cache-Control": "max-age=0",
            "Connection": "keep-alive",
            "Referer": chapterURL,
            "Upgrade-Insecure-Requests": "1",
            "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Mobile Safari/537.36",
            "X-Compress": "null",
        },
    });

    return req;
}

function createInputMediaPhotoFromStream(chapterURL, src, caption = "") {
    const req = downloadImage(chapterURL, src);

    return {
        type: "photo",
        caption,
        media: {
            source: req,
        },
    };
}

function createInputMediaPhotoFromFileId(fileId, caption = "") {
    return {
        type: "photo",
        caption,
        media: fileId,
    };
}


module.exports = {
    scrap,
    getManga,
    getMangaList,
    getChapterImages,
    downloadImage,
    createInputMediaPhotoFromStream,
    createInputMediaPhotoFromFileId,
    createAndGetChaptersID,
};