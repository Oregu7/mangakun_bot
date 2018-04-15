const Extra = require("telegraf/extra");
const { MangaModel } = require("../../models");
const { getMessage, getKeyboard } = require("../../helpers").mangaManager;

module.exports = async(ctx) => {
    const manga = await MangaModel.getManga({ _id: ctx.state.payload });
    return ctx.editMessageText(getMessage(manga), Extra.HTML()
        .markup(getKeyboard(manga)));
};