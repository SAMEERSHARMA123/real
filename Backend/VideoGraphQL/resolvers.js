const { GraphQLUpload } = require('graphql-upload');
const Video = require('../Models/Video');
const User = require('../Models/user');
const { uploadToCloudinary } = require('../Utils/cloudinary');

const videoResolvers = {
  Upload: GraphQLUpload,

  Query: {
    getAllVideos: async () => {
      try {
        return await Video.find({ isPublic: true })
          .sort({ createdAt: -1 })
          .populate("createdBy", "id name username profileImage")
          .populate("likes.user", "id name username profileImage")
          .populate("comments.user", "id name username profileImage");
      } catch (error) {
        console.error('Get all videos error:', error);
        throw new Error('Failed to fetch videos');
      }
    },

    getUserVideos: async (_, { userId }) => {
      try {
        return await Video.find({ createdBy: userId })
          .sort({ createdAt: -1 })
          .populate("createdBy", "id name username profileImage")
          .populate("likes.user", "id name username profileImage")
          .populate("comments.user", "id name username profileImage");
      } catch (error) {
        console.error('Get user videos error:', error);
        throw new Error('Failed to fetch user videos');
      }
    },

    getVideo: async (_, { videoId }) => {
      try {
        const video = await Video.findById(videoId)
          .populate("createdBy", "id name username profileImage")
          .populate("likes.user", "id name username profileImage")
          .populate("comments.user", "id name username profileImage");
        
        if (!video) {
          throw new Error('Video not found');
        }
        
        return video;
      } catch (error) {
        console.error('Get video error:', error);
        throw new Error('Failed to fetch video');
      }
    },

    searchVideos: async (_, { searchTerm }) => {
      try {
        return await Video.find({
          isPublic: true,
          $or: [
            { title: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { tags: { $in: [new RegExp(searchTerm, 'i')] } }
          ]
        })
          .sort({ createdAt: -1 })
          .populate("createdBy", "id name username profileImage")
          .populate("likes.user", "id name username profileImage")
          .populate("comments.user", "id name username profileImage")
          .limit(20);
      } catch (error) {
        console.error('Search videos error:', error);
        throw new Error('Failed to search videos');
      }
    },

    getVideosByCategory: async (_, { category }) => {
      try {
        return await Video.find({ category, isPublic: true })
          .sort({ createdAt: -1 })
          .populate("createdBy", "id name username profileImage")
          .populate("likes.user", "id name username profileImage")
          .populate("comments.user", "id name username profileImage");
      } catch (error) {
        console.error('Get videos by category error:', error);
        throw new Error('Failed to fetch videos by category');
      }
    },

    getTrendingVideos: async (_, { limit = 10 }) => {
      try {
        // Get videos from last 7 days, sorted by views and likes
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        return await Video.find({ 
          isPublic: true,
          createdAt: { $gte: sevenDaysAgo }
        })
          .sort({ views: -1, createdAt: -1 })
          .limit(limit)
          .populate("createdBy", "id name username profileImage")
          .populate("likes.user", "id name username profileImage")
          .populate("comments.user", "id name username profileImage");
      } catch (error) {
        console.error('Get trending videos error:', error);
        throw new Error('Failed to fetch trending videos');
      }
    },
  },

  Mutation: {
    uploadVideo: async (_, { title, description, video, thumbnail, tags, category, isPublic, resolution }, context) => {
      try {
        if (!context?.user?.id) {
          throw new Error("Unauthorized - Please login");
        }

        if (!title || !video) {
          throw new Error("Title and video file are required");
        }

        // Validate video file size (100MB limit)
        if (video.size && video.size > 100 * 1024 * 1024) {
          throw new Error("Video file size should be under 100MB");
        }

        // Upload video to cloudinary and get metadata
        const videoUploadResult = await uploadToCloudinary(video, 'video');
        
        // Upload thumbnail if provided
        let thumbnailUrl = "";
        if (thumbnail) {
          thumbnailUrl = await uploadToCloudinary(thumbnail, 'image');
        }

        // Extract video metadata from cloudinary response
        const videoUrl = videoUploadResult.url;
        const videoDuration = videoUploadResult.duration || 0;
        const videoResolution = {
          width: videoUploadResult.width || 0,
          height: videoUploadResult.height || 0
        };
        const videoFileSize = videoUploadResult.bytes || 0;

        console.log('📹 Video metadata:', {
          duration: videoDuration,
          resolution: videoResolution,
          fileSize: videoFileSize
        });

        // Create video document with proper metadata
        const newVideo = await Video.create({
          title,
          description: description || "",
          videoUrl,
          thumbnailUrl,
          duration: videoDuration,
          fileSize: videoFileSize,
          resolution: videoResolution,
          createdBy: context.user.id,
          tags: tags || [],
          category: category || "general",
          isPublic: isPublic !== false, // default to true
        });

        // Add video to user's videos array
        await User.findByIdAndUpdate(context.user.id, { 
          $push: { videos: newVideo._id } 
        });

        // Populate and return
        return await Video.findById(newVideo._id)
          .populate("createdBy", "id name username profileImage");

      } catch (error) {
        console.error('Upload video error:', error);
        throw new Error(error.message || 'Failed to upload video');
      }
    },

    updateVideo: async (_, { videoId, title, description, thumbnail, tags, category, isPublic }, context) => {
      try {
        if (!context?.user?.id) {
          throw new Error("Unauthorized - Please login");
        }

        const video = await Video.findById(videoId);
        if (!video) {
          throw new Error("Video not found");
        }

        // Check if user owns the video
        if (video.createdBy.toString() !== context.user.id) {
          throw new Error("You can only update your own videos");
        }

        // Update fields
        if (title) video.title = title;
        if (description !== undefined) video.description = description;
        if (tags) video.tags = tags;
        if (category) video.category = category;
        if (isPublic !== undefined) video.isPublic = isPublic;

        // Upload new thumbnail if provided
        if (thumbnail) {
          video.thumbnailUrl = await uploadToCloudinary(thumbnail, 'image');
        }

        await video.save();

        return await Video.findById(videoId)
          .populate("createdBy", "id name username profileImage")
          .populate("likes.user", "id name username profileImage")
          .populate("comments.user", "id name username profileImage");

      } catch (error) {
        console.error('Update video error:', error);
        throw new Error(error.message || 'Failed to update video');
      }
    },

    deleteVideo: async (_, { videoId }, context) => {
      try {
        if (!context?.user?.id) {
          throw new Error("Unauthorized - Please login");
        }

        const video = await Video.findById(videoId);
        if (!video) {
          throw new Error("Video not found");
        }

        // Check if user owns the video
        if (video.createdBy.toString() !== context.user.id) {
          throw new Error("You can only delete your own videos");
        }

        // Delete video
        await Video.findByIdAndDelete(videoId);

        // Remove video from user's videos array
        await User.findByIdAndUpdate(context.user.id, {
          $pull: { videos: videoId }
        });

        return "Video deleted successfully";

      } catch (error) {
        console.error('Delete video error:', error);
        throw new Error(error.message || 'Failed to delete video');
      }
    },

    likeVideo: async (_, { videoId }, context) => {
      try {
        if (!context?.user?.id) {
          throw new Error("Unauthorized - Please login");
        }

        const video = await Video.findById(videoId);
        if (!video) {
          throw new Error("Video not found");
        }

        const userId = context.user.id;
        const alreadyLiked = video.likes.some(like => like.user.toString() === userId);

        if (alreadyLiked) {
          // Unlike
          video.likes = video.likes.filter(like => like.user.toString() !== userId);
        } else {
          // Like
          video.likes.push({ user: userId, likedAt: new Date() });
        }

        await video.save();
        return alreadyLiked ? "Unliked" : "Liked";

      } catch (error) {
        console.error('Like video error:', error);
        throw new Error(error.message || 'Failed to like/unlike video');
      }
    },

    commentOnVideo: async (_, { videoId, text }, context) => {
      try {
        if (!context?.user?.id) {
          throw new Error("Unauthorized - Please login");
        }

        if (!text || !text.trim()) {
          throw new Error("Comment text is required");
        }

        const video = await Video.findById(videoId);
        if (!video) {
          throw new Error("Video not found");
        }

        const newComment = {
          user: context.user.id,
          text: text.trim(),
          commentedAt: new Date(),
        };

        video.comments.push(newComment);
        await video.save();

        // Return populated comments
        const updatedVideo = await Video.findById(videoId)
          .populate("comments.user", "id name username profileImage");
        
        return updatedVideo.comments;

      } catch (error) {
        console.error('Comment on video error:', error);
        throw new Error(error.message || 'Failed to add comment');
      }
    },

    deleteVideoComment: async (_, { videoId, commentId }, context) => {
      try {
        if (!context?.user?.id) {
          throw new Error("Unauthorized - Please login");
        }

        const video = await Video.findById(videoId);
        if (!video) {
          throw new Error("Video not found");
        }

        const comment = video.comments.id(commentId);
        if (!comment) {
          throw new Error("Comment not found");
        }

        // Check if user owns the comment or the video
        if (comment.user.toString() !== context.user.id && video.createdBy.toString() !== context.user.id) {
          throw new Error("You can only delete your own comments");
        }

        video.comments.pull(commentId);
        await video.save();

        // Return updated comments
        const updatedVideo = await Video.findById(videoId)
          .populate("comments.user", "id name username profileImage");
        
        return updatedVideo.comments;

      } catch (error) {
        console.error('Delete video comment error:', error);
        throw new Error(error.message || 'Failed to delete comment');
      }
    },

    incrementVideoViews: async (_, { videoId }, context) => {
      try {
        const video = await Video.findById(videoId);
        if (!video) {
          throw new Error("Video not found");
        }

        // Simply increment view count (no duplicate checking)
        const updatedVideo = await Video.findByIdAndUpdate(
          videoId,
          { $inc: { views: 1 } },
          { new: true }
        );
        
        console.log(`✅ View counted for video ${videoId}, new count: ${updatedVideo.views}`);
        return { id: updatedVideo._id, views: updatedVideo.views };

      } catch (error) {
        console.error('Increment video views error:', error);
        throw new Error('Failed to increment video views');
      }
    },

    trackVideoView: async (_, { videoId }, context) => {
      try {
        const video = await Video.findById(videoId);
        if (!video) {
          throw new Error("Video not found");
        }

        // Simply increment view count (no duplicate checking)
        const updatedVideo = await Video.findByIdAndUpdate(
          videoId,
          { $inc: { views: 1 } },
          { new: true }
        );
        
        console.log(`✅ View tracked for video ${videoId} after 3 seconds, new count: ${updatedVideo.views}`);
        return { id: updatedVideo._id, views: updatedVideo.views };

      } catch (error) {
        console.error('Track video view error:', error);
        throw new Error('Failed to track video view');
      }
    },
  },
};

module.exports = videoResolvers;