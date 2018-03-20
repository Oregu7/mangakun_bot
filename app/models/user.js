const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    userId: { type: Number, required: true, unique: true },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    username: { type: String, default: "" },
    isBot: { type: Boolean, default: false },
    languageCode: { type: String, default: "ru" },
    created_at: { type: Date, default: Date.now },
});

UserSchema.statics.createByContext = async function(ctx) {
    const {
        id: userId,
        is_bot: isBot,
        first_name: firstName,
        last_name: lastName,
        username,
        language_code: languageCode,
    } = ctx.from;

    const user = await this.findOne({ userId });
    if (user) return user;

    return this.create({
        userId,
        isBot,
        firstName,
        lastName,
        username,
        languageCode,
    });
};

module.exports = mongoose.model("User", UserSchema);