const asyncHandler = require("express-async-handler");
const List = require("../models/List");
const ListItem = require("../models/ListItem");

// CREATE NEW LIST
// ROUTE - POST - /api/list/create
// PRIVATE - USER
const createList = asyncHandler(async (req, res) => {
  const { title } = req.body;

  const listExists = await List.findOne({ title });
  if (listExists) throw new Error("List name already exists!");

  const newList = await List.create({
    title,
    userId: req.user._id,
  });

  if (!newList) throw new Error("Create New List Request has Failed!");

  res.status(200).json({ msg: "Created Successfully!" });
});

// GET LISTS
// ROUTE - GET - /api/list/lists/:contentId
// PRIVATE - USER
const getLists = asyncHandler(async (req, res) => {
  const { contentId } = req.params;

  const lists = await List.find({ userId: req.user._id })
    .populate("listItems", "contentId")
    .sort({
      createdAt: -1,
    });

  const modifiedLists = lists.map((list) => {
    const isInTheList = list.listItems.some(
      (item) => item.contentId.toString() === contentId.toString()
    );

    return { ...list._doc, isInTheList };
  });

  if (!lists) throw new Error("Get Lists Request has Failed!");
  res.status(200).json(modifiedLists);
});

// GET SOME USER LISTS
// ROUTE - GET - /api/list/fetch-some
// PRIVATE - USER
const getSomeUserLists = asyncHandler(async (req, res) => {
  const count = await List.countDocuments({ userId: req.user._id });
  const lists = await List.find({ userId: req.user._id })
    .limit(3)
    .select("_id title listItems cover createdAt updatedAt")
    .sort({
      createdAt: -1,
    });
  if (!lists) throw new Error("Get Lists Request has Failed!");

  const modifiedLists = lists.map((list) => {
    const listItemsCount = list.listItems.length;

    return { ...list._doc, listItems: listItemsCount };
  });

  res.status(200).json({ lists: modifiedLists, count });
});

// GET ALL USER LISTS
// ROUTE - GET - /api/list/fetch-all
// PRIVATE - USER
const getAllUserLists = asyncHandler(async (req, res) => {
  const { sort } = req.query;

  const count = await List.countDocuments({ userId: req.user._id });

  const sortVal =
    sort === "asc"
      ? { createdAt: 1 }
      : sort === "desc"
      ? { createdAt: -1 }
      : { createdAt: 1 };
  const lists = await List.find({ userId: req.user._id })
    .select("_id title listItems cover createdAt updatedAt")
    .sort(sortVal);
  if (!lists) throw new Error("Get Lists Request has Failed!");

  const modifiedLists = lists.map((list) => {
    const listItemsCount = list.listItems.length;

    return { ...list._doc, listItems: listItemsCount };
  });

  res.status(200).json({ lists: modifiedLists, count });
});

// UPDATE LIST
// ROUTE - PUT - /api/list/update
// PRIVATE - USER
const updateList = asyncHandler(async (req, res) => {
  const { title, listId } = req.body;

  const updatedList = await List.updateOne({ _id: listId }, { title });
  if (!updatedList) throw new Error("Update List Request has Failed!");

  res.status(200).json({ msg: "List Updated Successfully!" });
});

// DELETE LIST
// ROUTE - DELETE - /api/list/delete/:listId
// PRIVATE - USER
const deleteList = asyncHandler(async (req, res) => {
  const { listId } = req.params;

  const list = await List.findById(listId);

  await ListItem.deleteMany({ _id: { $in: list.listItems } });

  const deletedList = await List.deleteOne({ _id: listId });
  if (!deletedList) throw new Error("Delete List Request has Failed!");

  res.status(200).json({ msg: "Deleted Successfully!" });
});

module.exports = {
  createList,
  getLists,
  getSomeUserLists,
  getAllUserLists,
  updateList,
  deleteList,
};
