const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const contentSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    startYear: {
      type: String,
      required: true,
    },
    endYear: String,
    description: {
      type: String,
      required: true,
    },
    genres: [String],
    crew: {
      directors: [{ name: String }],
      cast: [{ name: String }],
    },
    posterUrl: {
      type: String,
      required: true,
    },
    imageId: { type: String },
    videoUrl: String,
    type: {
      type: String,
      required: true,
    },
    rating: {
      avgRating: { type: Number, default: null },
      count: { type: Number, default: null },
    },
  },
  { timestamps: true }
);

contentSchema.plugin(mongoosePaginate);

const Content = mongoose.model("Content", contentSchema);

module.exports = Content;
