const mongoose = require("mongoose");

const commentSchema = mongoose.Schema(
  {
    text: { type: String, required: true },
    user: {
      _id: { type: String, default: "" },
      username: { type: String, default: "anonymous" },
    },
    contentId: { type: mongoose.Schema.Types.ObjectId, ref: "Content" },
    avatarBgColor: { type: String, default: "#95f739" },
    avatarTextColor: { type: String, default: "dark" },
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reply" }],
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
