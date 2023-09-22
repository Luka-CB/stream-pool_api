const express = require("express");
const { createListItem, deleteListItems } = require("../controllers/listItem");
const { auth } = require("../middlewares/auth");

const router = express.Router();

router.route("/create").post(auth, createListItem);
router.route("/delete").delete(deleteListItems);

module.exports = router;
