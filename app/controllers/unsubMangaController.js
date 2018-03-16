const MangaModel = require("../models/manga");

module.exports = async(ctx) => {
    const publicId = ctx.match[1];
    const userId = ctx.session.authToken;
    // достаем мангу, подписчиков фильтруем по id-пользователя
    const manga = await MangaModel.checkSubscribe(userId, publicId);
    if (!manga) return ctx.reply("Я не нашел мангу с таким идентификатором!");
    if (!manga.subscribers.length) return ctx.reply("Вы уже отписались от этой манги!");
    // отписываемся от обновлений
    await MangaModel.update({ _id: manga._id }, { $pull: { subscribers: { user: userId } } });

    return ctx.reply(`Вы отписались от - [${manga.name}]`);
};