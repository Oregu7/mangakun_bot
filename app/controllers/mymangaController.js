const { myMangaHandler } = require("../handlers");

module.exports = async(ctx) => {
    const { message, options, empty } = await myMangaHandler(ctx);
    if (empty) return ctx.reply("Вы еще не подписались ни на один тайтл!\nВоспользуйтесь командой: /search");
    return ctx.reply(message, options);
};