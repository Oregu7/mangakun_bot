const mongoose = require("mongoose");

const ChapterSchema = mongoose.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true, unique: true },
    pubdate: { type: Date, default: "" },
    number: { type: Number, required: true },
    imagesURL: [{
        src: { type: String, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
    }],
    imagesID: [Number],
});


module.exports = mongoose.model("Chapter", ChapterSchema);