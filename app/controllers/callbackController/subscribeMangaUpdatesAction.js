const escape = require("escape-html");
const MangaModel = require("../../models/manga");

module.exports = async(ctx) => {
    // проверяем начал ли user диалог с ботом (/start)
    const publicId = ctx.state.payload;
    const userId = ctx.session.authToken;
    if (!userId) {
        return ctx.answerCbQuery("Чтобы подписаться на обновления, нужно начать диалог с ботом", true, {
            url: `t.me/mangakun_bot?start=${publicId}`,
        });
    }
    // достаем мангу, подписчиков фильтруем по id-пользователя
    const manga = await MangaModel.checkSubscribe(userId, publicId);
    if (manga.subscribers.length) return ctx.answerCbQuery("Вы уже подписаны на эту мангу!", true);
    // подписываемся на обновления
    manga.subscribers.push(userId);
    let ok = await manga.save();
    return ctx.answerCbQuery(`Вы подписались на мангу - [${escape(manga.name)}]!`, true);
};