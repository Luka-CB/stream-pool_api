const mongoose = require("mongoose");

const colorSchema = mongoose.Schema({
  color: { type: String, required: true },
  textColor: { type: String, enum: ["dark", "light"] },
});

const Color = mongoose.model("Color", colorSchema);

module.exports = Color;
