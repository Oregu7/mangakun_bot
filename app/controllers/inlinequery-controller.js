const { uid } = require("rand-token");
const escape = require("escape-html");
const MangaModel = require("../models/manga");
const mangaTemplate = require("../helpers/mangaTemplate");

module.exports = async(ctx) => {
    try {
        const pattern = new RegExp(ctx.inlineQuery.query, "i");
        const mangaList = await MangaModel
            .find({ $or: [{ name: pattern }, { title: pattern }] })
            .sort("-popularity")
            .limit(30);
        const results = mangaList.map((manga) => ({
            id: uid(11),
            type: "article",
            // photo_url: manga.image,
            thumb_url: manga.thumb,
            title: manga.name,
            description: escape(`${manga.description.slice(0, 70)}...`),
            // caption: manga.description.slice(0, 195) + "...",
            message_text: mangaTemplate.getMessage(manga),
            parse_mode: "HTML",
            disable_web_page_preview: false,
            ...mangaTemplate.getKeyboard(manga).extra(),
        }));

        let extra = { cache_time: 300 };
        if (!results.length) {
            extra = Object.assign({}, extra, {
                switch_pm_text: "я не нашел твою мангу :(",
                switch_pm_parameter: "add_manga",
                // cache_time: 0,
            });
        }

        ctx.answerInlineQuery(results, extra);
    } catch (err) {
        console.error(err);
    }
};