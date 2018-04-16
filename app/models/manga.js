const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const autoIncrement = require("mongoose-auto-increment");

const MangaSchema = mongoose.Schema({
    name: { type: String, required: true },
    title: { type: String, required: true },
    url: { type: String, required: true, unique: true },
    popularity: { type: Number, required: true, index: true },
    rss: { type: String, required: true },
    image: { type: String, required: true },
    thumb: { type: String, required: true },
    description: { type: String, default: "" },
    mangaId: { type: Number, unique: true },
    genres: [String],
    subscribers: [{
        user: { type: Number, index: true },
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
        .select("-subscribers")
        .sort("-popularity")
        .limit(1);
    return manga;
};

MangaSchema.statics.getMangaAndCheckSub = async function(query = {}, userId) {
    const [manga = null] = await this.aggregate([
        { $match: query },
        {
            $project: {
                _id: 1,
                name: 1,
                title: 1,
                url: 1,
                mangaId: 1,
                image: 1,
                genres: 1,
                description: 1,
                subscriber: { $in: [userId, "$subscribers.user"] },
            },
        },
    ]);

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

MangaSchema.statics.searchManga = function({ text, genre }, page = 1, limit = 25) {
    const pattern = new RegExp(text, "i");
    const req = { $or: [{ name: pattern }, { title: pattern }] };
    if (genre.length) req["genres"] = genre;

    return this.paginate(req, {
        select: "-lastChapter -subscribers",
        sort: "-popularity",
        limit,
        page,
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

MangaSchema.statics.checkSubscribe = async function(userId, mangaId) {
    const [manga = null] = await this.find({ _id: mangaId, "subscribers.user": userId })
        .select("_id name")
        .limit(1);

    return manga;
};

MangaSchema.statics.subscribeToManga = function(userId, mangaId) {
    return this.findOneAndUpdate({ _id: mangaId }, {
        $push: { subscribers: { user: userId } },
    }, { select: "name title url publicId mangaId" });
};

MangaSchema.statics.unsubscribeToManga = function(userId, mangaId) {
    return this.findOneAndUpdate({ _id: mangaId }, {
        $pull: { subscribers: { user: userId } },
    }, { select: "name title url publicId mangaId" });
};

module.exports = mongoose.model("Manga", MangaSchema);