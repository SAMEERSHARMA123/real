const { gql } = require("apollo-server-express");

const typeDefs = gql`

  type User {
    id: ID!
    name: String!
    username: String!
    email: String!
    phone: String!
    password: String!
    createTime: String!
    token: String
    profileImage: String
    bio: String
    isOnline: Boolean           # Online status field
    lastActive: String          # Last active timestamp
    followers: [User]           # Suggestion System Support
    following: [User]           # Suggestion System Support
    posts: [Post]               # Added to support searchUsers query
    videos: [Video]             # User's videos
  }

  type OtpResponse {
    email: String!
    otp: Int!
    otpExpiryTime: String!
  }

  type Post {
    id: ID!
    caption: String
    imageUrl: String
    videoUrl: String
    thumbnailUrl: String
    isVideo: Boolean
    createdBy: User
    createdAt: String
    likes: [Like]
    comments: [Comment]
  }

  type Like {
    user: User
    likedAt: String
  }

  type Comment {
    id: ID!
    text: String
    user: User
    commentedAt: String
  }



  type Query {
    users: [User]
    getMe(userId: ID!) : User
    getAllPosts(userId : ID!): [Post]
    searchUsers(username: String!): [User]
    suggestedUsers(userId: ID!): [User]
  }

  type Mutation {
    requestOtp(
      name: String!
      username: String!
      email: String!
      password: String!
      phone: String!
    ): OtpResponse

    registerUser(email: String!, otp: Int!): User

    login(email: String!, password: String!): User

    logout: String

    changePassword(
      email: String!
      oldPassword: String!
      newPassword: String!
    ): String

    createPost(id: ID, caption: String!, image: Upload, video: Upload, thumbnail: Upload): Post
    DeletePost(id: ID!) : String!
    LikePost(userId: ID!,postId: ID!) : String!
    CommentPost(userId: ID!,postId: ID!, text:String!):[Comment]!

    editProfile(
      id: ID
      name: String
      username: String
      caption: String
      image: Upload
    ): User

    followAndUnfollow(id: ID!): User
    getUserInformation(id: ID!): User
  }
`;

module.exports = typeDefs;

