const getUserId = require("../utills/getUserId");
const allowedUsers = [322349523, 468245981];

module.exports = () => (ctx, next) => {
    const userId = getUserId(ctx);
    if (allowedUsers.indexOf(userId) !== -1) return next(ctx);
};