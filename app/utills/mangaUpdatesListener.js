const _ = require("lodash");
const config = require("config");
const storage = require("dirty")("updates.db");
const hash = require("object-hash");

const MangaModel = require("../models/manga");
const ChapterModel = require("../models/chapter");
const compileMessage = require("../helpers/compileMessage");
const feedparser = require("./feedparser");
const { getManga } = require("./scraper");

const { ReadMangaRSS } = config.get("rss");

// получаем список обновлений
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
// группируем главы по url-манги
function groupByManga(chapters) {
    return _.chain(chapters)
        .groupBy("manga")
        .toPairs()
        .map(function(pair) { return _.zipObject(["Manga", "Chapters"], pair); })
        .value();
}
// преобразуем список обновлением в список хэшей url-ов(т.к они не изменны).
function hashUpdates(data) {
    return data.map((item) => hash.MD5(item.url));
}

// формируем объект с ключами property
function compileMangaByProeprty(mangaList, property) {
    return mangaList.map((manga) => ({
        [manga[property]]: manga,
    })).reduce((data, val) => Object.assign(data, val), {});
}

// формируем список глав
function compileChapters(group) {
    return group.map((item) => item.Chapters)
        .reduce((data, val) => [...data, ...val], []);
}

// расширяем главы, добавляем manga_id и number
function expandChapters(item) {
    let { _id: manga_id, lastChapter } = item.Manga;
    let number = lastChapter ? lastChapter.number : 0;
    return item.Chapters.reverse().map((chapter) => {
        number++;
        let { url, title, pubdate } = chapter;
        return {
            manga_id,
            number,
            url,
            title,
            pubdate,
        };
    }).reverse();
}

async function filterAndCompareResult(rss, group, mangaList) {
    const result = [...group];
    // формируем map существующией манги типа { url: manga }  
    const mangaListMap = compileMangaByProeprty(mangaList, "url");
    // обновляем данные манги в объекте group
    for (let item of result) {
        if (mangaListMap.hasOwnProperty(item.Manga)) {
            item.Manga = mangaListMap[item.Manga];
        } else {
            let mangaData = await getManga(item.Manga, rss.site);
            let manga = await MangaModel.create(mangaData);
            console.log(manga);
            item.Manga = manga;
        }

        // добавляем в главы доп.информацию manga_id и number
        item.Chapters = expandChapters(item);
    }


    return result;
}

function createNotifyUsers(result) {
    const data = result.filter(({ Manga }) => Manga.subscribers.length);
    return data.map(({ Manga, Chapters }) => {
        let { name, title, mangaId, subscribers } = Manga;
        let chapters = Chapters.map((chapter, indx) => compileMessage(`${indx + 1}) ${chapter.title}
        \u{1F4D9}Читать: <a href="${chapter.url}">ссылка</a>
        \u{23EC}Скачать: /download${mangaId}_${chapter.number}
        `)).join("\n");
        let footer = `${"\u{2796}".repeat(11)}\nПодробнее: /manga${mangaId}\nОтписаться: /unsub${mangaId}`;
        let message = `<b>${name}</b>\n<i>${title}</i>\n\n\u{2795}<b>Обновления:</b>\n${chapters}\n${footer}`;
        return {
            message,
            users: subscribers.map(({ user }) => user.userId),
        };
    });
}

// достаем новые главы из rss-ленты
async function getChapters(rss) {
    const chapters = (await feedparser(rss.feed, { date: true })).slice(5).map((chapter) => {
        let [, site, manga] = chapter.url.match(rss.match);
        // вся манга, кроме collection
        if (manga == "collection") return null;
        chapter.manga = site + manga;
        return chapter;
    });

    // удаляем все пустые элементы (undefined, null)
    return _.compact(chapters);
}

async function listener(rss) {
    const newChapters = await getChapters(rss);
    // достаем из базы предыдущие главы
    const oldChapters = storage.get(rss.site) || [];
    // получаем новые обновления
    let updates = getUpdates(oldChapters, newChapters);
    if (updates) {
        let group = groupByManga(updates);
        let mangaList = await MangaModel.getMangaAndLastChapter({
            url: { $in: group.map((item) => item.Manga) },
        }, group.length);
        let res = await filterAndCompareResult(rss, group, mangaList);
        try {
            let createdChapters = await ChapterModel.insertMany(compileChapters(res), { ordered: false });
            console.log(createdChapters);
        } catch (err) {
            console.error(err);
        }
        let notify = createNotifyUsers(res);
        process.send(notify);
        storage.set(rss.site, hashUpdates(newChapters));
    }
}

setInterval(listener, 1000 * 10 * 60, ReadMangaRSS);