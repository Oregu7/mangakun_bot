const feedparser = require("./feedparser");
const rp = require("request-promise");
const cheerio = require("cheerio");

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
    const chapters = (await feedparser(site + rss)).slice(0, 5);
    return {
        title,
        name,
        url,
        description,
        image,
        genres,
        rss: site + rss,
        chapters,
        popularity,
        thumb,
    };
}

exports.scrap = scrap;
exports.getManga = getManga;
exports.getMangaList = getMangaList;