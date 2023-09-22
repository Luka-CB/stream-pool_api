const mongoose = require("mongoose");

const replySchema = mongoose.Schema(
  {
    text: { type: String, required: true },
    commentId: String,
    replier: {
      _id: { type: String, default: "" },
      name: { type: String, default: "anonymous" },
    },
    replyTo: { type: String, default: "" },
  },
  { timestamps: true }
);

const Reply = mongoose.model("Reply", replySchema);

module.exports = Reply;
