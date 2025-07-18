import { gql } from "@apollo/client";

export const CREATE_POST = gql`
  mutation($id: ID!,$caption: String!, $image: Upload, $video: Upload) {
    createPost(id: $id,caption: $caption, image: $image, video: $video) {
      id
      caption
      imageUrl
      videoUrl
      createdAt
    }
  }
`;


export const GET_ALL_POSTS = gql`
  query getAllPosts($userId: ID!) {
    getAllPosts(userId: $userId) {
      id
      caption
      imageUrl
      videoUrl
      createdBy
      createdAt
      likes {
        user {
          id
        }
        likedAt
      }
      comments {
        id
        text
        user {
          id
          name
        }
        commentedAt
      }
    }
  }
`;



export const GET_ME = gql`
  query {
    getMe {
      id
      name
      username
      bio
      profileImage
      followers { id }
      following { id }
      posts { id }
    }
  }
`;


export const EDIT_PROFILE = gql`
 mutation editProfile(
  $id: ID!,
  $name: String,
  $username: String,
  $caption: String,
  $image: Upload
) {
  editProfile(
    id: $id,
    name: $name,
    username: $username,
    caption: $caption,
    image: $image
  ) {
    id
    name
    username
    email
    profileImage
    bio
  }
}

`;
export const REGISTER_MUTATION = gql`
  mutation Register($name: String!, $username: String!, $email: String!, $password: String!, $phone: String) {
    register(name: $name, username: $username, email: $email, password: $password, phone: $phone) {
      id
      name
      username
      email
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      id
      name
      email
    }
  }
`;


export const LOGOUT_MUTATION = gql`
  mutation {
    logout
  }
`;

export const SEARCH_USER = gql`
  query SearchUser($name: String!) {
    searchUser(name: $name) {
      id
      name
      profileImage
      bio 
    }
  }
`;

export const SEARCH_USERS = gql`
  query SearchUsers($searchTerm: String!) {
    searchUsers(searchTerm: $searchTerm) {
      id
      name
      username
      email
      phone
      profileImage
      bio
      createTime
      followers {
        id
        name
      }
      following {
        id
        name
      }
      posts {
        id
        caption
        imageUrl
        createdAt
      }
    }
  }
`;


export const GET_USER_INFO = gql`
  query getUserInformation($id: ID!) {
    getUserInformation(id: $id) {
      id
      name
      username
      bio
      profileImage
      followers {
        id
      }
      following {
        id
      }
      posts {
        id
      }
    }
  }
`;

export const FOLLOW_AND_UNFOLLOW = gql`
  mutation FollowAndUnfollow($id: ID!) {
    followAndUnfollow(id: $id) {
      id
      name
      username
      profileImage
      followers {
        id
        name
      }
      following {
        id
        name
      }
    }
  }
`;

export const SUGGESTED_USERS = gql`
  query GetSuggestions($userId: ID!) {
    suggestedUsers(userId: $userId) {
      id
      name
      username
      email
      phone
      profileImage
      bio
      createTime
      suggestionScore
    }
  }
`;

export const LIKE_POST = gql`
  mutation LikePost($userId: ID!, $postId: ID!) {
    LikePost(userId: $userId, postId: $postId)
  }
`;

export const COMMENT_POST = gql`
  mutation CommentPost($userId: ID!, $postId: ID!, $text: String!) {
    CommentPost(userId: $userId, postId: $postId, text: $text) {
      text
      commentedAt
      user {
        name
        username
        profileImage
      }
    }
  }
`;
