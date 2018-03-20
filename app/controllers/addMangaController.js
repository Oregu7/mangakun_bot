const addMangaHandler = require("../handlers/addMangaHandler");

const readmanga = "http://readmanga.me";
const mintmanga = "http://mintmanga.com";

module.exports = async(ctx) => {
    const [site, mangaName] = ctx.match.slice(3, 5);
    if (site === "readmanga.me") return addMangaHandler(ctx, mangaName, readmanga);
    else if (site === "mintmanga.com") return addMangaHandler(ctx, mangaName, mintmanga);
};