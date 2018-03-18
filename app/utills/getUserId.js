module.exports = (ctx) => {
    const { message, update } = ctx;
    if (message)
        return ctx.message.chat.id;
    else if (update.callback_query.message)
        return update.callback_query.message.chat.id;
    else
        return update.callback_query.from.id;
};