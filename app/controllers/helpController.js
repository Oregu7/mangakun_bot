const Extra = require("telegraf/extra");
const compileMessage = require("../helpers/compileMessage");

module.exports = (ctx) => {
    const message = `Мы рекомендуем вам изучить ответы на вопросы в <a href="http://telegra.ph/Spravka-Mangakun-Bot-03-23">справке</a>. 
    Это позволит вам избежать недоразумений при использовании бота.

    Если же вы изучили справку и не нашли ответа на возникший у вас вопрос, то вы всегда можете обратиться к нам в техподдержку используя @MangakunSupportBot

    Используйте эти команды, чтобы управлять ботом:
    
    <b>Манга</b>
    /search - поиск манги
    /addmanga - добавить мангу в базу
    /mymanga - список Ваших подписок
    
    <b>Помощь</b>
    /help - поможем, чем сможем :)
    /feedback - связаться с нами
    
    /rate - оценить бот`;

    return ctx.reply(compileMessage(message), Extra.HTML());
};