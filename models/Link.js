const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Link', linkSchema);
