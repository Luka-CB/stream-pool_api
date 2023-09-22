const router = require("express").Router();
const { getGenres } = require("../controllers/misc");

router.route("/fetch-genres").get(getGenres);

module.exports = router;
