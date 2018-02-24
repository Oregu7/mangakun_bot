const { scrap } = require("./scraper");

scrap("http://readmanga.me/sheng_wang/vol1/2").then(($) => {
    const images = $("script").text();
    // .map((_, el) => $(el).attr("src")).get();
    console.log(images);
});