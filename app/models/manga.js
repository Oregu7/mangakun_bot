const mongoose = require("mongoose");
const shortid = require("shortid");
const mongoosePaginate = require("mongoose-paginate");
const autoIncrement = require("mongoose-auto-increment");
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
    mangaId: { type: Number, unique: true },
    genres: [String],
    subscribers: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        date: { type: Date, default: Date.now },
    }],
});

// подключаем плагины
MangaSchema.plugin(mongoosePaginate);
MangaSchema.plugin(autoIncrement.plugin, {
    model: "Manga",
    field: "mangaId",
    startAt: 25005,
});

// виртуальные поля, доастем последнюю и первую главу
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

// статичные методы
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

MangaSchema.statics.checkSubscribe = function(userId, mangaId) {
    return this.findOne({ mangaId })
        .select({
            name: 1,
            url: 1,
            subscribers: { $elemMatch: { user: userId } },
        });
};

MangaSchema.statics.getUserSubscribes = function(userId, page = 1, limit = 10) {
    return this.paginate({ "subscribers.user": userId }, {
        sort: "-subscribers.date",
        select: "name title url publicId mangaId",
        page,
        limit,
    });
};

module.exports = mongoose.model("Manga", MangaSchema);