const { uid } = require("rand-token");
const escape = require("escape-html");
const MangaModel = require("../models/manga");
const mangaManager = require("../helpers/mangaManager");

module.exports = async(ctx) => {
    const { query, offset } = ctx.inlineQuery;
    const page = offset.length ? Number(offset) : 1;
    try {
        const mangaList = await MangaModel.searchManga(query, page);
        const results = mangaList.docs.map((manga) => Object.assign({}, {
            id: uid(11),
            type: "article",
            thumb_url: manga.thumb,
            title: escape(manga.name),
            description: escape(`${manga.description.slice(0, 70)}...`),
            message_text: mangaManager.getMessage(manga),
            parse_mode: "HTML",
            disable_web_page_preview: false,
        }, mangaManager.getKeyboard(manga).extra()));

        // доп опции
        let extra = {
            cache_time: 300,
            next_offset: (mangaList.page < mangaList.pages) ? mangaList.page + 1 : "",
        };
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