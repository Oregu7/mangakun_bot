const mongoose = require("mongoose");
const shortid = require("shortid");
const mongoosePaginate = require("mongoose-paginate");
const UserModel = require("./user");

const MangaSchema = mongoose.Schema({
    name: { type: String, required: true },
    title: { type: String, required: true },
    url: { type: String, required: true, unique: true },
    popularity: { type: Number, required: true, index: true },
    rss: { type: String, required: true },
    image: { type: String, required: true },
    thumb: { type: String, required: true },
    description: { type: String, default: "" },
    publicId: {
        type: String,
        unique: true,
        default: shortid.generate,
    },
    genres: [String],
    subscribers: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        date: { type: Date, default: Date.now },
    }],
});

MangaSchema.plugin(mongoosePaginate);

MangaSchema.virtual("lastChapter", {
    ref: "Chapter",
    localField: "_id",
    foreignField: "manga_id",
    justOne: true,
    options: {
        select: "number url title imagesID",
        sort: "-number",
    },
});

MangaSchema.virtual("firstChapter", {
    ref: "Chapter",
    localField: "_id",
    foreignField: "manga_id",
    justOne: true,
    options: {
        select: "number url title imagesID",
        sort: "number",
    },
});

MangaSchema.statics.getManga = async function(query = {}) {
    const [manga = null] = await this.find(query)
        .select("-lastChapter -subscribers")
        .sort("-popularity")
        .limit(1);
    return manga;
};

MangaSchema.statics.getMangaAndLastChapter = function(query = {}, mangaLimit) {
    return this.find(query)
        .populate("lastChapter")
        .populate({
            path: "subscribers.user",
            select: "userId",
        })
        .limit(mangaLimit);
};

MangaSchema.statics.searchManga = function(text, limit = 25) {
    const pattern = new RegExp(text, "i");
    return this
        .find({ $or: [{ name: pattern }, { title: pattern }] })
        .select("-lastChapter -subscribers")
        .sort("-popularity")
        .limit(limit);
};

MangaSchema.statics.checkSubscribe = function(userId, publicId) {
    return this.findOne({ publicId })
        //.select("subscribers name url")
        .select({
            name: 1,
            url: 1,
            subscribers: { $elemMatch: { user: userId } },
        });
    //.where("subscribers.user", { $elemMatch: userId });
};

MangaSchema.statics.getUserSubscribes = function(userId, page = 1, limit = 10) {
    return this.paginate({ "subscribers.user": userId }, {
        sort: "-subscribers.date",
        select: "name title url publicId",
        page,
        limit,
    });
};

module.exports = mongoose.model("Manga", MangaSchema);