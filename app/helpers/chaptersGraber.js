const config = require("config");
const colors = require("colors");
const feedparser = require("./feedparser");
const { MangaModel, ChapterModel } = require("../models");
const sleep = require("thread-sleep");

async function createChapters(rss, mangaId) {
    const chapters = (await feedparser(rss, { date: true })).reverse().map((chapter, indx) => {
        chapter.number = indx + 1;
        chapter.manga_id = mangaId;
        return chapter;
    });
    if (!chapters || chapters.length == 0) return [];
    return await ChapterModel.create(chapters);
}

async function main() {
    let counter = 1;
    const mangaList = await MangaModel.find({}).skip(21981);
    for (let manga of mangaList) {
        console.log(`[ ${counter.toString().red} ]` + manga.name + " => " + "start".cyan);
        let ok = await createChapters(manga.rss, manga._id);
        console.log(`[ ${counter.toString().red} ]` + manga.name + " => " + "finish".green);
        counter++;
        sleep(1000);
    }
}

//main();