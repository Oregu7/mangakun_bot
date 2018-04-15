const Extra = require("telegraf/extra");
const { compileMessage } = require("../utils");

module.exports = (ctx) => {
    const message = `Мы рекомендуем вам изучить ответы на вопросы в <a href="http://telegra.ph/Spravka-Mangakun-Bot-03-23">справке</a>. 
    Это позволит вам избежать недоразумений при использовании бота.

    Если же вы изучили справку и не нашли ответа на возникший у вас вопрос, то вы всегда можете обратиться к нам в техподдержку используя @botodojo_bot

    Используйте эти команды, чтобы управлять ботом:
    
    <b>Манга</b>
    /search - поиск манги
    /add - добавить мангу в базу
    /manga - список Ваших подписок
    /genres - список жанров

    <b>Помощь</b>
    /help - справка
    /feedback - связаться с нами
    
    /rate - оценить бот`;

    return ctx.reply(compileMessage(message), Extra.HTML());
};