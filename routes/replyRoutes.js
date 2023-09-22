const express = require("express");
const {
  addReply,
  getReplies,
  updateReply,
  deleteReply,
} = require("../controllers/reply");
const { auth } = require("../middlewares/auth");

const router = express.Router();

router.route("/create").post(addReply);
router.route("/fetch-all/:commentId").get(auth, getReplies);
router.route("/update").put(auth, updateReply);
router.route("/delete").delete(auth, deleteReply);

module.exports = router;
