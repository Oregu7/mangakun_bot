const { getData } = require("../utills/localSessionManager");

module.exports = () => (ctx, next) => {
    if (ctx.session.allowed || getData(ctx, "allowed")) return next(ctx);
};