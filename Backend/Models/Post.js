
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  caption: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    
  },
  videoUrl: {
    type: String,
   
  },
  thumbnailUrl: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // ✅ Likes with timestamp
  likes: [
    {
      _id: false, // Disable automatic _id generation for likes
      _id: false, // Disable automatic _id generation for likes
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      likedAt: { type: Date, default: Date.now },
    }
  ],

  // ✅ Comments with timestamp
  comments: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: { type: String, required: true },
      commentedAt: { type: Date, default: Date.now },
    }
  ],
});

module.exports = mongoose.model("Post", postSchema);

