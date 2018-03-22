const Extra = require("telegraf/extra");
const Scene = require("telegraf/scenes/base");
const { leave } = require("telegraf/stage");
const compileMessage = require("../helpers/compileMessage");
const { fromUser, registerAndSendQuestion } = require("../utils");

// config
const questionScene = new Scene("question");
const maxCountMessages = 5;
const commands = {
    send: "Отправить вопрос: /send",
    clear: "Очистить сообщения: /clear",
    del: (messageId) => `Удалить сообщение: /del${messageId}`,
};

// helpers
function getQuestionMessages(ctx) {
    if (!ctx.session.questionMessages) ctx.session.questionMessages = [];
    return ctx.session.questionMessages;
}

function clearQuestionMessages(ctx) {
    if (ctx.session.questionMessages)
        delete ctx.session.questionMessages;
    return true;
}

function getQuestionMessagesSize(questionMessages) {
    return `[${questionMessages.length} из ${maxCountMessages}]`;
}

// base handlers
questionScene.enter((ctx) => {
    if (!fromUser(ctx)) {
        ctx.scene.reset();
        return ctx.reply("Вы не можете задавать вопросы из групповго чата!");
    }
    let message = `В один вопрос вы можете добавить до ${maxCountMessages} сообщений`;
    return ctx.reply(message);
});

questionScene.leave((ctx) => {
    clearQuestionMessages(ctx);
    return ctx.reply("Ну чтож, значит не в этот раз (￢_￢;)");
});

// commands
questionScene.command("cancel", leave());
questionScene.command("send", (ctx) => {
    const questionMessages = getQuestionMessages(ctx);
    if (!questionMessages.length) return ctx.reply("\u{26A0} Вы не добавили ни одного сообщения !");
    // выходим из сцены
    clearQuestionMessages(ctx);
    ctx.scene.reset();
    ctx.reply("Спасибо за Ваш вопрос, мы ответим на него в скором времени!");

    return registerAndSendQuestion(ctx, questionMessages);
});

questionScene.command("clear", (ctx) => {
    clearQuestionMessages(ctx);
    ctx.reply("Ваши сообщения очищены \u{1F5D1}");
});

// handlers
questionScene.hears(/\/del(\d+)/i, (ctx) => {
    const [, messageId] = ctx.match;
    const questionMessages = getQuestionMessages(ctx);
    const indx = questionMessages.indexOf(Number(messageId));
    if (indx == -1) return ctx.reply(`Я не нашел сообщение с данным ID - [${messageId}]`);

    questionMessages.splice(indx, 1);
    let message = `\u{2796}<b>Сообщение удалено</b> - ${getQuestionMessagesSize(questionMessages)}\n
    ${commands.send}`;
    return ctx.replyWithHTML(compileMessage(message), Extra.inReplyTo(messageId));
});

// events
questionScene.on("message", (ctx) => {
    const questionMessages = getQuestionMessages(ctx);
    const { message_id: messageId } = ctx.message;

    if (questionMessages.length < maxCountMessages) {
        questionMessages.push(messageId);
        let message = `\u{2795}<b>Сообщение добавлено</b> - ${getQuestionMessagesSize(questionMessages)}\n
        ${commands.send}
        ${commands.del(messageId)}`;
        return ctx.replyWithHTML(compileMessage(message), Extra.inReplyTo(messageId));
    }

    let message = `\u{26A0} <b>Вы достигли лимита допустимых сообщений !</b>\n
    ${commands.send}
    ${commands.clear}`;
    return ctx.replyWithHTML(compileMessage(message));
});

questionScene.on("edited_message", (ctx) => {
    console.log(ctx);
    ctx.reply("Редактировать сообщения нельзя!");
});

module.exports = questionScene;