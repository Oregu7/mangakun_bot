const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");
const moment = require("moment");
const ChapterModel = require("../../models/chapter");
const MangaModel = require("../../models/manga");
const compileMessage = require("../../helpers/compileMessage");
const Pagination = require("../../helpers/pagination");
const { BackToMangaAction, MangaPaginationAction } = require("config").get("constants");

const pagination = new Pagination(MangaPaginationAction);
moment.locale("ru");

module.exports = async(ctx) => {
    // получаем главы манги
    const [page, mangaID] = ctx.state.payload.split(";");
    // временно, потом для каждой главы будем сразу формировать publicId
    const manga = await MangaModel.findById(mangaID).select("publicId");
    // достаем главы
    const chapters = await ChapterModel.paginate({ manga_id: manga._id }, {
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
        let text = `${number}) <b>${chapter.title}</b>
        <code>${moment(chapter.pubdate).format("L LT")}</code>
        \u{1F4D9}Читать: <a href="${chapter.url}">ссылка</a>
        \u{23EC}Скачать: /download_${manga.publicId}_${chapter.number}`;
        return text;
    }).join("\n\n");

    const keyboard = Markup.inlineKeyboard([
        pagination.createPagesInlineKeyboard(mangaID, chapters.page, chapters.pages), [pagination.createBackButton(BackToMangaAction, mangaID)],
    ]);

    return ctx.editMessageText(compileMessage(message), Extra.HTML()
        .webPreview(false)
        .markup(keyboard));
};