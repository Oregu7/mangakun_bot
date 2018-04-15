function getId (type, ctx) {
    const { message, update } = ctx;
    if (message) return message[type].id;
    else {
        const { callback_query, inline_query } = update;
        return callback_query ? callback_query[type].id : inline_query ? inline_query[type].id : "unsupported";
    }
}

exports.getUserId = getId.bind(null, "from");
exports.getChatId = getId.bind(null, "chat");