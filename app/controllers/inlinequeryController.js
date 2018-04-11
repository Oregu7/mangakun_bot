const { uid } = require("rand-token");
const escape = require("escape-html");
const MangaModel = require("../models/manga");

module.exports = async(ctx) => {
    const { query, offset } = ctx.inlineQuery;
    const page = offset.length ? Number(offset) : 1;
    const queryData = getQueryData(query);
    try {
        const mangaList = await MangaModel.searchManga(queryData, page);
        const results = mangaList.docs.map((manga) => ({
            id: uid(11),
            type: "article",
            thumb_url: manga.thumb,
            title: escape(manga.name),
            description: escape(`${manga.description.slice(0, 70)}...`),
            message_text: `/manga${manga.mangaId}`,
        }));

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

function getQueryData(query) {
    const indx = query.indexOf(":");
    let genre = "";
    let text = query;
    if (indx !== -1) {
        genre = query.slice(0, indx).toLowerCase().trim();
        text = query.slice(indx + 1).trim();
    }

    return { genre, text };
}