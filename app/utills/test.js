const randToken = require("rand-token");
const config = require("config");
const MangaModel = require("../models/manga");

async function generateShortId() {
    let mangas = await MangaModel.find({});
    for (let manga of mangas) {
        let ok = await manga.save();
        console.log(ok);
    }
}

generateShortId();