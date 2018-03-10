const ReadMangaRSS = {
    feed: "http://readmanga.me/rss/index",
    site: "http://readmanga.me",
    match: /(http:\/\/readmanga\.me\/\w+)\/?.*/i,
};

const MintMangaRSS = {
    feed: "http://mintmanga.com/rss/index",
    site: "http://mintmanga.com",
    match: /(http:\/\/mintmanga\.com\/\w+)\/?.*/i,
};

module.exports = {
    ReadMangaRSS,
    MintMangaRSS,
};