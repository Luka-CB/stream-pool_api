const asyncHandler = require("express-async-handler");
const Rating = require("../models/Rating");
const Content = require("../models/Content");

// CREATE NEW RATING
// ROUTE - POST - /api/rating/create
// PRIVATE - USER
const createRating = asyncHandler(async (req, res) => {
  const { rateNum, contentId } = req.body;

  const ratings = await Rating.find({ content: contentId });

  // Creating or Updating Rating

  const ratingExists = ratings.find(
    (rt) => rt.user.toString() === req.user._id.toString()
  );

  let result;

  if (ratingExists) {
    const filter = { _id: ratingExists._id };
    const update = { value: rateNum };
    result = await Rating.findOneAndUpdate(filter, update);
  } else {
    result = await Rating.create({
      value: rateNum,
      user: req.user._id,
      content: contentId,
    });
  }

  if (!result) throw new Error("Something Went Wrong!");

  // Calculating and Updating avgRating and count Fields in the Content Model

  const countRating = await Rating.countDocuments({ content: contentId });
  const updatedRatings = await Rating.find({ content: contentId });

  const nums = updatedRatings.map((rt) => rt.value);

  const avg =
    nums.reduce((acc, val) => {
      return acc + val;
    }, 0) / nums.length;

  const avgRatingFillter = { _id: contentId };
  const avgRatingUpdate = { rating: { avgRating: avg, count: countRating } };

  const updateAvgRating = await Content.findOneAndUpdate(
    avgRatingFillter,
    avgRatingUpdate
  );

  if (!updateAvgRating)
    throw new Error("Update Average Rating Request has Failed!");

  res.status(200).json({ msg: "Rated Successfully!" });
});

// GET RATING
// ROUTER - GET - /api/rating/:id
// PRIVATE - USER
const getRating = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const rating = await Rating.findOne({
    user: req.user._id,
    content: id,
  });

  if (!rating) {
    res.status(200).json({ msg: "not rated" });
  } else {
    res.status(200).json({ _id: rating._id, rateNum: rating.value });
  }
});

// GET ALL LOGGED IN USER RATINGS
// ROUTE - GET - /api/rating
// PRIVATE - USER
const getRatings = asyncHandler(async (req, res) => {
  const ratings = await Rating.find({ user: req.user._id });

  if (!ratings) throw new Error("Get Ratings Request has Failed!");

  res.status(200).json(ratings);
});

// DELETE RATING
// ROUTE - DELETE - /api/rating/:id
// PRIVATE - USER
const deleteRating = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const dletedRating = await Rating.deleteOne({ _id: id });

  if (!dletedRating) throw new Error("Delete Rating Request has Failed!");

  res.status(200).json({ msg: "Rating Deleted Successfully!" });
});

module.exports = {
  createRating,
  getRating,
  getRatings,
  deleteRating,
};
