const mongoose = require("mongoose");
const shortid = require("shortid");

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
    publicId: {
        type: String,
        unique: true,
        default: shortid.generate,
    },
    subscribers: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        date: { type: Date, default: Date.now },
    }],
});

MangaSchema.virtual("chapters", {
    ref: "Chapter",
    localField: "_id",
    foreignField: "manga_id",
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

MangaSchema.statics.checkSubscribe = function(userId, publicId) {
    return this.findOne({ publicId })
        .select("subscribers name url")
        .populate({
            path: "subscribers.user",
            match: { _id: userId },
            limit: 1,
            select: "username",
        });
};

MangaSchema.statics.getUserSubscribes = function(userId) {
    return this.find({ "subscribers.user": userId })
        .sort("-subscribers.date")
        .select("name title url publicId description genres");
};

module.exports = mongoose.model("Manga", MangaSchema);