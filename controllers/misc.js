const asyncHandler = require("express-async-handler");
const Genre = require("../models/Genre");

// GET GENRES
// ROUTE - GET - /api/misc/fetch-genres
// PUBLIC
const getGenres = asyncHandler(async (req, res) => {
  const genres = await Genre.find();
  if (!genres) throw new Error("Get genres request has failed!");

  res.status(200).json(genres);
});

module.exports = {
  getGenres,
};
