const bcrypt = require('bcryptjs');
const User = require('../Models/user');
const { sendOtpMail } = require('../Utils/otp');
const { user_token } = require('../Utils/token');
require('dotenv').config();

const { GraphQLUpload } = require('graphql-upload');
const Post = require('../Models/Post');
const { uploadToCloudinary } = require('../Utils/cloudinary');

const otpStore = {};

// Auto-clean expired OTPs
setInterval(() => {
  const now = new Date();
  Object.keys(otpStore).forEach(email => {
    if (otpStore[email].expiry < now) delete otpStore[email];
  });
}, 5 * 60 * 1000);

const resolvers = {
  Upload: GraphQLUpload,

  Query: {
    users: async () =>
      await User.find().select('id name username email phone profileImage bio createTime isOnline lastActive'),

      getMe: async (_ ,{userId}) =>{
        try{

     const st = await User.findOne({ _id: userId }).populate('posts')
    .populate('followers')
    .populate('following');
     
      return st
        }
        catch(error){
    console.log(error);
    return error
        }
      
      },
  
   getAllPosts: async (_, { userId }) => {
  return await Post.find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .populate("likes.user", "id name username profileImage")
    .populate("comments.user", "id name username profileImage");
},

//     getAllPosts: async () => {
//   return await Post.find()
//     .sort({ createdAt: -1 })
//     .populate("likes.user", "id name username profileImage")
//     .populate("comments.user", "id name username profileImage");
// },


    searchUsers: async (_, { username }) => {
      try {
        const users = await User.find({
          $or: [
            { name: { $regex: username, $options: 'i' } },
            { username: { $regex: username, $options: 'i' } }
          ]
        })
          .select('id name username email phone profileImage bio createTime followers following posts')
          .populate('followers', 'id name')
          .populate('following', 'id name')
          .populate({
            path: 'posts',
            select: 'id caption imageUrl createdAt likes comments',
            populate: [
              {
                path: 'likes.user',
                select: 'id name username profileImage'
              },
              {
                path: 'comments.user',
                select: 'id name username profileImage'
              }
            ]
          })
          .limit(10);

        return users;
      } catch (error) {
        console.error('Search users error:', error);
        throw new Error('Failed to search users');
      }
    },

   

    suggestedUsers: async (_, { userId }) => {
      try {
        const currentUser = await User.findById(userId).populate("following");
        if (!currentUser) throw new Error("User not found");

        const userFollowings = currentUser.following.map(u => u._id.toString());
        const potentialSuggestionsMap = {};

        for (let followedUserId of userFollowings) {
          const followedUser = await User.findById(followedUserId).populate("following");
          if (!followedUser) continue;

          followedUser.following.forEach(targetUser => {
            const id = targetUser._id.toString();
            if (
              id !== userId &&
              !userFollowings.includes(id) &&
              id !== currentUser._id.toString()
            ) {
              potentialSuggestionsMap[id] = (potentialSuggestionsMap[id] || 0) + 1;
            }
          });
        }

        const suggestedUserIdsWithScore = Object.entries(potentialSuggestionsMap)
          .sort((a, b) => b[1] - a[1]) // sort by mutual count
          .map(([id, score]) => ({ id, score }));

        // If suggestions exist
        if (suggestedUserIdsWithScore.length > 0) {
          // Fetch full user data and attach score
          const users = await User.find({
            _id: { $in: suggestedUserIdsWithScore.map(u => u.id) }
          })
          .populate('followers', 'id name')
          .populate('following', 'id name')
          .populate({
            path: 'posts',
            select: 'id caption imageUrl createdAt likes comments',
            populate: [
              {
                path: 'likes.user',
                select: 'id name username profileImage'
              },
              {
                path: 'comments.user',
                select: 'id name username profileImage'
              }
            ]
          });

          // Attach score and id to each user
          const usersWithScore = users.map(user => {
            const scoreObj = suggestedUserIdsWithScore.find(u => u.id === user._id.toString());
            return {
              ...user._doc,
              id: user._id.toString(), // ✅ Required fix
              suggestionScore: scoreObj ? scoreObj.score : 0
            };
          });

          return usersWithScore.sort((a, b) => b.suggestionScore - a.suggestionScore);
        }

        const fallbackUsers = await User.find({
          _id: { $nin: [...userFollowings, currentUser._id] }
        })
        .populate('followers', 'id name')
        .populate('following', 'id name')
        .populate({
          path: 'posts',
          select: 'id caption imageUrl createdAt likes comments',
          populate: [
            {
              path: 'likes.user',
              select: 'id name username profileImage'
            },
            {
              path: 'comments.user',
              select: 'id name username profileImage'
            }
          ]
        })
        .limit(5);
        console.log(fallbackUsers);

        // ✅ Add id here too
        return fallbackUsers.map(u => ({
          ...u._doc,
          id: u._id.toString(),
          suggestionScore: 0
        }));

        
      } catch (err) {
        console.error('suggestedUsers resolver error:', err);
        throw err;
      }
    },
  },

  Mutation: {
    requestOtp: async (_, { name, username, email, password, phone }) => {
      if (await User.findOne({ email })) throw new Error('User with this email already exists');
      if (await User.findOne({ username })) throw new Error('Username already taken');

      const otp = Math.floor(100000 + Math.random() * 900000);
      await sendOtpMail(email, otp);

      otpStore[email] = {
        otp,
        name,
        username,
        email,
        password,
        phone,
        expiry: new Date(Date.now() + 2 * 60 * 1000),
      };

      return { email, otp, otpExpiryTime: otpStore[email].expiry };
    },

    registerUser: async (_, { email, otp }, { res }) => {
      const entry = otpStore[email];
      if (!entry) throw new Error('No OTP requested');
      if (new Date() > entry.expiry) throw new Error('OTP expired');
      if (parseInt(otp) !== entry.otp) throw new Error('OTP not matched');
      if (await User.findOne({ email: entry.email })) throw new Error('User already exists');

      const user = new User({
        name: entry.name,
        username: entry.username,
        email: entry.email,
        password: await bcrypt.hash(entry.password, 10),
        phone: entry.phone,
        otp: entry.otp,
        createTime: new Date(),
        otpExpiryTime: entry.expiry,
      });

      await user.save();
      delete otpStore[email];

      const token = user_token(user);
      res.cookie("token", token);

      return user;
    },

    login: async (_, { email, password }, { res }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('User not found');
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error('Invalid credentials');

      const token = user_token(user);
      res.cookie("token", token);
      return user;
    },

    logout: async (_, __, { res }) => {
      res.clearCookie("token");
      return "User logged out successfully";
    },

    changePassword: async (_, { email, oldPassword, newPassword }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('User not found');
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) throw new Error('Old password incorrect');

      user.password = await bcrypt.hash(newPassword, 6);
      await user.save();
      return 'Password updated successfully';
    },

    // createPost: async (_, { id, caption, image, }) => {
    //   const imageUrl = await uploadToCloudinary(image);
    //   const safeCaption = typeof caption === 'undefined' || caption === null ? '' : caption;
    //   const post = await Post.create({ caption: safeCaption, imageUrl, createdBy: id });
    //   await User.findByIdAndUpdate(id, { $push: { posts: post._id } });
    //   return post;
    // },
    createPost: async (_, { id, caption, image, video }) => {
      let imageUrl = null;
      let videoUrl = null;
      if (image) {
        imageUrl = await uploadToCloudinary(image, 'image');
      }

    if (video) {
    if (video.size > 50 * 1024 * 1024) {
      throw new Error("Video should be under 50MB");
    }
    videoUrl = await uploadToCloudinary(video, 'video');
  }

      if (!imageUrl && !videoUrl) {
        throw new Error('Either image or video must be provided');
      }
      const post = await Post.create({ caption, imageUrl, videoUrl, createdBy: id });
      await User.findByIdAndUpdate(id, { $push: { posts: post._id } });
      return post;
    },
    
    DeletePost: async (_, { id}) => {      
      const deletePost = await Post.findByIdAndDelete(id);

if (deletePost) {
  const user = await User.findById(deletePost.createdBy);
  

  if (user) {
    user.posts = user.posts.filter(
      postId => postId.toString() !== deletePost._id.toString()
    );

    await user.save(); // 🔥 Ye important hai
  }
}
      return "DeletePost Successfully..."
    },

     CommentPost : async (_, { userId, postId, text }) => {
  if (!userId || !postId || !text.trim()) {
    throw new Error("Missing fields");
  }

  // 1. Create new comment
  const newComment = {
    user: userId,
    text,
    commentedAt: new Date(),
  };

  // 2. Find post and push comment
  const post = await Post.findById(postId);
  if (!post) throw new Error("Post not found");

  post.comments.push(newComment);
  await post.save();

  // await post.populate("comments.user");

  return post.comments;
},

    LikePost: async (_, { userId, postId }) => {
   
  if (!userId || !postId) {
    throw new Error("userId and postId are required");
  }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      throw new Error("Post not found");
    }

    const alreadyLiked = post.likes.some(like => like.user.toString() === userId);

    if (alreadyLiked) {
    // user unlike kar rha hai
      post.likes = post.likes.filter(like => like.user.toString() !== userId);
    } else {
      post.likes.push({ user: userId, likedAt: new Date() });
    }

    await post.save();
    
    return alreadyLiked ? "Unliked" : "Liked";
  } catch (error) {
    console.error("Like error:", error);
    throw new Error("Something went wrong while liking the post");
  }
},

    editProfile: async (_, { id, username, name, caption, image }) => {
      const user = await User.findById(id);
      if (!user) throw new Error("User not found");
      if (name) user.name = name;
      if (username && username !== user.username) {
        // Only check username uniqueness if it's being changed
        const existingUser = await User.findOne({ username });
        if (existingUser && existingUser._id.toString() !== user._id.toString()) {
          throw new Error("Username already taken");
        }
        user.username = username;
      }
      if (caption) user.bio = caption;
      if (image) user.profileImage = await uploadToCloudinary(image);
      await user.save();
      return user;
    },

    followAndUnfollow: async (_, { id }, context) => {
      if (!context?.user?.id) throw new Error("Unauthorized");
      const reqUserId = context.user.id;
      if (reqUserId === id) throw new Error("You cannot follow yourself");

      const [currentUser, targetUser] = await Promise.all([
        User.findById(reqUserId),
        User.findById(id),
      ]);

      if (!currentUser || !targetUser) throw new Error("User not found");

      const isFollowing = currentUser.following.includes(id);

      if (isFollowing) {
        await Promise.all([
          User.updateOne({ _id: reqUserId }, { $pull: { following: id } }),
          User.updateOne({ _id: id }, { $pull: { followers: reqUserId } }),
        ]);
      } else {
        await Promise.all([
          User.updateOne({ _id: reqUserId }, { $push: { following: id } }),
          User.updateOne({ _id: id }, { $push: { followers: reqUserId } }),
        ]);
      }

      return targetUser;
    },

    getUserInformation: async (_, { id }) => {
      const user = await User.findById(id);
      if (!user) throw new Error("User not found");
      return user;
    }
  },

  // ✅ NEWLY ADDED: Follower/Following Resolvers
  User: {
    followers: async (parent) => {
      const user = await User.findById(parent.id).populate("followers");
      return user.followers;
    },
    following: async (parent) => {
      const user = await User.findById(parent.id).populate("following");
      return user.following;
    },
  },

  // ✅ NEWLY ADDED: Post Resolvers for likes and comments
  Post: {
    likes: async (parent) => {
      if (parent.likes) {
        return parent.likes;
      }
      return [];
    },
    comments: async (parent) => {
      if (parent.comments) {
        return parent.comments;
      }
      return [];
    },
  },

  Like: {
    user: async (parent) => {
      if (parent.user && typeof parent.user === 'object') {
        return parent.user;
      }
      return null;
    },
    likedAt: (parent) => parent.likedAt,
  },

  Comment: {
    id: (parent) => parent._id || parent.id,
    user: async (parent) => {
      if (parent.user && typeof parent.user === 'object') {
        return parent.user;
      }
      return null;
    },
    commentedAt: (parent) => parent.commentedAt,
  }
};

module.exports = resolvers;
