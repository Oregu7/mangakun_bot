const LocalSession = require("telegraf-session-local");
const sessionDB = new LocalSession({ database: "session_db.json" });

module.exports = sessionDB;