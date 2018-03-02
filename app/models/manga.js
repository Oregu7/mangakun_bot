const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MangaSchema = mongoose.Schema({
    name: { type: String, required: true },
    title: { type: String, required: true },
    url: { type: String, required: true, unique: true },
    popularity: { type: Number, required: true, index: true },
    rss: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    thumb: { type: String, required: true },
    description: { type: String, default: "" },
    genres: [String],
    chapters: [{ type: Schema.Types.ObjectId, ref: "Chapter" }],
    subscribers: [{ type: Number, index: true }],
});


module.exports = mongoose.model("Manga", MangaSchema);