const asyncHandler = require("express-async-handler");
const Comment = require("../models/Comment");
const Reply = require("../models/Reply");
const Color = require("../models/Color");

// CREATE NEW COMMENT
// ROUTE - POST - /api/comment/create
// PRIVATE - USER
const createComment = asyncHandler(async (req, res) => {
  const { text, contentId, user } = req.body;

  const colors = await Color.find();
  const randomNum = Math.floor(Math.random() * colors.length);
  const randomColor = colors[randomNum];

  const newComment = await Comment.create({
    text,
    user,
    contentId,
    avatarBgColor: randomColor.color,
    avatarTextColor: randomColor.textColor,
  });
  if (!newComment) throw new Error("Add new comment request has failed!");

  res.status(200).json(newComment);
});

// GET COMMENTS
// ROUTE - GET - /api/comment/fetch-all
// PUBLIC
const getComments = asyncHandler(async (req, res) => {
  const { contentId } = req.query;

  const count = await Comment.countDocuments({ contentId });
  const comments = await Comment.find({ contentId })
    .populate("replies")
    .sort({ createdAt: -1 });
  if (!comments) throw new Error("Get Comments Request has Failed!");

  res.status(200).json({ comments, count });
});

// GET COMMENT BY ID
// ROUTE - GET - /api/comment/:id
// PRIVATE - USER
const getComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const comment = await Comment.findById(id).select("text");
  if (!comment) throw new Error("Get Comment Request has Failed!");
  res.status(200).json(comment);
});

// GET SOME USER COMMENTS
// ROUTE - GET - /api/comment/fetch-some
// PRIVATE - USER
const getSomeUserComments = asyncHandler(async (req, res) => {
  const count = await Comment.countDocuments({ "user._id": req.user._id });

  const comments = await Comment.find({ "user._id": req.user._id })
    .limit(3)
    .select("_id text contentId replies createdAt updatedAt")
    .populate("contentId", "title")
    .sort({ createdAt: -1 })
    .exec();
  if (!comments) throw new Error("Get Comment Request has Failed!");

  const modifiedComments = comments.map((comment) => {
    const repliesCount = comment.replies.length;

    return { ...comment._doc, replies: repliesCount };
  });

  res.status(200).json({ comments: modifiedComments, count });
});

// GET ALL USER COMMENTS
// ROUTE - GET - /api/comment/fetch-some
// PRIVATE - USER
const getAllUserComments = asyncHandler(async (req, res) => {
  const { sort } = req.query;

  const count = await Comment.countDocuments({ "user._id": req.user._id });

  const sortVal =
    sort === "asc"
      ? { createdAt: 1 }
      : sort === "desc"
      ? { createdAt: -1 }
      : { createdAt: 1 };

  const comments = await Comment.find({ "user._id": req.user._id })
    .select("_id text contentId replies createdAt updatedAt")
    .populate("contentId", "title")
    .sort(sortVal)
    .exec();
  if (!comments) throw new Error("Get Comments Request has Failed!");

  const modifiedComments = comments.map((comment) => {
    const repliesCount = comment.replies.length;

    return { ...comment._doc, replies: repliesCount };
  });

  res.status(200).json({ comments: modifiedComments, count });
});

// UPDATE COMMENT
// ROUTER - PUT - /api/comment/update
// PRIVATE - USER
const updateComment = asyncHandler(async (req, res) => {
  const { commentId, text } = req.body;

  const updatedComment = await Comment.updateOne({ _id: commentId }, { text });
  if (!updatedComment) throw new Error("Update Comment Request has Failed!");
  res.status(200).json({ msg: "Updated Successfully!" });
});

// DELETE COMMENT
// ROUTE - DELETE - /api/comment/delete/:commentId
// PRIVATE - USER
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);

  if (comment.replies.length > 0) {
    await Reply.deleteMany({ _id: { $in: comment.replies } });
  }

  const deletedComment = await Comment.deleteOne({ _id: commentId });
  if (!deletedComment) throw new Error("Delete Comment Request has Failed!");

  res.status(200).json({ msg: "Deleted Successfully!" });
});

module.exports = {
  createComment,
  getComments,
  getComment,
  getSomeUserComments,
  getAllUserComments,
  updateComment,
  deleteComment,
};
