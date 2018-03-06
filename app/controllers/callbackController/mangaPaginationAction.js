const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");
const moment = require("moment");
const ChapterModel = require("../../models/chapter");
const compileMessage = require("../../helpers/compileMessage");
const Pagination = require("../../helpers/pagination");
const { BackToMangaAction, MangaPaginationAction } = require("config").get("constants");

const pagination = new Pagination(MangaPaginationAction);
moment.locale("ru");

module.exports = async(ctx) => {
    // получаем главы манги
    const [page, mangaID] = ctx.state.payload.split(";");
    const chapters = await ChapterModel.paginate({ manga_id: mangaID }, {
        sort: { number: -1 },
        page: Number(page),
        limit: 20,
        select: "-imagesURL -imagesID -manga_id",
    });
    const factor = (chapters.page - 1) * chapters.limit;
    // проверка на существование глав
    if (!chapters.docs.length) return ctx.answerCbQuery("У этой манги пока нет глав :(", true);

    // формиркем клавиатуру и сообщение
    const message = chapters.docs.map((chapter, indx) => {
        let number = indx + 1 + factor;
        let text = `<b>${number})</b> <a href = "${chapter.url}">${chapter.title}</a>
        \u{1F4C5} <i>${moment(chapter.pubdate).format("LLLL")}</i>`;
        return text;
    }).join("\n");

    const keyboard = Markup.inlineKeyboard([
        pagination.createPagesInlineKeyboard(mangaID, chapters.page, chapters.pages), [pagination.createBackButton(BackToMangaAction, mangaID)],
    ]);

    return ctx.editMessageText(compileMessage(message), Extra.HTML()
        .webPreview(false)
        .markup(keyboard));
};