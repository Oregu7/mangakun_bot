/* 
    @Поиск манги по жанрам, лол :)
    @Вид поиска @mangakun_bot жанр: [Пишем название манги]

    1)/genres - выводим список inline-кнопок с жанрами
    2) у кнопок параметр switch_inline_query_current_chat = `${genre.name}:`;
    3) в inlinequeryController реализовываем поиск по жанрам:
    - let indx = query.indexOf(":")
    - если находим, то 
        let genre = query.slice(0, indx).toLowerCase().trim(); 
        let manga = query.slice(indx).trim();
    - проверяем список жанров, есть ли там такой
    - далее ищем мангу с учетом данного жанра
    
*/

const Markup = require("telegraf/markup");
const { genres } = require("config").get("base");
module.exports = (ctx) => {
    const message = "Выберете жанр";
    const keyboard = Markup.inlineKeyboard(
        genres.map((genre) => Markup.switchToCurrentChatButton(genre, `${genre}: `)), { columns: 3 });

    return ctx.reply(message, keyboard.extra());
};