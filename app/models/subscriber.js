const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const SubscriberSchema = mongoose.Schema({
    manga: { type: mongoose.Schema.Types.ObjectId, ref: "Manga" },
    user: { type: Number, required: true, index: true },
    date: { type: Date, default: Date.now },
});
SubscriberSchema.plugin(mongoosePaginate);

SubscriberSchema.statics.checkSubscribe = async function(userId, mangaId) {
    const [subscriber = null] = await this
        .find({ manga: mangaId, user: userId })
        .populate({
            path: "manga",
            select: "_id name title url mangaId",
        })
        .limit(1); 
    return subscriber;
};

SubscriberSchema.statics.getUserSubscribes = function(userId, page = 1, limit = 10) {
    return this.paginate({ "user": userId }, {
        sort: "-date",
        populate: {
            path: "manga",
            select: "name title url mangaId",
        },
        page,
        limit,
    });
};

SubscriberSchema.subscribeToManga = function(userId, mangaId) {
    return this.create({ user: userId, manga: mangaId });
};

SubscriberSchema.unsubscribeToManga = function(userId, mangaId) {
    return this.remove({ user: userId, manga: mangaId });
};

module.exports = mongoose.model("Subscriber", SubscriberSchema);