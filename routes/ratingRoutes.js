const express = require("express");
const {
  createRating,
  getRating,
  getRatings,
  deleteRating,
} = require("../controllers/rating");
const { auth } = require("../middlewares/auth");

const router = express.Router();

router.route("/").get(auth, getRatings);
router.route("/create").post(auth, createRating);
router.route("/:id").get(auth, getRating).delete(auth, deleteRating);
module.exports = router;
