const _ = require("lodash");
const config = require("config");
const storage = require("dirty")("updates.db");
const hash = require("object-hash");

const MangaModel = require("../models/manga");
const ChapterModel = require("../models/chapter");
const feedparser = require("./feedparser");
const { getManga } = require("./scraper");

const { ReadMangaRSS } = config.get("rss");

async function listener(rss) {
    const chapters = (await feedparser(rss.feed, { date: true })).slice(5).map((chapter) => {
        let [, manga] = chapter.url.match(rss.match);
        chapter.manga = manga;
        return chapter;
    });

    // достаем из базы предыдущие главы
    const oldChapters = storage.get(rss.site) || [];
    // получаем новые обновления
    let updates = getUpdates(oldChapters, chapters);
    if (updates) {
        let group = groupByManga(updates);
        for (let item of group) {
            let ok = await updateData(item);
            console.log(ok);
        }
        // storage.set(rss.site, hashUpdates(chapters));
    }
}

function getUpdates(oldUpdates, newUpdates) {
    //создаем set из старых данных
    let oldUpdatesSet = new Set(oldUpdates);
    /*
        Фильруем новые данные. 
        Условие: элемент не встречается в старом множестве
        Проверяем хэши url-ов
    */
    let currentUpdates = newUpdates.filter((item) => !oldUpdatesSet.has(hash.MD5(item.url)));
    //если обновления присутствуют, возвращаем иначе false.

    return currentUpdates.length ? currentUpdates : null;
}

function groupByManga(chapters) {
    return _.chain(chapters)
        .groupBy("manga")
        .toPairs()
        .map(function(pair) { return _.zipObject(["Manga", "Chapters"], pair); })
        .value();
}

function hashUpdates(data) {
    //преобразуем список обновлением в список хэшей url-ов(т.к они не изменны).
    return data.map((item) => hash.MD5(item.url));
}

async function updateData(item) {
    let manga = await MangaModel.getMangaAndLastChapter({ url: item.Manga });
    if (manga) {
        var {
            _id: manga_id,
            chapters: [{ number = 0 } = {}],
        } = manga;

        return item.Chapters.map((chapter) => {
            number++;
            let { url, title, pubdate } = chapter;
            return {
                manga_id,
                number,
                url,
                title,
                pubdate,
            };
        });
    }

    return null;
}

listener(ReadMangaRSS);