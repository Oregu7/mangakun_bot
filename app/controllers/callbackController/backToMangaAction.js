const Extra = require("telegraf/extra");
const { ObjectId } = require("mongoose").Types;
const { MangaModel } = require("../../models");
const { getMessage, getKeyboard } = require("../../helpers").mangaManager;
const { getChatId } = require("../../utils").messageManager;

module.exports = async(ctx) => {
    const id = ctx.state.payload;
    const chatId = getChatId(ctx);
    // достаем мангу
    const manga = await MangaModel.getMangaAndCheckSub({ _id: ObjectId(id) }, chatId);
    if (!manga) return ctx.answerCbQuery("Я не нашел мангу с таким идентификатором!");
    // она присутствует в базе
    const message = getMessage(manga);
    const keyboard = getKeyboard(manga);
    return ctx.editMessageText(message, Extra.HTML().markup(keyboard));
};