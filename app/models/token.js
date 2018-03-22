const mongoose = require("mongoose");

const TokenSchema = mongoose.Schema({
    source: {
        type: String,
        required: true,
        unique: true,
        maxlength: 33,
        minlength: 33,
    },
    authorId: { type: Number, required: true },
    used: { type: Boolean, default: false },
    userId: { type: Number, default: null },
    rules: { type: String, default: "all" },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Token", TokenSchema);