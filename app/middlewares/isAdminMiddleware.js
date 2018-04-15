const { isAdmin } = require("../utils");

module.exports = (callback) => (ctx) => {
    if (isAdmin(ctx)) return callback(ctx);
};