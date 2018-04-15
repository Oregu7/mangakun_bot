const Extra = require("telegraf/extra");
const { compileMessage } = require("../utils");

module.exports = (ctx) => {
    const message = `Привет! Если Вам понравился наш бот, пожалуйста оцените его в StoreBot. 

    \u{1F44D} <b>Оценить:</b> <a href = "telegram.me/storebot?start=mangakun_bot">storebot_rate</a>`;
    return ctx.reply(compileMessage(message), Extra.HTML());
};