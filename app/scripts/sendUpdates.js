const Extra = require("telegraf/extra");

module.exports = (bot) => (data) => {
    for (let item of data) {
        let { message, users } = item;
        sendUpdates(bot, message, users);
    }
};

function sendUpdates(bot, message, users) {
    let indx = setInterval(() => {
        if (!users.length) return clearInterval(indx);
        let userId = users.pop();
        bot.telegram.sendMessage(userId, message, Extra.HTML().webPreview(false));
    }, 1000 * 5);
}