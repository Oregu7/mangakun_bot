module.exports = (ctx) => {
    const { message, update } = ctx;
    if (message) return message.from.id;
    else {
        const { callback_query, inline_query } = update;
        return callback_query ? callback_query.from.id : inline_query ? inline_query.from.id : "unsupported";
    }
};