const escape = require("escape-html");
const MangaModel = require("../../models/manga");
const localSession = require("config").get("localSession");

module.exports = async(ctx) => {
    // проверяем начал ли user диалог с ботом (/start)
    getAuthToken(ctx);
    const publicId = ctx.state.payload;
    const userId = ctx.session.authToken || getAuthToken(ctx);
    if (!userId) {
        return ctx.answerCbQuery("Чтобы подписаться на обновления, нужно начать диалог с ботом", true, {
            url: `t.me/mangakun_bot?start=${publicId}`,
        });
    }
    // достаем мангу, подписчиков фильтруем по id-пользователя
    const manga = await MangaModel.checkSubscribe(userId, publicId);
    if (manga.subscribers.length) return ctx.answerCbQuery("Вы уже подписаны на эту мангу!", true);
    // подписываемся на обновления
    manga.subscribers.push({ user: userId });
    let ok = await manga.save();
    return ctx.answerCbQuery(`Вы подписались на мангу - [${escape(manga.name)}]!`, true);
};

function getAuthToken(ctx) {
    const userId = ctx.from.id;
    const key = `${userId}:${userId}`;
    const { authToken } = localSession.getSession(key);
    return authToken;
}