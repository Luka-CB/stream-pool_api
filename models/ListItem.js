const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const listItemSchema = mongoose.Schema(
  {
    contentId: { type: mongoose.Schema.Types.ObjectId, ref: "Content" },
    listId: { type: mongoose.Schema.Types.ObjectId, ref: "List" },
  },
  {
    timestamps: true,
  }
);

listItemSchema.plugin(mongoosePaginate);

const ListItem = mongoose.model("ListItem", listItemSchema);

module.exports = ListItem;
