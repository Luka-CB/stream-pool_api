const asyncHandler = require("express-async-handler");
const Reply = require("../models/Reply");
const Comment = require("../models/Comment");

// ADD NEW REPLY
// ROUTE - POST - /api/reply/create
// PUBLIC
const addReply = asyncHandler(async (req, res) => {
  const { text, commentId, replier, replyTo } = req.body;

  const newReply = await Reply.create({
    text,
    commentId,
    replier,
    replyTo,
  });
  if (!newReply) throw new Error("Add new reply request has failed!");

  await Comment.updateOne(
    { _id: newReply.commentId },
    { $push: { replies: newReply._id } }
  );

  res.status(200).json(newReply);
});

// GET REPLIES
// ROUTE - GET - /api/reply/fetch-all/:commentId
// PUBLIC
const getReplies = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const replies = await Reply.find({ commentId }).sort({ createdAt: -1 });
  if (!replies) throw new Error("Get replies request has failed!");

  res.status(200).json(replies);
});

// UPDATE REPLY
// ROUTE - PUT - /api/reply/update
// PRIVATE - USER
const updateReply = asyncHandler(async (req, res) => {
  const { replyId, text } = req.body;

  const updatedReply = await Reply.updateOne({ _id: replyId }, { text });
  if (!updatedReply) throw new Error("Update reply request has failed!");

  res.status(200).json({ msg: "Updated Successfully!" });
});

// DELETE REPLY
// ROUTE - DELETE - /api/reply/delete
// PRIVATE - USER
const deleteReply = asyncHandler(async (req, res) => {
  const { commentId, replyId } = req.query;

  await Comment.updateOne({ _id: commentId }, { $pull: { replies: replyId } });

  const deletedReply = await Reply.deleteOne({ _id: replyId });
  if (!deletedReply) throw new Error("Delete reply request has failed!");

  res.status(200).json({ msg: "Deleted Successfully!" });
});

module.exports = {
  addReply,
  getReplies,
  updateReply,
  deleteReply,
};
