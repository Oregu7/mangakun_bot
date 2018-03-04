const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");
const ChapterModel = require("../../models/chapter");
const Pagination = require("../../helpers/pagination");

const pagination = new Pagination("ch_page");

module.exports = async(ctx) => {
    const [page, mangaID] = ctx.state.payload.split(";");
    const chapters = await ChapterModel.paginate({ manga_id: mangaID }, {
        sort: { number: -1 },
        page: Number(page),
        limit: 30,
        select: "-imagesURL -imagesID -manga_id",
    });

    const message = chapters.docs.map((chapter, indx) =>
        `${indx + 1}) <a href = "${chapter.url}">${chapter.title}</a>`
    ).join("\n");

    const keyboard = Markup.inlineKeyboard([
        pagination.generatePages(mangaID, chapters.page, chapters.pages), [Markup.callbackButton("\u{1F519}НАЗАД", `back:${mangaID}`)],
    ]);
    ctx.editMessageText(message, Extra.HTML().webPreview(false).markup(keyboard));
};