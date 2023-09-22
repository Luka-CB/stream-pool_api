const express = require("express");
const {
  createComment,
  getComments,
  getComment,
  updateComment,
  deleteComment,
  getSomeUserComments,
  getAllUserComments,
} = require("../controllers/comment");
const { auth } = require("../middlewares/auth");

const router = express.Router();

router.route("/fetch-all").get(getComments);
router.route("/fetch-some").get(auth, getSomeUserComments);
router.route("/user/fetch-all").get(auth, getAllUserComments);
router.route("/create").post(createComment);
router.route("/update").put(auth, updateComment);
router.route("/delete/:commentId").delete(auth, deleteComment);
router.route("/:id").get(auth, getComment);

module.exports = router;
