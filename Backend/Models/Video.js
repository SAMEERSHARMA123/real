const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  videoUrl: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
    default: "",
  },
  duration: {
    type: Number, // in seconds
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },

  // Video-specific interactions
  likes: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      likedAt: { type: Date, default: Date.now },
    }
  ],

  comments: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: { type: String, required: true },
      commentedAt: { type: Date, default: Date.now },
    }
  ],

  // Video-specific metadata
  tags: [String],
  category: {
    type: String,
    default: "general",
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  fileSize: {
    type: Number, // in bytes
    default: 0,
  },
  resolution: {
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
  },
});

// Update the updatedAt field before saving
videoSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Video", videoSchema);