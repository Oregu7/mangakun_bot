const { localSessionManager: { getData }, isAdmin } = require("../utils");

module.exports = () => (ctx, next) => {
    if (isAdmin(ctx) || (ctx.session.allowed || getData(ctx, "allowed")))
        return next(ctx);
};