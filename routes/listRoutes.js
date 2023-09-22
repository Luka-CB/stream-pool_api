const express = require("express");
const {
  createList,
  getLists,
  updateList,
  deleteList,
  getSomeUserLists,
  getAllUserLists,
} = require("../controllers/list");
const { auth } = require("../middlewares/auth");

const router = express.Router();

router.route("/lists/:contentId").get(auth, getLists);
router.route("/fetch-some").get(auth, getSomeUserLists);
router.route("/fetch-all").get(auth, getAllUserLists);
router.route("/create").post(auth, createList);
router.route("/update").put(auth, updateList);
router.route("/delete/:listId").delete(auth, deleteList);

module.exports = router;
