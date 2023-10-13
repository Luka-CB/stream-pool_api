const express = require("express");
const dotenv = require("dotenv");
require("colors");
const cors = require("cors");
const ConnectDB = require("./config/db");
const { notFound, errorHandler } = require("./middlewares/error");

dotenv.config();

ConnectDB();

const app = express();

app.use(express.json({ limit: "25mb" }));

app.use(
  cors({
    origin: ["http://localhost:8080", "https://stream-pool.vercel.app"],
    credentials: true,
  })
);

app.set("trust proxy", 1);

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/content", require("./routes/contentRoutes"));
app.use("/api/rating", require("./routes/ratingRoutes"));
app.use("/api/list", require("./routes/listRoutes"));
app.use("/api/listitem", require("./routes/listItemRoutes"));
app.use("/api/comment", require("./routes/commentRoutes"));
app.use("/api/misc", require("./routes/miscRoutes"));
app.use("/api/favorite", require("./routes/favoriteRoutes"));
app.use("/api/reply", require("./routes/replyRoutes"));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`The server is up and running on port ${PORT}`.magenta.bold)
);
