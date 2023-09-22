const asyncHandler = require("express-async-handler");
const Favorite = require("../models/Favorite");

// ADD TO FAVORITE
// ROUTE - POST - /api/favorite/add
// PRIVAtE - USER
const addToFavorite = asyncHandler(async (req, res) => {
  const { contentId } = req.body;

  const exists = await Favorite.findOne({ userId: req.user._id, contentId });

  if (exists) {
    await Favorite.deleteOne({ _id: exists._id });
  } else {
    const addedContent = await Favorite.create({
      userId: req.user._id,
      contentId,
    });

    if (!addedContent) throw new Error("Add to favorite request has failed!");
  }

  res.status(200).json({ msg: "Added Successfully!" });
});

// REMOVE FROM FAVORITE
// ROUTE - DELETE - /api/favorite/delete/:contentId
// PRIVAtE - USER
const deleteFavorite = asyncHandler(async (req, res) => {
  const { contentId } = req.params;

  const deletedFav = await Favorite.deleteOne({
    userId: req.user._id,
    contentId,
  });
  if (!deletedFav) throw new Error("Delete favorite request has failed!");

  res.status(200).json({ msg: "Deleted Successfully!" });
});

module.exports = {
  addToFavorite,
  deleteFavorite,
};
