const express = require("express");
const {
  register,
  logout,
  login,
  getUserProfile,
  updateUser,
  deleteUser,
  getUsers,
  adminEditUser,
  adminDeleteUser,
} = require("../controllers/user");
const { auth, admin } = require("../middlewares/auth");

const router = express.Router();

router.route("/").get(auth, admin, getUsers);
router.route("/admin/delete/:id").delete(auth, admin, adminDeleteUser);
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/profile").get(auth, getUserProfile);
router.route("/logout").get(auth, logout);
router.route("/update").put(auth, updateUser);
router.route("/delete").delete(auth, deleteUser);
router.route("/edit").put(auth, admin, adminEditUser);

module.exports = router;
