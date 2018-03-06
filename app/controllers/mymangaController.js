const MangaModel = require("../models/manga");

module.exports = async(ctx) => {
    const userId = ctx.session.authToken;
    let mangaList = await MangaModel.getUserSubscribes(userId);
    console.log(mangaList);
    ctx.reply(mangaList.length);
};