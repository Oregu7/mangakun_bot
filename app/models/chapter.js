const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const ChapterSchema = mongoose.Schema({
    manga_id: { type: mongoose.Schema.Types.ObjectId, ref: "Manga" },
    title: { type: String, required: true },
    url: { type: String, required: true, unique: true },
    pubdate: { type: Date, default: "" },
    number: { type: Number, required: true },
    cache: [String],
});

ChapterSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Chapter", ChapterSchema);