const asyncHandler = require("express-async-handler");
const cookie = require("cookie");
const generateToken = require("../config/utils");
const User = require("../models/User");
const Rating = require("../models/Rating");
const Comment = require("../models/Comment");
const Reply = require("../models/Reply");
const Favorite = require("../models/Favorite");
const List = require("../models/List");
const ListItem = require("../models/ListItem");

// REGISTER USER
// ROUTE - POST - /api/users/register
// PUBLIC
const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) throw new Error("User Already Exists!");

  const newUser = await User.create({
    username: username.toLowerCase(),
    email,
    password,
  });

  if (!newUser) throw new Error("Registration has Failed!");

  const token = generateToken(newUser._id);

  res.setHeader(
    "Set-Cookie",
    cookie.serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 60 * 60 * 24 * 7 * 30,
      sameSite: "strict",
      path: "/",
    })
  );

  res.status(200).json({
    id: newUser._id,
    username: newUser.username,
    isAdmin: newUser.isAdmin,
  });
});

// LOGIN USER
// ROUTE - POST - /api/users/login
// PUBLIC
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username: username.toLowerCase() });

  if (!user) throw new Error("This username is incorrect!");
  if (!(await user.matchPassword(password)))
    throw new Error("Password is Incorrect!");

  const token = generateToken(user._id);

  res.setHeader(
    "Set-Cookie",
    cookie.serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 60 * 60 * 24 * 7 * 30,
      sameSite: "strict",
      path: "/",
    })
  );

  res.status(200).json({
    id: user._id,
    username: user.username,
    isAdmin: user.isAdmin,
  });
});

// GET USER PROFILE
// ROUTE - GET - /api/users/profile
// PRIVATE - USER
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "_id username email isAdmin createdAt"
  );

  if (!user) throw new Error("Get User Profile Request has Failed!");

  res.status(200).json(user);
});

// LOGOUT USER
// ROUTE - GET - /api/users/logout
// PRIVATE - USER
const logout = (req, res) => {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      expires: new Date(0),
      sameSite: "strict",
      path: "/",
    })
  );

  res.send("Logged Out");
};

// UPDATE USER
// ROUTE - PUT - /api/users/update
// PRIVATE - USER
const updateUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const user = await User.findById(req.user._id);

  if (user) {
    (user.username = username || user.username),
      (user.email = email || user.email);
    if (password) user.password = password;
  }

  const updatedUser = await user.save();

  if (!updatedUser) throw new Error("Update User Request has Failed!");

  res.status(200).json({ msg: "Updated Successfully!" });
});

// DELETE USER ACCOUNT
// ROUTE - DELETE - /api/users/delete
// PRIVATE - USER
const deleteUser = asyncHandler(async (req, res) => {
  //////// DELETE LISTS AND LISTITEMS ////////
  const lists = await List.find({ userId: req.user._id });
  const listItemIds = lists.map((list) => list.listItems).flat();
  const deletedListItems = await ListItem.deleteMany({
    _id: { $in: listItemIds },
  });
  if (!deletedListItems)
    throw new Error("Delete listitems request has failed!");
  const deletedLists = await List.deleteMany({ userId: req.user._id });
  if (!deletedLists) throw new Error("Delete lists request has failed!");

  //////// DELETE COMMENTS AND REPLIES ////////
  const comments = await Comment.find({ "user._id": req.user._id });
  const replyIds = comments.map((comment) => comment.replies).flat();
  const deletedReplies = await Reply.deleteMany({ _id: { $in: replyIds } });
  if (!deletedReplies) throw new Error("Delete replies request has failed!");
  const deletedComments = await Comment.deleteMany({
    "user._id": req.user._id,
  });
  if (!deletedComments) throw new Error("Delete comments request has failed!");

  //////// DELETE FAVORITE CONTENTS ////////
  const deletedFavorites = await Favorite.deleteMany({ userId: req.user._id });
  if (!deletedFavorites)
    throw new Error("Delete favorites request has failed!");

  //////// DELETE RATINGS ////////
  const deletedRatings = await Rating.deleteMany({ user: req.user._id });
  if (!deletedRatings) throw new Error("Delete ratings request has failed!");

  //////// DELETE USER ////////
  const deletedUser = await User.deleteOne({ _id: req.user._id });
  if (!deletedUser) throw new Error("Delete user request has failed!");

  res.setHeader(
    "Set-Cookie",
    cookie.serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      expires: new Date(0),
      sameSite: "strict",
      path: "/",
    })
  );

  res.status(200).json({ msg: "Deleted Successfully!" });
});

// GET ALL USERS
// ROUTE - GET - /api/users
// PRIVATE - ADMIN
const getUsers = asyncHandler(async (req, res) => {
  const { sort, search, page } = req.query;

  const keyword = search
    ? {
        $or: [
          { username: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  let sortVal;
  if (sort === "asc") {
    sortVal = { createdAt: "asc" };
  } else if (sort === "desc") {
    sortVal = { createdAt: "desc" };
  } else {
    sortVal = { createdAt: "asc" };
  }

  const filter = { ...keyword };
  const options = {
    sort: sortVal,
    page: page || 1,
    limit: 30,
  };

  const users = await User.paginate(filter, options);
  if (!users) throw new Error("Get Users Request has Failed!");

  res.status(200).json(users);
});

// EDiT USER BY ID
// ROUTE - PUT - /api/users/edit
// PRIVATE - ADMIN
const adminEditUser = asyncHandler(async (req, res) => {
  const { id, username, email, isAdmin } = req.body;

  const user = await User.findById(id);

  if (user) {
    user.username = username || user.username;
    user.email = email || user.email;
    user.isAdmin = isAdmin;
  }

  const editedUser = await user.save();
  if (!editedUser) throw new Error("Edit User Request has failed!");

  res.status(200).send("success");
});

// ADMIN DELETE USER BY ID
// ROUTE - DELETE - /api/users/admin/delete/:id
// PRIVATE - ADMIN
const adminDeleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const lists = await List.find({ userId: id });
  const listIds = lists.map((li) => li._id);

  await Rating.deleteMany({ user: id });
  await Comment.deleteMany({ user: id });
  await ListItem.deleteMany({ listId: { $in: listIds } });
  await List.deleteMany({ userId: id });

  const deletedUser = await User.deleteOne({ _id: id });
  if (!deletedUser) throw new Error("Delete User Request has Failed!");

  res.status(200).send("success");
});

module.exports = {
  register,
  login,
  getUserProfile,
  logout,
  updateUser,
  deleteUser,
  getUsers,
  adminEditUser,
  adminDeleteUser,
};
