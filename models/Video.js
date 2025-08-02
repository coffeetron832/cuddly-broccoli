// /models/Video.js
const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema({
  filename: String,
  url: String,
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Video", VideoSchema);
