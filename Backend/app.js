
const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const { ApolloServer } = require('apollo-server-express');
const { graphqlUploadExpress } = require('graphql-upload');
const jwt = require('jsonwebtoken');
const http = require('http'); // ✅ Required for socket.io
const { Server } = require('socket.io');

require('dotenv').config();

// DB + TypeDefs + Resolvers
const DB = require('./DB/db');
const userTypeDefs = require('./UserGraphQL/typeDefs');
const userResolvers = require('./UserGraphQL/resolvers');
const chatTypeDefs = require('./ChatGraphQL/typeDefs');
const chatResolvers = require('./ChatGraphQL/resolvers');
const videoTypeDefs = require('./VideoGraphQL/typeDefs');
const videoResolvers = require('./VideoGraphQL/resolvers');

// Connect DB
DB();

const app = express();

// ✅ Increase Express JSON body limit for large uploads
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// ✅ Increase GraphQL upload limits to 100MB
app.use(graphqlUploadExpress({ 
  maxFileSize: 100*1024*1024,  // 100MB limit
  maxFiles: 2  // Allow video + thumbnail
}));

// Optional: GraphQL request logger
app.use('/graphql', express.json(), (req, res, next) => {
  if (req.method === 'POST') {
    console.log('📦 Incoming GraphQL Query:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Create HTTP server (for Socket.io)
const httpServer = http.createServer(app);

// Initialize socket.io
let io;
try {
  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3000',
      credentials: true,
    },
  });
} catch (error) {
  console.error("Error initializing Socket.io server:", error);
  // Create a dummy io object to prevent crashes
  io = {
    on: () => {},
    emit: () => {},
    to: () => ({ emit: () => {} })
  };
}

// Store `io` inside Express
app.set("io", io);

// Import User model for updating online status
const User = require('./Models/user');

// Track online users
const onlineUsers = new Map();

// Function to broadcast online users to all clients
const broadcastOnlineUsers = async () => {
  try {
    // Get all online users from database
    const dbOnlineUsers = await User.find({ isOnline: true }).select('_id');
    const dbOnlineUserIds = dbOnlineUsers.map(user => user._id.toString());
    
    // Get socket-connected users
    const socketUserIds = Array.from(onlineUsers.keys());
    
    // Use database as source of truth, but ensure all socket-connected users are included
    // This ensures consistency between what's in the database and what's broadcast
    const allOnlineUserIds = new Set([
      ...socketUserIds,
      ...dbOnlineUserIds
    ]);
    
    // Update database for any socket-connected users not marked as online
    for (const userId of socketUserIds) {
      if (!dbOnlineUserIds.includes(userId)) {
        await User.findByIdAndUpdate(userId, { 
          isOnline: true,
          lastActive: new Date()
        });
      }
    }
    
    console.log(`Broadcasting online users: ${Array.from(allOnlineUserIds)}`);
    io.emit("updateOnlineUsers", Array.from(allOnlineUserIds));
  } catch (error) {
    console.error("Error broadcasting online users:", error);
  }
};

// Periodically check and sync online users (every 5 seconds)
setInterval(async () => {
  try {
    console.log("Performing periodic online users sync...");
    
    // Get current time
    const now = new Date();
    
    // Set inactive time threshold (2 minutes)
    const inactiveThreshold = new Date(now - 2 * 60 * 1000); // 2 minutes ago
    
    // 1. Update socket-connected users to be online
    for (const userId of onlineUsers.keys()) {
      await User.findByIdAndUpdate(userId, { 
        isOnline: true,
        lastActive: new Date()
      });
    }
    
    // 2. Set users who haven't been active for 2 minutes to offline
    // This will fix users incorrectly showing as online
    await User.updateMany(
      { 
        isOnline: true, 
        lastActive: { $lt: inactiveThreshold },
        _id: { $nin: Array.from(onlineUsers.keys()) } // Don't affect socket-connected users
      },
      { 
        isOnline: false 
      }
    );
    
    // Debug: Log all online users from database
    const dbOnlineUsers = await User.find({ isOnline: true }).select('_id name lastActive');
    console.log("Users marked as online in database:", 
      dbOnlineUsers.map(u => ({ 
        id: u._id.toString(), 
        name: u.name,
        lastActive: u.lastActive
      }))
    );
    
    // Broadcast updated online users
    broadcastOnlineUsers();
  } catch (error) {
    console.error("Error in periodic online users sync:", error);
  }
}, 5000);
// Handle socket connections
io.on("connection", (socket) => {
  try {
    console.log("⚡ Socket connected:", socket.id);
    
    // Get userId from query params (sent during connection)
    const userId = socket.handshake.query.userId;
    
    // If userId exists in the connection query
    if (userId) {
      try {
        // Store user as online
        onlineUsers.set(userId, socket.id);
        socket.userId = userId;
        socket.join(userId);
        
        // Update user's online status in database
        User.findByIdAndUpdate(userId, { 
          isOnline: true,
          lastActive: new Date()
        })
        .then(() => {
          console.log(`🟢 User ${userId} connected and joined room`);
          console.log(`Current online users: ${Array.from(onlineUsers.keys())}`);
          
          // Broadcast updated online users list to all clients
          broadcastOnlineUsers();
        })
        .catch(err => console.error("Error updating user online status:", err));
      } catch (error) {
        console.error("Error handling socket connection with userId:", error);
      }
    } else {
      console.log("Socket connected without userId");
    }
    
    // Handle explicit join events (when user logs in after socket connection)
    socket.on("join", (userId) => {
      if (!userId) {
        console.warn("Join event received without userId");
        return;
      }
      
      try {
        // Update socket data and room
        socket.join(userId);
        socket.userId = userId;
        onlineUsers.set(userId, socket.id);
        
        // Update user's online status in database
        User.findByIdAndUpdate(userId, { 
          isOnline: true,
          lastActive: new Date()
        })
        .then(() => {
          console.log(`🟢 User explicitly joined room: ${userId}`);
          console.log(`Current online users: ${Array.from(onlineUsers.keys())}`);
          
          // Broadcast updated online users list
          broadcastOnlineUsers();
        })
        .catch(err => console.error("Error updating user online status:", err));
      } catch (error) {
        console.error("Error handling socket join:", error);
      }
    });

   socket.on("call-user", async ({ calleeID, roomID, callerID, callerName, callerImage }) => {
  const calleeSocketID = onlineUsers.get(calleeID); // ✅ Fixed here

  if (calleeSocketID) {
    try {
      // Get caller info from database if not provided
      let callerInfo = { callerName, callerImage };
      if (!callerName || !callerImage) {
        const caller = await User.findById(callerID).select('name profileImage');
        if (caller) {
          callerInfo.callerName = callerInfo.callerName || caller.name;
          callerInfo.callerImage = callerInfo.callerImage || caller.profileImage;
        }
      }

      io.to(calleeSocketID).emit("incoming-call", { 
        roomID, 
        callerID, 
        callerName: callerInfo.callerName,
        callerImage: callerInfo.callerImage
      });
      console.log(`📞 Call from ${callerID} (${callerInfo.callerName}) to ${calleeID}`);
    } catch (error) {
      console.error("Error processing call-user event:", error);
      // Fallback to basic call info
      io.to(calleeSocketID).emit("incoming-call", { roomID, callerID });
    }
  } else {
    console.log(`⚠️ Callee ${calleeID} not connected`);
  }
});

// Handle call accepted
socket.on("call-accepted", ({ callerID, roomID, calleeID }) => {
  const callerSocketID = onlineUsers.get(callerID);
  if (callerSocketID) {
    io.to(callerSocketID).emit("call-accepted", { roomID, calleeID });
    console.log(`✅ Call accepted by ${calleeID} for room ${roomID}`);
  }
});

// Handle call declined
socket.on("call-declined", ({ callerID, roomID }) => {
  const callerSocketID = onlineUsers.get(callerID);
  if (callerSocketID) {
    io.to(callerSocketID).emit("call-declined", { roomID });
    console.log(`❌ Call declined for room ${roomID}`);
  }
});

// Handle call cancelled
socket.on("call-cancelled", ({ roomID }) => {
  console.log(`🚫 Call cancelled for room ${roomID}`);
  // Notify all participants that call was cancelled
  io.emit("call-cancelled", { roomID });
});


    // Handle disconnections
    socket.on("disconnect", () => {
      try {
        console.log("❌ Socket disconnected:", socket.id);
        
        if (socket.userId) {
          console.log(`User ${socket.userId} went offline`);
          
          // Update user's offline status in database
          User.findByIdAndUpdate(socket.userId, { 
            isOnline: false,
            lastActive: new Date()
          })
          .then(() => {
            // Remove user from online list
            onlineUsers.delete(socket.userId);
            
            // Broadcast updated online users list
            broadcastOnlineUsers();
            console.log(`Updated online users: ${Array.from(onlineUsers.keys())}`);
          })
          .catch(err => console.error("Error updating user offline status:", err));
        }
      } catch (error) {
        console.error("Error handling socket disconnect:", error);
      }
    });
    
    // Handle getOnlineUsers request
    socket.on("getOnlineUsers", async () => {
      try {
        console.log("getOnlineUsers request received from client");
        // Immediately broadcast current online users to the requesting client
        broadcastOnlineUsers();
      } catch (error) {
        console.error("Error handling getOnlineUsers request:", error);
      }
    });
    
    // Handle ping event
    socket.on("ping", async () => {
      try {
        // If user is identified, update their last active time
        if (socket.userId) {
          await User.findByIdAndUpdate(socket.userId, { 
            isOnline: true,
            lastActive: new Date()
          });
          
          // Broadcast updated online users to all clients
          broadcastOnlineUsers();
        }
      } catch (error) {
        console.error("Error handling ping:", error);
      }
    });
  } catch (error) {
    console.error("Error in socket connection handler:", error);
  }
});

// Start Apollo Server
async function startServer() {
  const server = new ApolloServer({
    typeDefs: [userTypeDefs, chatTypeDefs, videoTypeDefs],
    resolvers: [userResolvers, chatResolvers, videoResolvers],
    context: ({ req, res }) => {
      const token = req.cookies.token;
      const io = req.app.get("io");

      if (!token) return { req, res, io };

      try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        return { req, res, user, io };
      } catch (err) {
        return { req, res, io };
      }
    },
    // ✅ Increase Apollo Server upload limits
    uploads: {
      maxFileSize: 100 * 1024 * 1024, // 100MB
      maxFiles: 2
    },
  });

  await server.start();

  server.applyMiddleware({
    app,
    cors: {
      origin: 'http://localhost:3000',
      credentials: true,
    },
  });

   app.get('/', (req, res) => {
    res.send('🚀 Server is running...');
  });
  
  // Debug route to check online users
  app.get('/debug/online-users', async (req, res) => {
    try {
      // Get socket-connected users
      const socketUsers = Array.from(onlineUsers.keys());
      
      // Get database online users
      const dbOnlineUsers = await User.find({ isOnline: true }).select('_id name lastActive');
      const dbOnlineUserIds = dbOnlineUsers.map(u => u._id.toString());
      
      // Force update all socket-connected users
      for (const userId of socketUsers) {
        await User.findByIdAndUpdate(userId, { 
          isOnline: true,
          lastActive: new Date()
        });
      }
      
      // Broadcast updated online users
      broadcastOnlineUsers();
      
      res.json({
        socketConnectedUsers: socketUsers,
        databaseOnlineUsers: dbOnlineUsers.map(u => ({ 
          id: u._id.toString(), 
          name: u.name,
          lastActive: u.lastActive
        })),
        allOnlineUsers: Array.from(new Set([...socketUsers, ...dbOnlineUserIds]))
      });
    } catch (error) {
      console.error("Error in debug route:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Route to manually clean up stale online statuses
  app.get('/debug/cleanup-online-status', async (req, res) => {
    try {
      // Get current time
      const now = new Date();
      
      // Set inactive time threshold (5 minutes)
      const inactiveThreshold = new Date(now - 5 * 60 * 1000); // 5 minutes ago
      
      // Find users who are marked as online but haven't been active recently
      const staleUsers = await User.find({
        isOnline: true,
        lastActive: { $lt: inactiveThreshold },
        _id: { $nin: Array.from(onlineUsers.keys()) } // Don't affect socket-connected users
      }).select('_id name lastActive');
      
      // Update these users to be offline
      const updateResult = await User.updateMany(
        { 
          isOnline: true, 
          lastActive: { $lt: inactiveThreshold },
          _id: { $nin: Array.from(onlineUsers.keys()) }
        },
        { isOnline: false }
      );
      
      // Broadcast updated online users
      broadcastOnlineUsers();
      
      res.json({
        message: "Cleaned up stale online statuses",
        staleUsers: staleUsers.map(u => ({ 
          id: u._id.toString(), 
          name: u.name,
          lastActive: u.lastActive,
          inactiveFor: Math.round((now - u.lastActive) / 1000 / 60) + " minutes"
        })),
        updateResult
      });
    } catch (error) {
      console.error("Error cleaning up online status:", error);
      res.status(500).json({ error: error.message });
    }
  });

  httpServer.listen(process.env.PORT || 5000, () => {
    console.log(`🚀 Apollo GraphQL running at http://localhost:5000${server.graphqlPath}`);
    console.log(`🔌 Socket.io running on same server`);
  });
}

startServer();

