module.exports = () => (ctx, next) => {
    if (ctx.session.allowed) return next(ctx);
};