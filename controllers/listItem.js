const asyncHandler = require("express-async-handler");
const ListItem = require("../models/ListItem");
const List = require("../models/List");

// CREATE NEW LIST ITEM
// ROUTE - POST - /api/listitem/create
// PRIVATE - USER
const createListItem = asyncHandler(async (req, res) => {
  const { contentId, listId } = req.body;

  const listItemExists = await ListItem.findOne({ contentId, listId });

  if (listItemExists) {
    await ListItem.deleteOne({ _id: listItemExists._id });
    await List.updateMany(
      { _id: listItemExists.listId },
      { $pull: { listItems: listItemExists._id } }
    );
  } else {
    const newListItem = await ListItem.create({ contentId, listId });
    if (!newListItem)
      throw new Error("Create New List Item Request has Failed!");

    await List.updateMany(
      { _id: newListItem.listId },
      { $push: { listItems: newListItem._id } }
    );

    const cover = await ListItem.findById(newListItem._id).populate(
      "contentId",
      "posterUrl"
    );

    await List.updateOne(
      { _id: cover.listId },
      { cover: cover.contentId.posterUrl }
    );
  }

  res.status(200).json({ msg: "success" });
});

// DELETE LIST ITEMS
// ROUTE - DELETE - /api/listitem/delete
// PRIVATE - USER
const deleteListItems = asyncHandler(async (req, res) => {
  const { listItemIds } = req.body;

  const listItem = await ListItem.findOne({ _id: listItemIds[0] });

  await List.updateMany(
    { _id: listItem.listId },
    { $pull: { listItems: { $in: listItemIds } } }
  );

  const deletedItems = await ListItem.deleteMany({ _id: { $in: listItemIds } });
  if (!deletedItems) throw new Error("Delete List Items Request has Failed!");

  res.status(200).json({ msg: "Deleted Successfully!" });
});

module.exports = {
  createListItem,
  deleteListItems,
};
