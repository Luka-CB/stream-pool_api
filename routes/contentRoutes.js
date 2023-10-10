const express = require("express");
const {
  addNewContent,
  getMovies,
  getTvs,
  getSingleContent,
  getContentBySearch,
  updateContent,
  deleteContent,
  updateVideoUrl,
  updatePoster,
  getSomeRatedContent,
  getSomeFavContent,
  getAllRatedContent,
  getAllFavContent,
  getListItems,
  getListItemsBySearch,
  getLatestTvs,
  getLatestMovies,
} = require("../controllers/content");
const { auth, admin } = require("../middlewares/auth");

const router = express.Router();

router.route("/").post(auth, admin, addNewContent);
router.route("/search").get(getContentBySearch);
router.route("/movies").get(getMovies);
router.route("/tvs").get(getTvs);
router.route("/tvs/latest").get(getLatestTvs);
router.route("/movies/latest").get(getLatestMovies);
router.route("/update_url").put(auth, admin, updateVideoUrl);
router.route("/update_poster").put(auth, admin, updatePoster);
router.route("/fetch-one").get(getSingleContent);
router.route("/rated/fetch-some").get(auth, getSomeRatedContent);
router.route("/rated/fetch-all").get(auth, getAllRatedContent);
router.route("/fav/fetch-some").get(auth, getSomeFavContent);
router.route("/fav/fetch-all").get(auth, getAllFavContent);
router.route("/listitem/fetch-all").get(auth, getListItems);
router.route("/listitem/search").get(auth, getListItemsBySearch);
router.route("/delete/:contentId").delete(auth, admin, deleteContent);
router.route("/:id").put(auth, admin, updateContent);

module.exports = router;
