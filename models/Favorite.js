const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const favoriteSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    contentId: { type: mongoose.Schema.Types.ObjectId, ref: "Content" },
  },
  {
    timestamps: true,
  }
);

favoriteSchema.plugin(mongoosePaginate);

const Favorite = mongoose.model("Favorite", favoriteSchema);

module.exports = Favorite;
