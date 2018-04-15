const localSession = require("./localSession");

function createKey(ctx) {
    const userId = ctx.from.id;
    return `${userId}:${userId}`;
}

function getSession(ctx) {
    const key = createKey(ctx);
    const session = localSession.getSession(key);
    return session;
}

function getData(ctx, value) {
    const session = getSession(ctx);
    return session[value];
}

module.exports = {
    createKey,
    getSession,
    getData,
};