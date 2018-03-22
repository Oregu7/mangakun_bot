const Extra = require("telegraf/extra");
const compileMessage = require("../helpers/compileMessage");

module.exports = (ctx) => {
    const message = `<b>Mangakun Bot - </b> это бот, который будет оповещать
    о выходе Вашей любимой <b>манги</b>.
    
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