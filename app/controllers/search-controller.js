const Markup = require("telegraf/markup");

module.exports = (ctx) => {
    const message = "Нажмите - \u{1F50D}Поиск, чтобы найти интересующую Вас мангу.";
    return ctx.reply(message, Markup.inlineKeyboard([
        Markup.switchToCurrentChatButton("\u{1F50D}Поиск", ""),
    ]).extra());
};