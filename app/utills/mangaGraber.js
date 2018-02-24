const sleep = require("thread-sleep");
const config = require("config");
const colors = require("colors");
const scraper = require("./scraper");
const MangaModel = require("../../app/models/manga");

async function main(first, last) {
    const step = 70;
    for (let i = first; i <= last; i += 1) {
        const url = `http://mintmanga.com/list?type=&sortType=rate&offset=${i * step}&max=${step}`;
        const mangaList = await scraper.getMangaList(url);
        const pageNumber = colors.red(i + 1);
        console.log(`page[${pageNumber}] => ` + "start".blue);
        for (let mangaURL of mangaList) {
            let manga = await scraper.getManga(mangaURL);
            try {
                await MangaModel.create(manga);
                console.log(manga.name, " => ", "success".green);
            } catch (err) {
                console.error(err);
            }
            sleep(5000);
        }
        console.log(`page[${pageNumber}] => ` + "complete".cyan);
        sleep(15000);
    }
}

main(84, 146);