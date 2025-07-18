const chatSchema = require("./chatSchema");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv")
dotenv.config()
const {user_token} = require("../Utils/token")
const { ApolloError } = require("apollo-server-express");


module.exports = {
  Query: {
    joinvideocall: async (_, { roomID },{user}) => {
      console.log(user);
      
      try {
        const appID = process.env.APPIDV;
        const serverSecret = process.env.SERVERIDV;
        console.log(appID,serverSecret);
        
    
        if (!appID || !serverSecret) throw new ApolloError("Missing server credentials");
        if (!roomID) throw new ApolloError("Room ID is required");
    
        const userID = user.id;
        const username = user.username;
    
        // const effectiveTime = 3600; // Token valid for 1 hour
        // let currentTime = Math.floor(Date.now() / 1000);
        // let expireTime = currentTime + effectiveTime;
    
        const payloadObject = {
          room_id: roomID,
          user_id: userID,
          privilege: {
            1: 1, // Login room
            2: 1, // Publish stream
          },
          stream_id_list: null,
        };
    
        const payload = Buffer.from(JSON.stringify(payloadObject)).toString("base64");
        const nonce = crypto.randomBytes(16).toString("hex");
        const inputText = appID + userID + nonce  + payload;
    
        const hash = crypto
          .createHmac("sha256", serverSecret)
          .update(inputText)
          .digest("hex");
    
        const token = `${appID}.${userID}.${nonce}.${hash}.${payload}`;
    
        return {
          token,
          userID,
          username,
          appID,
        serverSecret
        };
    
      } 
      catch (error) {
  console.error("Error generating Zego token:", error);
  throw new ApolloError(error.message || "Failed to generate Zego token", "ZEGO_TOKEN_ERROR", {
    originalError: error,
  });
}

    },
      
   
    getMessages: async (_, { senderId, receiverId }) => {
      try {
        // Step 1: Dono users ke beech jitne bhi messages hain (A -> B ya B -> A)
        const messages = await chatSchema.find({
          $or: [
            { sender: senderId, receiver: receiverId },
            { sender: receiverId, receiver: senderId },
          ],
        }).sort({ createdAt: 1 }); // Step 2: Oldest to newest

        try {
          const formattedMessages = messages.map(msg => ({
            ...msg._doc,
            id: msg._id.toString(),
            sender: {
              ...msg.sender._doc,
              id: msg.sender._id.toString()
            },
            receiver: {
              ...msg.receiver._doc,
              id: msg.receiver._id.toString()
            }
          }));
          console.log(formattedMessages);
          return formattedMessages;
        } catch (error) {
          console.error("Error formatting messages:", error);
          // Return unformatted messages as fallback
          return messages;
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        throw new Error("Failed to fetch messages");
      }
    },
  },

  Mutation: {
    sendMessage: async (_, { senderId, receiverId, message }, context) => {
      try {
        const { io } = context;
        // Step 1: Message ko MongoDB me save karo
        const newMsg = await chatSchema.create({
          sender: senderId,
          receiver: receiverId,
          message: message,
        });

        try {
          const populatedMsg = await newMsg.populate("sender receiver");
          
          // Step 2: Real-time socket emit to receiver (agar socket connected hai)
          try {
            if (io) {
              io.to(receiverId).emit("receiveMessage", newMsg);
            }
          } catch (socketError) {
            console.error("Error emitting socket message:", socketError);
            // Continue execution even if socket fails
          }
          
          // Step 3: Message ko GraphQL mutation response me return karo
          return populatedMsg;
        } catch (populateError) {
          console.error("Error populating message:", populateError);
          return newMsg; // Return unpopulated message as fallback
        }
      } catch (error) {
        console.error("Error sending message:", error);
        throw new Error("Failed to send message");
      }
    },
    
    deleteMessage: async (_, { messageId }, context) => {
      try {
        const { io } = context;
        
        // Find the message first to get sender and receiver info
        const message = await chatSchema.findById(messageId).populate("sender receiver");
        
        if (!message) {
          throw new Error("Message not found");
        }
        
        // Delete the message from the database
        await chatSchema.findByIdAndDelete(messageId);
        
        // Emit socket event to notify clients about the deleted message
        if (io) {
          try {
            // Format the message ID for socket transmission
            const deleteInfo = {
              messageId: messageId,
              senderId: message.sender._id.toString(),
              receiverId: message.receiver._id.toString()
            };
            
            // Broadcast the delete event to all connected clients
            io.emit("messageDeleted", deleteInfo);
            console.log("Broadcasted message deletion to all clients:", deleteInfo);
          } catch (socketError) {
            console.error("Error emitting socket delete event:", socketError);
          }
        }
        
        return true; // Return success
      } catch (error) {
        console.error("Error deleting message:", error);
        throw new Error("Failed to delete message");
      }
    },
  },
};




