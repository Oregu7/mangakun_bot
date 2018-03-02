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

MangaSchema.statics.getManga = function(query = {}) {
    return this.findOne(query)
        .select("-chapters -subscribers")
        .sort("-popularity");
};

MangaSchema.statics.searchManga = function(text) {
    const pattern = new RegExp(text, "i");
    return this
        .find({ $or: [{ name: pattern }, { title: pattern }] })
        .select("-chapters -subscribers")
        .sort("-popularity")
        .limit(30);
};

MangaSchema.statics.findByIdAndPopulateChapters = function(id) {
    return this.findById(id)
        .select("-subscribers")
        .populate({
            path: "chapters",
            select: "title url",
            options: { sort: { number: -1 }, limit: 30 },
        });
};

module.exports = mongoose.model("Manga", MangaSchema);