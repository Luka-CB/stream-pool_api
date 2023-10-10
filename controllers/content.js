const asyncHandler = require("express-async-handler");
const Content = require("../models/Content");
const Rating = require("../models/Rating");
const { uploadImage, removeImage } = require("../utils/cloudinary");
const Favorite = require("../models/Favorite");
const Listitem = require("../models/ListItem");
const List = require("../models/List");
const Comment = require("../models/Comment");
const Reply = require("../models/Reply");

// ADD NEW CONTENT
// ROUTE - POST - /api/content
// PRIVATE - ADMIN
const addNewContent = asyncHandler(async (req, res) => {
  const {
    title,
    startYear,
    endYear,
    description,
    genres,
    videoUrl,
    type,
    crew,
    image,
  } = req.body;

  const folderName = type === "tv" ? "tv_shows" : "movies";
  const fileName = `${title}_${startYear}`;
  const result = await uploadImage(image, folderName, fileName);
  if (!result) throw new Error("Upload image request has failed!");

  const newContent = await Content.create({
    title,
    startYear,
    endYear,
    description,
    genres,
    posterUrl: result.secure_url,
    imageId: result.public_id,
    videoUrl,
    type,
    crew,
  });

  if (!newContent) throw new Error("Create New Content Request has Failed!");

  res.status(200).json({ msg: "Added Successfully!" });
});

// GET MOVIES
// ROUTE - GET - /api/content/movies
// PUBLIC
const getMovies = asyncHandler(async (req, res) => {
  const { genre, year, sort, page, userId } = req.query;

  const keyword =
    genre && year
      ? {
          genres: {
            $in: genre || "",
          },
          startYear: year || "",
        }
      : genre
      ? {
          genres: {
            $in: genre || "",
          },
        }
      : year
      ? { startYear: year || "" }
      : {};

  let sortVal;

  if (sort === "r_asc") {
    sortVal = { "rating.avgRating": "asc" };
  } else if (sort === "r_desc") {
    sortVal = { "rating.avgRating": "desc" };
  } else if (sort === "y_asc") {
    sortVal = { startYear: "asc" };
  } else if (sort === "y_desc") {
    sortVal = { startYear: "desc" };
  } else {
    sortVal = { createdAt: "desc" };
  }

  const query = { type: "movie", ...keyword };
  const options = {
    sort: sortVal,
    page: page || 1,
    limit: 20,
  };

  const count = await Content.countDocuments({ type: "movie", ...keyword });

  const movies = await Content.paginate(query, options);
  if (!movies) throw new Error("Get Movies Request has Failed!");

  let content;

  const paginationData = {
    hasNextPage: movies.hasNextPage,
    hasPrevPage: movies.hasPrevPage,
    limit: movies.limit,
    nextPage: movies.nextPage,
    page: movies.page,
    pagingCounter: movies.pagingCounter,
    prevPage: movies.prevPage,
    totalDocs: movies.totalDocs,
    totalPages: movies.totalPages,
  };

  if (userId) {
    const favs = await Favorite.find({ userId });
    const ratings = await Rating.find({ user: userId });

    const modifiedMovies = movies.docs.map((doc) => {
      const isInFav = favs.some(
        (fav) => fav.contentId.toString() === doc._id.toString()
      );

      const ratedUserVal = ratings.find(
        (rating) => rating.content.toString() === doc._id.toString()
      );

      return {
        ...doc._doc,
        isInFavorite: isInFav,
        userRating: ratedUserVal
          ? { _id: ratedUserVal._id, value: ratedUserVal.value }
          : { _id: "", value: null },
      };
    });

    content = {
      movies: modifiedMovies,
      paginationData,
    };
  } else {
    content = {
      movies: movies.docs,
      paginationData,
    };
  }

  res.status(200).json({ content, count });
});

// GET TV SHOWS
// ROUTER - GET - /api/content/tvs
// PUBLIC
const getTvs = asyncHandler(async (req, res) => {
  const { genre, year, sort, page, userId } = req.query;

  const keyword =
    genre && year
      ? {
          genres: {
            $in: genre || "",
          },
          startYear: year || "",
        }
      : genre
      ? {
          genres: {
            $in: genre || "",
          },
        }
      : year
      ? { startYear: year || "" }
      : {};

  let sortVal;

  if (sort === "r_asc") {
    sortVal = { "rating.avgRating": "asc" };
  } else if (sort === "r_desc") {
    sortVal = { "rating.avgRating": "desc" };
  } else if (sort === "y_asc") {
    sortVal = { startYear: "asc" };
  } else if (sort === "y_desc") {
    sortVal = { startYear: "desc" };
  } else {
    sortVal = { createdAt: "desc" };
  }

  const query = { type: "tv", ...keyword };
  const options = {
    sort: sortVal,
    page: page || 1,
    limit: 20,
  };

  const count = await Content.countDocuments({ type: "tv", ...keyword });

  const tvs = await Content.paginate(query, options);
  if (!tvs) throw new Error("Get Tvs Request has Failed!");

  let content;

  const paginationData = {
    hasNextPage: tvs.hasNextPage,
    hasPrevPage: tvs.hasPrevPage,
    limit: tvs.limit,
    nextPage: tvs.nextPage,
    page: tvs.page,
    pagingCounter: tvs.pagingCounter,
    prevPage: tvs.prevPage,
    totalDocs: tvs.totalDocs,
    totalPages: tvs.totalPages,
  };

  if (userId) {
    const favs = await Favorite.find({ userId });
    const ratings = await Rating.find({ user: userId });

    const modifiedTvs = tvs.docs.map((doc) => {
      const isInFav = favs.some(
        (fav) => fav.contentId.toString() === doc._id.toString()
      );

      const ratedUserVal = ratings.find(
        (rating) => rating.content.toString() === doc._id.toString()
      );

      return {
        ...doc._doc,
        isInFavorite: isInFav,
        userRating: ratedUserVal
          ? { _id: ratedUserVal._id, value: ratedUserVal.value }
          : { _id: "", value: null },
      };
    });

    content = {
      tvs: modifiedTvs,
      paginationData,
    };
  } else {
    content = {
      tvs: tvs.docs,
      paginationData,
    };
  }

  res.status(200).json({ content, count });
});

// GET CONTENT BY ID
// ROUTE - GET - /api/content/fetch-one
// PUBLIC
const getSingleContent = asyncHandler(async (req, res) => {
  const { contentId, userId } = req.query;

  const content = await Content.findById(contentId);
  if (!content) throw new Error("Get Single Content Request has Failed!");

  let data;

  if (userId) {
    const isInFav = await Favorite.findOne({ userId, contentId });
    data = { ...content._doc, isInFavorite: isInFav ? true : false };
  } else {
    data = content;
  }

  res.status(200).json(data);
});

// GET CONTENT BY SEARCH QUERY
// ROUTE - GET - /api/content/search
// PUBLIC
const getContentBySearch = asyncHandler(async (req, res) => {
  const keyword = req.query.q
    ? {
        title: {
          $regex: req.query.q,
          $options: "i",
        },
      }
    : { title: "" };

  const count = await Content.countDocuments({ ...keyword });

  const content = await Content.find({ ...keyword });
  if (!content) throw new Error("Get Searched Content Request has Failed!");
  res.status(200).json({ content, count });
});

// UPDATE CONTENT BY ID
// ROUTE - PUT - /api/content/:id
// PRIVATE - ADMIN
const updateContent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, startYear, endYear, videoUrl, description, crew, genres } =
    req.body;

  const content = await Content.findById(id);

  if (content) {
    content.title = title || content.title;
    content.startYear = startYear || content.startYear;
    content.endYear = endYear || content.endYear;
    content.videoUrl = videoUrl || content.videoUrl;
    content.description = description || content.description;
    content.crew = crew || content.crew;
    content.genres = genres || content.genres;
  }

  const updatedContent = await content.save();
  if (!updatedContent) throw new Error("Update Content Request has Failed!");

  res.status(200).json({ msg: "Updated Successfully!" });
});

// UPDATE VIDEO URL
// ROUTE - PUT - /api/content/update_url
// PRIVATE - ADMIN
const updateVideoUrl = asyncHandler(async (req, res) => {
  const { contentId, url } = req.body;

  const updatedContent = await Content.updateOne(
    { _id: contentId },
    { videoUrl: url }
  );
  if (!updatedContent) throw new Error("Update video url request has failed!");

  res.status(200).json({ msg: "Url Updated Successfully!" });
});

// UPDATE POSTER
// ROUTE - PUT - /api/content/update_poster
// PRIVATE - ADMIN
const updatePoster = asyncHandler(async (req, res) => {
  const { image, contentId } = req.body;

  const content = await Content.findById(contentId);

  if (content.imageId) {
    await removeImage(content.imageId);
  }

  const folderName = content.type === "tv" ? "tv_shows" : "movies";
  const result = await uploadImage(image, folderName, content.title);
  if (!result) throw new Error("Something went wrong!");

  const updatedContent = await Content.updateOne(
    { _id: contentId },
    {
      posterUrl: result.secure_url,
      imageId: result.public_id,
    }
  );
  if (!updatedContent) throw new Error("Update poster request has failed!");

  res.status(200).json({ msg: "Poster Changed Successfully!" });
});

// DELETE CONTENT BY ID
// ROUTE - DELETE - /api/content/delete/:contentId
// PRIVATE - ADMIN
const deleteContent = asyncHandler(async (req, res) => {
  const { contentId } = req.params;

  const comments = await Comment.find({ contentId });
  const replyIds = comments.map((comment) => comment.replies).flat();
  await Reply.deleteMany({ _id: { $in: replyIds } });
  await Comment.deleteMany({ contentId });

  await Favorite.deleteMany({ contentId });

  const listItems = await Listitem.find({ contentId });
  const listItemIds = listItems.map((li) => li._id);
  const listIds = listItems.map((li) => li.listId);
  await List.updateMany(
    { _id: { $in: listIds } },
    { $pull: { listItems: { $in: listItemIds } } }
  );
  await Listitem.deleteMany({ contentId });

  await Rating.deleteMany({ content: contentId });

  const content = await Content.findById(contentId);
  if (content.imageId) {
    await removeImage(content.imageId);
  }

  const deletedContent = await Content.deleteOne({ _id: contentId });
  if (!deletedContent) throw new Error("Delete Content Request has failed!");

  res.status(200).json({ msg: "Deleted Successfully!" });
});

// GET USER'S RATED CONTENT FOR PROFILE
// ROUTE - GET - /api/content/rated/fetch-some
// PRIVATE - USER
const getSomeRatedContent = asyncHandler(async (req, res) => {
  const count = await Rating.countDocuments({ user: req.user._id });
  const ratings = await Rating.find({ user: req.user._id })
    .limit(5)
    .sort({ createdAt: -1 });

  const contentIds = ratings.map((rating) => rating.content);
  const ratedContent = await Content.find({ _id: { $in: contentIds } }).select(
    "_id posterUrl title startYear endYear rating type"
  );

  const modifiedRatedContent = ratedContent.map((rc) => {
    const ratedUserVal = ratings.find(
      (rating) => rating.content.toString() === rc._id.toString()
    );

    return {
      ...rc._doc,
      userRating: { _id: ratedUserVal._id, value: ratedUserVal.value },
    };
  });

  res.status(200).json({ content: modifiedRatedContent, count });
});
// GET ALL USER'S RATED CONTENT
// ROUTE - GET - /api/content/rated/fetch-all
// PRIVATE - USER
const getAllRatedContent = asyncHandler(async (req, res) => {
  const { filter, sort } = req.query;

  const options = filter
    ? { user: req.user._id, value: filter }
    : { user: req.user._id };

  const count = await Rating.countDocuments({ user: req.user._id });
  const ratings = await Rating.find({ ...options }).sort({
    createdAt: 1,
  });
  const contentIds = ratings.map((rating) => rating.content);
  const ratedContent = await Content.find({ _id: { $in: contentIds } }).select(
    "_id title startYear endYear description genres posterUrl type rating crew"
  );

  const modifiedRatedContent = ratedContent.map((rc) => {
    const userRating = ratings.find(
      (rating) => rating.content.toString() === rc._id.toString()
    );

    return {
      ...rc._doc,
      userRating: {
        _id: userRating._id,
        value: userRating.value,
        createdAt: userRating.createdAt,
      },
    };
  });

  const asc = (a, b) => {
    let x = new Date(a.userRating.createdAt),
      y = new Date(b.userRating.createdAt);

    return x > y ? 1 : -1;
  };
  const desc = (a, b) => {
    let x = new Date(a.userRating.createdAt),
      y = new Date(b.userRating.createdAt);

    return x > y ? -1 : 1;
  };

  let sortedContent;

  if (sort === "asc") {
    sortedContent = modifiedRatedContent.sort(asc);
  } else {
    sortedContent = modifiedRatedContent.sort(desc);
  }

  res.status(200).json({
    content: sortedContent,
    count,
  });
});

// GET USER'S FAVORITE CONTENT FOR PROFILE
// ROUTE - GET - /api/content/fav/fetch-some
// PRIVATE - USER
const getSomeFavContent = asyncHandler(async (req, res) => {
  const count = await Favorite.countDocuments({ userId: req.user._id });

  const favs = await Favorite.find({ userId: req.user._id }).limit(5);
  const contentIds = favs.map((fav) => fav.contentId);
  const favContents = await Content.find({ _id: { $in: contentIds } }).select(
    "_id title startYear endYear posterUrl type"
  );

  res.status(200).json({ content: favContents, count });
});

// GET USER'S FAVORITE CONTENT FOR PROFILE
// ROUTE - GET - /api/content/fav/fetch-some
// PRIVATE - USER
const getAllFavContent = asyncHandler(async (req, res) => {
  const { sort } = req.query;

  const count = await Favorite.countDocuments({
    userId: req.user._id,
  });

  const ratings = await Rating.find({ user: req.user._id });
  const favs = await Favorite.find({ userId: req.user._id });
  const contentIds = favs.map((fav) => fav.contentId);
  const favContents = await Content.find({ _id: { $in: contentIds } }).select(
    "_id title startYear endYear posterUrl type rating genres description crew"
  );

  const modifiedContents = favContents.map((content) => {
    const fav = favs.find(
      (fav) => fav.contentId.toString() === content._id.toString()
    );

    let rating;

    if (
      ratings.some(
        (rating) => rating.content.toString() === content._id.toString()
      )
    ) {
      const foundRating = ratings.find(
        (rating) => rating.content.toString() === content._id.toString()
      );
      rating = {
        _id: foundRating._id,
        value: foundRating.value,
      };
    } else {
      rating = null;
    }

    return {
      ...content._doc,
      userRating: rating,
      addedOn: fav.createdAt,
    };
  });

  const asc = (a, b) => {
    let x = new Date(a.addedOn),
      y = new Date(b.addedOn);

    return x > y ? 1 : -1;
  };
  const desc = (a, b) => {
    let x = new Date(a.addedOn),
      y = new Date(b.addedOn);

    return x > y ? -1 : 1;
  };

  let sortedContent;

  if (sort === "asc") {
    sortedContent = modifiedContents.sort(asc);
  } else {
    sortedContent = modifiedContents.sort(desc);
  }

  res.status(200).json({ content: sortedContent, count });
});

// GET LISTITEMS
// ROUTE - GET - /api/content/listitem/fetch-all
// PRIVATE - USER
const getListItems = asyncHandler(async (req, res) => {
  const { listId, sort } = req.query;

  const listItems = await Listitem.find({ listId });
  if (!listItems) throw new Error("Get List Item Request has Failed!");

  const contentIds = listItems.map((listitem) => listitem.contentId);

  const ratings = await Rating.find({ user: req.user._id });
  const favorites = await Favorite.find({ userId: req.user._id });

  const content = await Content.find({ _id: { $in: contentIds } }).select(
    "_id title startYear endYear posterUrl type rating genres description crew"
  );
  if (!content) throw new Error("Get Listitem Content Request has Failed!");

  const modifiedContent = content.map((item) => {
    const isInFav = favorites.some(
      (fav) => fav.contentId.toString() === item._id.toString()
    );

    const listitem = listItems.find(
      (listitem) => listitem.contentId.toString() === item._id.toString()
    );

    let rating;

    if (
      ratings.some(
        (rating) => rating.content.toString() === item._id.toString()
      )
    ) {
      const foundRating = ratings.find(
        (rating) => rating.content.toString() === item._id.toString()
      );
      rating = {
        _id: foundRating._id,
        value: foundRating.value,
      };
    } else {
      rating = null;
    }

    return {
      ...item._doc,
      userRating: rating,
      listItemId: listitem._id,
      isInFav,
      addedOn: listitem.createdAt,
    };
  });

  const asc = (a, b) => {
    let x = new Date(a.addedOn),
      y = new Date(b.addedOn);

    return x > y ? 1 : -1;
  };
  const desc = (a, b) => {
    let x = new Date(a.addedOn),
      y = new Date(b.addedOn);

    return x > y ? -1 : 1;
  };

  let sortedContent;

  if (sort === "asc") {
    sortedContent = modifiedContent.sort(asc);
  } else {
    sortedContent = modifiedContent.sort(desc);
  }

  const count = await Listitem.countDocuments({ listId });
  const list = await List.findById(listId);

  res
    .status(200)
    .json({ listTitle: list.title, listitems: sortedContent, count });
});

// GET LISTITEMS BY SEARCH
// ROUTE - GET - /api/content/listitem/search
// PRIVATE - USER
const getListItemsBySearch = asyncHandler(async (req, res) => {
  const { q } = req.query;

  const keyword = q
    ? {
        title: {
          $regex: q,
          $options: "i",
        },
      }
    : { title: "" };

  const content = await Content.find({ ...keyword }).select(
    "_id title startYear endYear posterUrl type"
  );
  if (!content) throw new Error("Get content by search request has failed!");

  res.status(200).json(content);
});

// GET LATEST TV SERIES
// ROUTE - GET - /api/content/tvs/latest
// PUBLIC
const getLatestTvs = asyncHandler(async (req, res) => {
  const { userId } = req.query;

  const tvs = await Content.find({ type: "tv" })
    .limit(15)
    .sort({ createdAt: "desc" });
  if (!tvs) throw new Error("Get latest tvs request has failed!");

  let content;

  if (userId) {
    const favs = await Favorite.find({ userId });
    const ratings = await Rating.find({ user: userId });

    const modifiedTvs = tvs.map((tv) => {
      const isInFav = favs.some(
        (fav) => fav.contentId.toString() === tv._id.toString()
      );

      const ratedUserVal = ratings.find(
        (rating) => rating.content.toString() === tv._id.toString()
      );

      return {
        ...tv._doc,
        isInFavorite: isInFav,
        userRating: ratedUserVal
          ? { _id: ratedUserVal._id, value: ratedUserVal.value }
          : { _id: "", value: null },
      };
    });

    content = modifiedTvs;
  } else {
    content = tvs;
  }

  res.status(200).json(content);
});

// GET LATEST MOVIES
// ROUTE - GET - /api/content/movies/latest
// PUBLIC
const getLatestMovies = asyncHandler(async (req, res) => {
  const { userId } = req.query;

  const movies = await Content.find({ type: "movie" })
    .limit(15)
    .sort({ createdAt: "desc" });
  if (!movies) throw new Error("Get latest movies request has failed!");

  let content;

  if (userId) {
    const favs = await Favorite.find({ userId });
    const ratings = await Rating.find({ user: userId });

    const modifiedMovies = movies.map((movie) => {
      const isInFav = favs.some(
        (fav) => fav.contentId.toString() === movie._id.toString()
      );

      const ratedUserVal = ratings.find(
        (rating) => rating.content.toString() === movie._id.toString()
      );

      return {
        ...movie._doc,
        isInFavorite: isInFav,
        userRating: ratedUserVal
          ? { _id: ratedUserVal._id, value: ratedUserVal.value }
          : { _id: "", value: null },
      };
    });

    content = modifiedMovies;
  } else {
    content = movies;
  }

  res.status(200).json(content);
});

module.exports = {
  addNewContent,
  getMovies,
  getTvs,
  getSingleContent,
  getContentBySearch,
  updateContent,
  updateVideoUrl,
  updatePoster,
  deleteContent,
  getSomeRatedContent,
  getAllRatedContent,
  getSomeFavContent,
  getAllFavContent,
  getListItems,
  getListItemsBySearch,
  getLatestTvs,
  getLatestMovies,
};
