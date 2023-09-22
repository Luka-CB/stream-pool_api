const mongoose = require("mongoose");

const genreSchema = mongoose.Schema({
  genre: { type: String },
});

const Genre = mongoose.model("Genre", genreSchema);

module.exports = Genre;
