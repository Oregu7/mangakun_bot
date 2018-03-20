const fs = require("fs");
const ip = require("ip");
const bot = require("./app/bot");
//start bot
if (process.env.NODE_ENV === "development")
    bot.startPolling();
else {
    const port = 8443;
    // TLS options
    const tlsOptions = {
        key: fs.readFileSync("./webhook_pkey.pem"),
        cert: fs.readFileSync("./webhook_cert.pem"),
    };

    // Set telegram webhook
    bot.telegram.setWebhook(`https://${ip.address()}:${port}/bot-mangakun`, {
        source: fs.readFileSync("./webhook_cert.pem"),
    });

    // Start https webhook
    bot.startWebhook("/bot-mangakun", tlsOptions, port);
}