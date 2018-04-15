const FeedParser = require("feedparser");
const request = require("request"); // for fetching the feed

/*
    получаем данные из rss-ленты
    @url [string] - ссылка на rss-ленту из которой будут доставаться данные
    @desc [boolean] - опциональный параметр. Отвечает за добавление свойства description в item list (по умолчанию title, url) 
*/

module.exports = (url, { desc = false, date = false } = {}) =>
    new Promise((resolve, reject) => {
        const result = [];
        const req = request({
            //proxy: "http://216.1.75.152:80",
            headers: {
                "User-Agent": "Mozilla/5.0 (X11; U; Linux x86_64; ru; rv:1.9.1.1) Gecko/20090730 Gentoo Firefox/3.5.1",
            },
            uri: url,
        });
        const feedparser = new FeedParser();

        req.on("error", (error) => {
            console.error(error);
            reject(error);
        });

        req.on("response", function(res) {
            let stream = this;
            if (res.statusCode !== 200) {
                console.log(res.statusCode);
                stream.emit("error", new Error("Bad status code"));
            } else {
                stream.pipe(feedparser);
            }
        });

        feedparser.on("error", (error) => {
            console.error(error);
            reject(error);
        });

        feedparser.on("readable", function() {
            var item;
            let stream = this; // `this` is `feedparser`, which is a stream
            while (item = stream.read()) {
                let chapter = { title: item.title, url: item.link };
                if (desc) chapter.description = item.description;
                if (date) chapter.pubdate = item.pubdate;
                result.push(chapter);
            };
        });

        feedparser.on("end", () => {
            resolve(result);
        });
    });