const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const ChapterSchema = mongoose.Schema({
    manga_id: { type: mongoose.Schema.Types.ObjectId, ref: "Manga" },
    title: { type: String, required: true },
    url: { type: String, required: true, unique: true },
    pubdate: { type: Date, default: "" },
    number: { type: Number, required: true },
    imagesURL: [{
        src: { type: String, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
    }],
    imagesID: [String],
});

ChapterSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Chapter", ChapterSchema);