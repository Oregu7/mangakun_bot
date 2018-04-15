const Extra = require("telegraf/extra");
const { uid } = require("rand-token");
const { TokenModel } = require("../models");
const startController = require("./startController");
const { getChatId } = require("../utils").messageManager;
const { isAdminMiddleware } = require("../middlewares");

async function generateToken(ctx) {
    const source = uid(33);
    const authorId = getChatId(ctx);
    const token = await TokenModel.create({ source, authorId });
    const message = `\u{2795}Сгенерирован новый <b>токен</b> : <code>${token.source}</code>`;
    return ctx.reply(message, Extra.HTML());
}

async function authorizeByToken(ctx) {
    const source = ctx.message.text;
    const token = await TokenModel.findOne({ source });
    const userId = getChatId(ctx);
    let message = "Увы, но я не нашел Ваш токен!";
    if (token && !token.used) {
        ctx.session.allowed = true;
        token.used = true;
        token.userId = userId;
        token.updated_at = Date.now();
        await token.save();
        return startController(ctx);
    } else if (token && token.used) {
        message = "Данный токен уже использован !";
    }
    return ctx.reply(message);
}

module.exports = {
    generateToken: isAdminMiddleware(generateToken),
    authorizeByToken,
};