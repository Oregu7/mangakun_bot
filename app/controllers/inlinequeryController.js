const { uid } = require("rand-token");
const escape = require("escape-html");
const MangaModel = require("../models/manga");
const mangaManager = require("../helpers/mangaManager");

module.exports = async(ctx) => {
    try {
        const mangaList = await MangaModel.searchManga(ctx.inlineQuery.query, 27);
        const results = mangaList.map((manga) => Object.assign({}, {
            id: uid(11),
            type: "article",
            thumb_url: manga.thumb,
            title: escape(manga.name),
            description: escape(`${manga.description.slice(0, 70)}...`),
            message_text: mangaManager.getMessage(manga),
            parse_mode: "HTML",
            disable_web_page_preview: false,
        }, mangaManager.getKeyboard(manga).extra()));

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