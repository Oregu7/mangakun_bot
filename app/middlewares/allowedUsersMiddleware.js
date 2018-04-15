const { getData } = require("../utils").localSessionManager;

module.exports = () => (ctx, next) => {
    if (ctx.session.allowed || getData(ctx, "allowed")) return next(ctx);
};