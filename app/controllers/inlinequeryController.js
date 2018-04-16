const { uid } = require("rand-token");
const escape = require("escape-html");
const { MangaModel } = require("../models");
const { getChatId } = require("../utils").messageManager;

module.exports = async(ctx) => {
    const { query, offset } = ctx.inlineQuery;
    const page = offset.length ? Number(offset) : 1;
    const queryData = getQueryData(ctx, query);
    try {
        let mangaList = [];
        let extra = { is_personal: false, cache_time: 300 };
        // ищем мангу
        if (queryData.genre !== "mymanga") {
            mangaList = await MangaModel.searchManga(queryData, page);
        } else {
            extra = { cache_time: 0, is_personal: true };
            mangaList = await MangaModel.searchMangaFromSubscribes(queryData, page);
        }
        // формируем ответ типа article
        const results = mangaList.docs.map((manga) => ({
            id: uid(11),
            type: "article",
            thumb_url: manga.thumb,
            title: escape(manga.name),
            description: escape(`${manga.description.slice(0, 70)}...`),
            message_text: `/manga${manga.mangaId}`,
        }));
        // следующая страница
        extra["next_offset"] = (mangaList.page < mangaList.pages) ? mangaList.page + 1 : "";
        // данные отсутствуют
        if (!results.length) {
            extra = Object.assign({}, extra, {
                switch_pm_text: "я не нашел твою мангу :(",
                switch_pm_parameter: "add_manga",
                // cache_time: 0,
            });
        }
        // отправляем answer
        return ctx.answerInlineQuery(results, extra);
    } catch (err) {
        console.error(err);
    }
};

function getQueryData(ctx, query) {
    const chatId = getChatId(ctx);
    const indx = query.indexOf(":");
    let genre = "";
    let text = query;
    if (indx !== -1) {
        genre = query.slice(0, indx).toLowerCase().trim();
        text = query.slice(indx + 1).trim();
    }

    return { chatId, genre, text };
}