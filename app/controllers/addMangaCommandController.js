const Extra = require("telegraf/extra");
const { compileMessage } = require("../utils");

module.exports = (ctx) => {
    const message = `\u{2795}<b>Добавление манги</b> - если Вы не смогли найти нужную мангу 
    с помощью комманды /search, не унывайте !

    Просто отправьте мне <b>ссылку</b> на мангу с сайта: http://readmanga.me
    
    <b>Пример</b>
    http://readmanga.me/tower_of_god - бот добавит в нашу базу мангу <i>Tower of God</i>`;

    return ctx.reply(compileMessage(message), Extra.HTML().webPreview(false));
};