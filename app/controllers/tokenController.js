const Extra = require("telegraf/extra");
const { uid } = require("rand-token");
const TokenModel = require("../models/token");
const getUserId = require("../utills/getUserId");
const isAdminMiddleware = require("../middlewares/isAdminMiddleware");

async function generateToken(ctx) {
    const source = uid(33);
    const authorId = getUserId(ctx);
    const token = await TokenModel.create({ source, authorId });
    const message = `\u{2795}Сгенерирован новый <b>токен</b> : <code>${token.source}</code>`;
    return ctx.reply(message, Extra.HTML());
}

async function authorizeByToken(ctx) {
    const source = ctx.message.text;
    const token = await TokenModel.findOne({ source });
    const userId = getUserId(ctx);
    let message = "Увы, но я не нашел Ваш токен!";
    if (token && !token.used) {
        message = "Вы авторизованы!\nНажмите, чтобы посмотреть возможности бота: /start";
        ctx.session.allowed = true;
        token.used = true;
        token.userId = userId;
        token.updated_at = Date.now();
        await token.save();
    } else if (token && token.used) {
        message = "Данный токен уже использован !";
    }
    return ctx.reply(message);
}

module.exports = {
    generateToken: isAdminMiddleware(generateToken),
    authorizeByToken,
};