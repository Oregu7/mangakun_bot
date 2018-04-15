const { addMangaHandler } = require("../handlers");

module.exports = async(ctx) => {
    const [siteName, mangaName] = ctx.match.slice(3, 5);
    const site = `http://${siteName}`;
    return addMangaHandler(ctx, mangaName, site);
};