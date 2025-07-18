const { gql } = require("apollo-server-express");

const typeDefs = gql`

  type Message {
    id: ID!
    sender: User!
    receiver: User!
    message: String!
    createdAt: String!
  }
 
  type ZegoTokenResponse {
    token: String!
    roomID: String!
    userID: String!
    username: String!
    appID: Int!
    serverSecret: String!

  }


  type Query {
    getMessages(senderId: ID!, receiverId: ID!): [Message]
     joinvideocall(roomID:String!): ZegoTokenResponse!
  }

  type Mutation {
    sendMessage(senderId: ID!, receiverId: ID!, message: String!): Message
    deleteMessage(messageId: ID!): Boolean
  }
`;

module.exports = typeDefs;
