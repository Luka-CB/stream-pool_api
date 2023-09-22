const router = require("express").Router();
const { addToFavorite, deleteFavorite } = require("../controllers/favorite");
const { auth } = require("../middlewares/auth");

router.route("/add").post(auth, addToFavorite);
router.route("/delete/:contentId").delete(auth, deleteFavorite);

module.exports = router;
