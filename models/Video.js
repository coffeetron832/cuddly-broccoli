// /models/Video.js
const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema({
  filename: String,
  url: String,
  title: {
    type: String,
    default: "Sin título"
  },
  description: {
    type: String,
    default: ""
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Video", VideoSchema);

