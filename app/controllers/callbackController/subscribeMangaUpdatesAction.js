const escape = require("escape-html");
const MangaModel = require("../../models/manga");
const localSession = require("../../utills/localSession");

module.exports = async(ctx) => {
    // проверяем начал ли user диалог с ботом (/start)
    const mangaId = Number(ctx.state.payload);
    const userId = ctx.session.authToken || getAuthToken(ctx);
    if (!userId) {
        return ctx.answerCbQuery("Чтобы подписаться на обновления, нужно начать диалог с ботом", true, {
            url: `t.me/mangakun_bot?start=${mangaId}`,
        });
    }
    // достаем мангу, подписчиков фильтруем по id-пользователя
    const manga = await MangaModel.checkSubscribe(userId, mangaId);
    if (manga.subscribers.length) return ctx.answerCbQuery("Вы уже подписаны на эту мангу!", true);
    // подписываемся на обновления
    await MangaModel.update({ _id: manga._id }, { $push: { subscribers: { user: userId } } });
    return ctx.answerCbQuery(`Вы подписались на мангу - [${escape(manga.name)}]!`, true);
};

function getAuthToken(ctx) {
    const userId = ctx.from.id;
    const key = `${userId}:${userId}`;
    const { authToken } = localSession.getSession(key);
    return authToken;
}