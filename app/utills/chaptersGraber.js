const config = require("config");
const colors = require("colors");
const feedparser = require("./feedparser");
const MangaModel = require("../models/manga");
const ChapterModel = require("../models/chapter");
const sleep = require("thread-sleep");

async function createAndGetChaptersID(rss) {
    const chapters = (await feedparser(rss, { date: true })).reverse().map((chapter, indx) => {
        chapter.number = indx + 1;
        return chapter;
    });
    if (!chapters || chapters.length == 0) return [];
    const chaptersID = (await ChapterModel.create(chapters)).map((chapter) => chapter._id);
    return chaptersID;
}

async function main() {
    let counter = 1;
    const mangaList = await MangaModel.find({}).skip(877);
    for (let manga of mangaList) {
        console.log(`[ ${counter.toString().red} ]` + manga.name + " => " + "start".cyan);
        let chaptersID = await createAndGetChaptersID(manga.rss);
        manga.chapters = chaptersID;
        let ok = await manga.save();
        console.log(`[ ${counter.toString().red} ]` + manga.name + " => " + "finish".green);
        counter++;
        sleep(5000);
    }
}

main();