const { admins } = require("config").get("base");
const { getUserId } = require("./messageManager");

module.exports = (ctx) => {
    const userId = getUserId(ctx);
    return admins.indexOf(userId) !== -1 ? true : false;
};