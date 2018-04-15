const { admins } = require("config").get("base");
const getUserId = require("./getUserId");

module.exports = (ctx) => {
    const userId = getUserId(ctx);
    return admins.indexOf(userId) !== -1 ? true : false;
};