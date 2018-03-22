const isAdmin = require("../utills/isAdmin");

module.exports = (callback) => (ctx) => {
    if (isAdmin(ctx)) return callback(ctx);
};