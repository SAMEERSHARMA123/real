const { gql } = require("apollo-server-express");

const videoTypeDefs = gql`
  scalar Upload

  type Video {
    id: ID!
    title: String!
    description: String
    videoUrl: String!
    thumbnailUrl: String
    duration: Float
    views: Int
    createdBy: User!
    createdAt: String!
    updatedAt: String!
    likes: [VideoLike]
    comments: [VideoComment]
    tags: [String]
    category: String
    isPublic: Boolean
    fileSize: Float
    resolution: VideoResolution
  }

  type VideoLike {
    user: User!
    likedAt: String!
  }

  type VideoComment {
    id: ID!
    text: String!
    user: User!
    commentedAt: String!
  }

  type VideoResolution {
    width: Int
    height: Int
  }

  input VideoResolutionInput {
    width: Int
    height: Int
  }

  extend type Query {
    # Get all videos (public)
    getAllVideos: [Video]
    
    # Get videos by user
    getUserVideos(userId: ID!): [Video]
    
    # Get single video by ID
    getVideo(videoId: ID!): Video
    
    # Search videos by title/description
    searchVideos(searchTerm: String!): [Video]
    
    # Get videos by category
    getVideosByCategory(category: String!): [Video]
    
    # Get trending videos (most viewed/liked recently)
    getTrendingVideos(limit: Int): [Video]
  }

  type VideoViewResult {
    id: ID!
    views: Int!
  }

  extend type Mutation {
    # Upload new video
    uploadVideo(
      title: String!
      description: String
      video: Upload!
      thumbnail: Upload
      tags: [String]
      category: String
      isPublic: Boolean
      resolution: VideoResolutionInput
    ): Video

    # Update video details
    updateVideo(
      videoId: ID!
      title: String
      description: String
      thumbnail: Upload
      tags: [String]
      category: String
      isPublic: Boolean
    ): Video

    # Delete video
    deleteVideo(videoId: ID!): String

    # Like/Unlike video
    likeVideo(videoId: ID!): String

    # Add comment to video
    commentOnVideo(videoId: ID!, text: String!): [VideoComment]

    # Delete comment from video
    deleteVideoComment(videoId: ID!, commentId: ID!): [VideoComment]

    # Increment view count (legacy - for backward compatibility)
    incrementVideoViews(videoId: ID!): VideoViewResult
    
    # Track video view after minimum watch time
    trackVideoView(videoId: ID!): VideoViewResult
  }
`;

module.exports = videoTypeDefs;