
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String },

  username: { type: String, unique: true, sparse: true },

  email: { type: String, unique: true },

  password: { type: String },

  phone: { type: String },

  otp: { type: Number },

  createTime: {
    type: Date,
    default: Date.now,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  otpExpiryTime: {
    type: Date,
    required: true,
  },

  profileImage: {
    type: String,
    default: "",
  },

  bio: {
    type: String,
    default: "",
  },

  // Add online status field
  isOnline: {
    type: Boolean,
    default: false,
  },

  // Add last active timestamp
  lastActive: {
    type: Date,
    default: Date.now,
  },

  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],

  videos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
  ],

  bookmarks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
},
{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

