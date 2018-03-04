const Extra = require("telegraf/extra");
const MangaModel = require("../../models/manga");
const mangaManager = require("../../helpers/mangaManager");

module.exports = async(ctx) => {
    const manga = await MangaModel.getManga({ _id: ctx.state.payload });
    return ctx.editMessageText(mangaManager.getMessage(manga), Extra.HTML()
        .markup(mangaManager.getKeyboard(manga)));
};