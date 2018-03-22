const startController = require("./startController");
const addMangaController = require("./addMangaController");
const addMangaCommandController = require("./addMangaCommandController");
const searchController = require("./searchController");
const mymangaController = require("./mymangaController");
const mangaInfoController = require("./mangaInfoController");
const unsubMangaController = require("./unsubMangaController");
const downloadChapterController = require("./downloadChapterController");
const tokenController = require("./tokenController");

const inlineQueryController = require("./inlinequeryController");
const callbackController = require("./callbackController");

module.exports = {
    startController,
    addMangaController,
    addMangaCommandController,
    searchController,
    mymangaController,
    mangaInfoController,
    unsubMangaController,
    downloadChapterController,
    tokenController,

    inlineQueryController,
    callbackController,
};